#!/usr/bin/env node
/**
 * BEHAVIORAL validation of the Workstream 2.1 grading-service schema against a
 * real Postgres engine (PGlite) with the full migration chain applied.
 *
 * Proves, not asserts-on-paper (plan 06 §2.3 answer-key protection, §6.2):
 *  1. The migration chain still applies cleanly.
 *  2. public.exercise_answer_keys exists with RLS enabled.
 *  3. `authenticated` has NO table privilege on exercise_answer_keys — a
 *     STRICTER posture than exercise_options (which still carries GRANT SELECT).
 *  4. There is NO RLS policy on the table (belt-and-braces deny for any
 *     non-superuser role even if a grant were later added by mistake).
 *  5. Functional: SET ROLE authenticated → SELECT is permission-denied.
 *  6. `service_role` retains full access (it is the only reader — submit-exercise).
 *  7. exercise_attempts gained the partial-credit / provenance columns.
 *
 * Run: node tools/db-harness/answerKeys.behavior.mjs
 */
import { createShimmedDb, applyAll } from "./apply-migrations.mjs";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? "  — " + detail : ""}`); }
};

const db = await createShimmedDb();
const results = await applyAll(db, { from: "20260211" });
const failedMig = results.filter((r) => !r.ok);
ok(`baseline-forward migration chain applies cleanly (${results.length} files)`,
   results.length >= 18 && failedMig.length === 0,
   failedMig.map((f) => f.file).join(", "));

// --- 2. table exists with RLS enabled ---
const rls = await db.query(
  `SELECT relrowsecurity FROM pg_class c JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND c.relname='exercise_answer_keys'`);
ok("exercise_answer_keys exists", rls.rows.length === 1);
ok("exercise_answer_keys has RLS enabled", rls.rows[0]?.relrowsecurity === true);

// --- 3. authenticated has NO privilege; contrast with exercise_options ---
const authSelect = await db.query(
  `SELECT has_table_privilege('authenticated','public.exercise_answer_keys','SELECT') AS p`);
ok("authenticated CANNOT SELECT exercise_answer_keys (no grant)", authSelect.rows[0].p === false);
const authInsert = await db.query(
  `SELECT has_table_privilege('authenticated','public.exercise_answer_keys','INSERT') AS p`);
ok("authenticated CANNOT INSERT exercise_answer_keys (no grant)", authInsert.rows[0].p === false);
const optSelect = await db.query(
  `SELECT has_table_privilege('authenticated','public.exercise_options','SELECT') AS p`);
ok("posture is stricter than exercise_options (which still grants SELECT)", optSelect.rows[0].p === true,
   "exercise_options should still carry its legacy GRANT SELECT");

// --- 4. no RLS policy at all (belt-and-braces) ---
const pols = await db.query(
  `SELECT count(*)::int AS n FROM pg_policy p JOIN pg_class c ON c.oid=p.polrelid
   JOIN pg_namespace n ON n.oid=c.relnamespace
   WHERE n.nspname='public' AND c.relname='exercise_answer_keys'`);
ok("exercise_answer_keys has ZERO RLS policies (deny-by-default)", pols.rows[0].n === 0,
   `found ${pols.rows[0].n} policies`);

// --- 5. functional deny: an authenticated session cannot read the key store ---
let denied = false;
await db.exec("SET ROLE authenticated");
try {
  await db.query("SELECT * FROM public.exercise_answer_keys LIMIT 1");
} catch {
  denied = true;
}
await db.exec("RESET ROLE");
ok("SET ROLE authenticated → SELECT exercise_answer_keys is permission-denied", denied);

// --- 6. service_role retains access (the only reader) ---
const svc = await db.query(
  `SELECT has_table_privilege('service_role','public.exercise_answer_keys','SELECT') AS s,
          has_table_privilege('service_role','public.exercise_answer_keys','INSERT') AS i`);
ok("service_role can read the key store", svc.rows[0].s === true);
ok("service_role can write the key store", svc.rows[0].i === true);

// --- 7. exercise_attempts gained the grading columns (06 §E9/§6.2) ---
const cols = await db.query(
  `SELECT column_name FROM information_schema.columns
   WHERE table_schema='public' AND table_name='exercise_attempts'`);
const names = cols.rows.map((r) => r.column_name);
const need = ["score", "passed", "hint_level", "tier", "grader_version", "response"];
ok("exercise_attempts gained score/passed/hint_level/tier/grader_version/response",
   need.every((c) => names.includes(c)),
   `missing: ${need.filter((c) => !names.includes(c)).join(", ") || "none"}`);
ok("is_correct is preserved as the pipeline's pass boolean", names.includes("is_correct"));

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
