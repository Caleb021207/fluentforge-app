#!/usr/bin/env node
/**
 * Local migration harness — applies the ENTIRE supabase/migrations chain to an
 * in-process WASM Postgres (PGlite) with Supabase-environment shims, then
 * reports per-file results and dumps a schema snapshot.
 *
 * WHAT THIS PROVES: the migration chain is internally consistent and the
 * triggers/RPCs behave as written on a real Postgres 18 engine.
 * WHAT IT CANNOT PROVE: parity with the LIVE hosted database (drift is a known
 * risk — plan 18 B1); Supabase-managed internals (GoTrue, storage service,
 * realtime, pg_cron scheduling) are shimmed, not emulated.
 *
 * Usage: node tools/db-harness/apply-migrations.mjs [--snapshot out.md]
 */
import { PGlite } from "@electric-sql/pglite";
import { pgcrypto } from "@electric-sql/pglite/contrib/pgcrypto";
import { uuid_ossp } from "@electric-sql/pglite/contrib/uuid_ossp";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { citext } from "@electric-sql/pglite/contrib/citext";
import { readdirSync, readFileSync, writeFileSync } from "fs";
import { join } from "path";

const MIGRATIONS_DIR = new URL("../../supabase/migrations", import.meta.url).pathname;

export async function createShimmedDb() {
  const db = new PGlite({ extensions: { pgcrypto, uuid_ossp, pg_trgm, citext } });

  // ---- Supabase environment shims (documented, minimal, honest) ----
  await db.exec(`
    CREATE EXTENSION IF NOT EXISTS pgcrypto;
    CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
    CREATE EXTENSION IF NOT EXISTS pg_trgm;
    CREATE EXTENSION IF NOT EXISTS citext;

    -- Roles Supabase provisions
    DO $$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='anon') THEN CREATE ROLE anon NOLOGIN; END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='authenticated') THEN CREATE ROLE authenticated NOLOGIN; END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='service_role') THEN CREATE ROLE service_role NOLOGIN BYPASSRLS; END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='supabase_admin') THEN CREATE ROLE supabase_admin NOLOGIN; END IF;
      IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname='postgres') THEN CREATE ROLE postgres NOLOGIN; END IF;
    END $$;

    -- extensions schema + digest wrappers (Supabase installs pgcrypto there)
    CREATE SCHEMA IF NOT EXISTS extensions;
    CREATE OR REPLACE FUNCTION extensions.digest(data text, type text)
      RETURNS bytea LANGUAGE sql IMMUTABLE AS $$ SELECT public.digest(data, type) $$;
    CREATE OR REPLACE FUNCTION extensions.digest(data bytea, type text)
      RETURNS bytea LANGUAGE sql IMMUTABLE AS $$ SELECT public.digest(data, type) $$;
    CREATE OR REPLACE FUNCTION extensions.gen_random_uuid()
      RETURNS uuid LANGUAGE sql AS $$ SELECT gen_random_uuid() $$;

    -- auth schema: users + GUC-backed uid()/role()/jwt()/email(), mirroring
    -- Supabase (request.jwt.claim.sub legacy GUC, request.jwt.claims JSON).
    CREATE SCHEMA IF NOT EXISTS auth;
    CREATE TABLE IF NOT EXISTS auth.users (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      email text UNIQUE,
      encrypted_password text,
      raw_user_meta_data jsonb DEFAULT '{}'::jsonb,
      raw_app_meta_data jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now(),
      updated_at timestamptz DEFAULT now(),
      email_confirmed_at timestamptz,
      last_sign_in_at timestamptz
    );
    CREATE OR REPLACE FUNCTION auth.uid() RETURNS uuid LANGUAGE sql STABLE AS $$
      SELECT COALESCE(
        NULLIF(current_setting('request.jwt.claim.sub', true), ''),
        NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'sub'
      )::uuid
    $$;
    CREATE OR REPLACE FUNCTION auth.role() RETURNS text LANGUAGE sql STABLE AS $$
      SELECT COALESCE(
        NULLIF(current_setting('request.jwt.claim.role', true), ''),
        NULLIF(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role',
        'anon'
      )
    $$;
    CREATE OR REPLACE FUNCTION auth.jwt() RETURNS jsonb LANGUAGE sql STABLE AS $$
      SELECT COALESCE(NULLIF(current_setting('request.jwt.claims', true), '')::jsonb, '{}'::jsonb)
    $$;
    CREATE OR REPLACE FUNCTION auth.email() RETURNS text LANGUAGE sql STABLE AS $$
      SELECT auth.jwt() ->> 'email'
    $$;

    -- storage shim (legacy migrations attach policies to storage.objects)
    CREATE SCHEMA IF NOT EXISTS storage;
    CREATE TABLE IF NOT EXISTS storage.buckets (
      id text PRIMARY KEY, name text NOT NULL, public boolean DEFAULT false,
      created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now(),
      file_size_limit bigint, allowed_mime_types text[]
    );
    CREATE TABLE IF NOT EXISTS storage.objects (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      bucket_id text REFERENCES storage.buckets(id),
      name text, owner uuid, metadata jsonb DEFAULT '{}'::jsonb,
      created_at timestamptz DEFAULT now(), updated_at timestamptz DEFAULT now()
    );
    ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    CREATE OR REPLACE FUNCTION storage.foldername(name text)
      RETURNS text[] LANGUAGE sql IMMUTABLE AS $$ SELECT string_to_array(name, '/') $$;

    -- pg_cron shim: migrations may schedule jobs; scheduling is a no-op here.
    CREATE SCHEMA IF NOT EXISTS cron;
    CREATE TABLE IF NOT EXISTS cron.job (jobid bigint GENERATED ALWAYS AS IDENTITY, schedule text, command text, jobname text);
    CREATE OR REPLACE FUNCTION cron.schedule(job_name text, schedule text, command text)
      RETURNS bigint LANGUAGE plpgsql AS $$
      DECLARE jid bigint;
      BEGIN INSERT INTO cron.job (schedule, command, jobname) VALUES (schedule, command, job_name) RETURNING jobid INTO jid; RETURN jid; END $$;
    CREATE OR REPLACE FUNCTION cron.unschedule(job_name text) RETURNS boolean LANGUAGE sql AS $$ SELECT true $$;

    -- realtime publication shim
    DO $$ BEGIN
      IF NOT EXISTS (SELECT FROM pg_publication WHERE pubname='supabase_realtime') THEN
        CREATE PUBLICATION supabase_realtime;
      END IF;
    END $$;

    -- vault shim (some templates reference it)
    CREATE SCHEMA IF NOT EXISTS vault;
  `);
  return db;
}

