#!/usr/bin/env node
/**
 * Security validation suite — runs against the locally-applied migration chain
 * (baseline-forward) and exercises the security-critical paths for real:
 *
 *   1. handle_new_user trigger provisioning
 *   2. provision_teacher: happy path, wrong/revoked/expired/exhausted codes,
 *      and the JWT-GUC escape hatch actually flipping the role
 *   3. Role freeze: client role/tier escalation attempts are silently discarded
 *   4. RLS: cross-student reads return zero rows; student writes to
 *      server-owned tables are rejected
 *   5. join_class_by_code: enroll, idempotency, teacher self-join rejection
 *   6. U1 content seed: applies, is idempotent, and stays invisible to
 *      students while status='draft'
 *
 * Mirrors Supabase runtime defaults (role grants + JWT GUCs). PGlite engine =
 * Postgres 18; parity with the LIVE hosted DB still requires the owner's
 * credentials (plan 18 B1) — this suite validates the chain AS WRITTEN.
 */
import { readFileSync } from "fs";
import { createShimmedDb, applyAll } from "./apply-migrations.mjs";

const SEED = new URL("../../content/seed/u01-seed.sql", import.meta.url).pathname;

let passed = 0, failed = 0;
const fail = (name, detail) => { failed++; console.log(`  ✗ ${name}${detail ? " — " + detail : ""}`); };
const pass = (name) => { passed++; console.log(`  ✓ ${name}`); };
async function expect(name, fn) {
  try { const ok = await fn(); ok === false ? fail(name) : pass(name); }
  catch (e) { fail(name, String(e.message || e).slice(0, 160)); }
}

const db = await createShimmedDb();
const results = await applyAll(db, { from: "20260211" });
const bad = results.filter((r) => !r.ok);
if (bad.length) { console.log("MIGRATIONS FAILED — aborting", bad); process.exit(2); }
console.log(`migrations: ${results.length}/${results.length} applied`);

// Supabase default grants (RLS is the boundary, not privileges)
await db.exec(`
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role;
  GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;
  GRANT USAGE ON SCHEMA au