export async function applyAll(db, { verbose = false, from = null } = {}) {
  let files = readdirSync(MIGRATIONS_DIR).filter((f) => f.endsWith(".sql")).sort();
  // Baseline mode: the 2026-02-11 consolidated migration is a deliberate
  // schema reset [observed wip-15a]; the pre-baseline legacy chain is NOT
  // replayable on a fresh database (verified: it collides with the baseline).
  // Replaying from the baseline forward reflects intended current truth.
  if (from) files = files.filter((f) => f >= from);
  const results = [];
  for (const f of files) {
    const sql = readFileSync(join(MIGRATIONS_DIR, f), "utf8");
    try {
      await db.exec("BEGIN");
      await db.exec(sql);
      await db.exec("COMMIT");
      results.push({ file: f, ok: true });
      if (verbose) console.log(`OK    ${f}`);
    } catch (e) {
      try { await db.exec("ROLLBACK"); } catch { /* ignore */ }
      results.push({ file: f, ok: false, error: String(e.message || e).slice(0, 300) });
      if (verbose) console.log(`FAIL  ${f}\n      ${String(e.message).slice(0, 200)}`);
    }
  }
  return results;
}

export async function snapshot(db) {
  const tables = await db.query(`
    SELECT table_schema, table_name FROM information_schema.tables
    WHERE table_schema IN ('public','auth','storage') AND table_type='BASE TABLE'
    ORDER BY 1,2`);
  const out = [];
  for (const t of tables.rows) {
    const cols = await db.query(
      `SELECT column_name, data_type, is_nullable, column_default
       FROM information_schema.columns WHERE table_schema=$1 AND table_name=$2 ORDER BY ordinal_position`,
      [t.table_schema, t.table_name],
    );
    const rls = await db.query(
      `SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
       WHERE n.nspname=$1 AND c.relname=$2`,
      [t.table_schema, t.table_name],
    );
    const pols = await db.query(
      `SELECT polname FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
       JOIN pg_namespace n ON n.oid=c.relnamespace WHERE n.nspname=$1 AND c.relname=$2`,
      [t.table_schema, t.table_name],
    );
    out.push({
      table: `${t.table_schema}.${t.table_name}`,
      rls: rls.rows[0]?.relrowsecurity ?? false,
      policies: pols.rows.map((r) => r.polname),
      columns: cols.rows.map((c) => `${c.column_name} ${c.data_type}${c.is_nullable === "NO" ? " NOT NULL" : ""}`),
    });
  }
  return out;
}

const isMain = process.argv[1] && import.meta.url.endsWith(process.argv[1].split("/").pop());
if (isMain) {
  const db = await createShimmedDb();
  const fromIdx = process.argv.indexOf("--from");
  const from = fromIdx > -1 ? process.argv[fromIdx + 1] : null;
  const results = await applyAll(db, { verbose: true, from });
  const ok = results.filter((r) => r.ok).length;
  const fail = results.filter((r) => !r.ok);
  console.log(`\n=== ${ok}/${results.length} migrations applied ===`);
  for (const f of fail) console.log(`FAILED: ${f.file}\n  ${f.error}`);

  const snapIdx = process.argv.indexOf("--snapshot");
  if (snapIdx > -1) {
    const snap = await snapshot(db);
    const md = [
      "# Local migration-chain schema snapshot",
      "",
      "Produced by tools/db-harness/apply-migrations.mjs on PGlite (Postgres " +
        (await db.query("show server_version")).rows[0].server_version +
        "). This is the schema AS WRITTEN BY MIGRATIONS — live-DB drift (plan 18 B1) is NOT ruled out.",
      `Applied: ${ok}/${results.length}. Failures: ${fail.length ? fail.map((f) => f.file).join(", ") : "none"}.`,
      "",
      ...snap.map((t) =>
        [`## ${t.table}`, `RLS: ${t.rls} · policies: ${t.policies.join(", ") || "—"}`, "```", ...t.columns, "```", ""].join("\n"),
      ),
    ].join("\n");
    writeFileSync(process.argv[snapIdx + 1] || "schema-snapshot.md", md);
    console.log(`snapshot written (${snap.length} tables)`);
  }
  process.exit(fail.length ? 1 : 0);
}
