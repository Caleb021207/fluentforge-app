#!/usr/bin/env node
/**
 * BEHAVIORAL validation of the WS 2.3 pooled voice allowance against a real
 * Postgres engine (PGlite) with the full baseline-forward migration chain
 * applied — the security- and billing-critical paths, proven not asserted:
 *
 *   1. ensure_voice_pool sizes allocation from the activated-student roster
 *      (seats × 1000 total, × 400 realtime reserve — 16 §7).
 *   2. A fresh pool serves realtime and non-realtime at their requested tier.
 *   3. "Realtime protected, drills degrade first": once the general allowance
 *      is spent, a non-realtime turn degrades to the free cached route while,
 *      in the SAME pool state, realtime is still served from the reserve.
 *   4. "Realtime is the last to yield": at full pool exhaustion realtime
 *      degrades to text.
 *   5. NEVER overages: an oversized request books zero; a full drain lands
 *      exactly on minutes_allocated and one more request books nothing.
 *   6. Admin notification fires at 80% pool consumption.
 *   7. RLS: a student sees zero pool rows; a teacher sees only their own
 *      school's pool; a cross-school teacher sees none; a global admin sees it.
 *   8. Privilege posture: authenticated may SELECT but NOT write the pool, and
 *      may NOT EXECUTE consume_voice_minutes / ensure_voice_pool; service_role
 *      can (edge functions are the only writers).
 *
 * Mirrors the pure reference module supabase/functions/_shared/voicePool.ts.
 * PGlite = Postgres 18; live-DB parity still needs the owner's creds (plan 18
 * B1) — this validates the chain AS WRITTEN.
 *
 * Run: node tools/db-harness/voicePool.behavior.mjs
 */
import { createShimmedDb, applyAll } from "./apply-migrations.mjs";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? "  — " + detail : ""}`); }
};

async function setJwt(db, uid, role = "authenticated") {
  await db.exec(`SELECT set_config('request.jwt.claim.sub', '${uid}', false);
                 SELECT set_config('request.jwt.claim.role', '${role}', false);
                 SELECT set_config('request.jwt.claims', '${JSON.stringify({ sub: uid, role })}', false);`);
}
async function clearJwt(db) {
  await db.exec(`SELECT set_config('request.jwt.claim.sub', '', false);
                 SELECT set_config('request.jwt.claim.role', 'anon', false);
                 SELECT set_config('request.jwt.claims', '', false);`);
}
/** Count pool rows visible to `uid` as the authenticated role (RLS enforced). */
async function poolRowsVisibleTo(db, uid) {
  await setJwt(db, uid, "authenticated");
  await db.exec("SET ROLE authenticated");
  try {
    const r = await db.query(`SELECT count(*)::int AS n FROM public.institution_voice_pools`);
    return r.rows[0].n;
  } finally {
    await db.exec("RESET ROLE");
    await clearJwt(db);
  }
}
const consume = async (db, school, minutes, isRealtime) =>
  (await db.query(`SELECT public.consume_voice_minutes($1,$2,$3) AS r`, [school, minutes, isRealtime])).rows[0].r;

const db = await createShimmedDb();
const results = await applyAll(db, { from: "20260211" });
const failedMig = results.filter((r) => !r.ok);
ok(`baseline-forward migration chain applies cleanly (${results.length} files)`,
   results.length >= 18 && failedMig.length === 0,
   failedMig.map((f) => f.file + ": " + f.error).join(", "));

// Supabase-default privileges the policy subqueries need (schema usage + the
// two policy helpers + profiles SELECT). Deliberately NOT a blanket GRANT ALL,
// so the pool table/function privilege posture stays exactly as the migration
// set it (see tests 8).
await db.exec(`
  GRANT USAGE ON SCHEMA public TO authenticated, anon, service_role;
  GRANT USAGE ON SCHEMA auth TO authenticated, anon, service_role;
  GRANT EXECUTE ON FUNCTION auth.uid() TO authenticated, anon;
  GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon, service_role;
  GRANT SELECT ON public.profiles TO authenticated;
`);

// --- seed: one school with one activated student, a teacher, a cross-school
// teacher, and a global admin. Seed as anon (auth.uid() NULL => the profile
// freeze trigger treats it as privileged, so role/school_id are settable). ---
await clearJwt(db);
const schoolA = "aaaaaaaa-0000-0000-0000-0000000000a1";
const schoolB = "aaaaaaaa-0000-0000-0000-0000000000b2";
await db.query(`INSERT INTO public.schools (id, name) VALUES ($1,'School A'),($2,'School B')`, [schoolA, schoolB]);

const student = "11111111-0000-0000-0000-000000000001";
const teacherA = "22222222-0000-0000-0000-000000000002";
const teacherB = "33333333-0000-0000-0000-000000000003";
const admin = "44444444-0000-0000-0000-000000000004";
for (const [id, email, role, school] of [
  [student, "stu@e.dev", "student", schoolA],
  [teacherA, "ta@e.dev", "teacher", schoolA],
  [teacherB, "tb@e.dev", "teacher", schoolB],
  // Global admin via user_roles below — NOT on any school roster, so it does
  // not inflate School A's activated-seat count.
  [admin, "ad@e.dev", "student", null],
]) {
  await db.query(`INSERT INTO auth.users (id, email) VALUES ($1,$2)`, [id, email]);
  await db.query(
    `INSERT INTO public.profiles (id, email, role, school_id) VALUES ($1,$2,$3,$4)
     ON CONFLICT (id) DO UPDATE SET role=EXCLUDED.role, school_id=EXCLUDED.school_id`,
    [id, email, role, school],
  );
}
await db.query(`INSERT INTO public.user_roles (user_id, role) VALUES ($1,'admin')`, [admin]);

// --- TEST 1: provisioning sizes from the roster (1 activated student on A) ---
const prov = (await db.query(`SELECT row_to_json(r) j FROM public.ensure_voice_pool($1) r`, [schoolA])).rows[0].j;
ok("ensure_voice_pool sizes 1 seat → 1000 total / 400 realtime reserve",
   prov.seats === 1 && Number(prov.minutes_allocated) === 1000 && Number(prov.realtime_reserved_minutes) === 400,
   JSON.stringify(prov));

// --- TEST 2: fresh pool serves both routes at the requested tier ---
const fresh1 = await consume(db, schoolA, 30, true);
const fresh2 = await consume(db, schoolA, 30, false);
ok("fresh pool serves realtime at realtime", fresh1.route === "realtime" && fresh1.allowed === true, JSON.stringify(fresh1));
ok("fresh pool serves non-realtime at cascade", fresh2.route === "cascade" && fresh2.allowed === true, JSON.stringify(fresh2));

// --- TEST 3: drills degrade first / realtime protected ---
// Spend the rest of the general allowance (already 30+30 used; 570 more nonrt = 600 nonrt).
await consume(db, schoolA, 570, false);
const nonRtDegraded = await consume(db, schoolA, 10, false);
const realtimeStillOk = await consume(db, schoolA, 10, true);
ok("non-realtime degrades to cached once the general allowance is spent",
   nonRtDegraded.route === "cached" && nonRtDegraded.allowed === false
     && nonRtDegraded.reason === "nonrealtime_pool_protected" && Number(nonRtDegraded.granted_minutes) === 0,
   JSON.stringify(nonRtDegraded));
ok("realtime is STILL served from the protected reserve in that same state",
   realtimeStillOk.route === "realtime" && realtimeStillOk.allowed === true,
   JSON.stringify(realtimeStillOk));

// --- TEST 4 + 5: drain the reserve → realtime yields to text, no overage ---
// Used so far: 600 nonrt + 40 realtime = 640. Drain the remaining 360 realtime.
await consume(db, schoolA, 360, true);
const st = (await db.query(
  `SELECT minutes_used, realtime_used, minutes_allocated FROM public.institution_voice_pools WHERE school_id=$1`,
  [schoolA])).rows[0];
ok("full drain lands exactly on the allocation, never above (no overage)",
   Number(st.minutes_used) === 1000 && Number(st.minutes_used) === Number(st.minutes_allocated),
   JSON.stringify(st));
const rtExhausted = await consume(db, schoolA, 5, true);
const nonRtExhausted = await consume(db, schoolA, 5, false);
ok("realtime degrades to text at full exhaustion (last to yield)",
   rtExhausted.route === "text" && rtExhausted.reason === "pool_exhausted", JSON.stringify(rtExhausted));
ok("non-realtime is on cached at full exhaustion", nonRtExhausted.route === "cached", JSON.stringify(nonRtExhausted));
const stAfter = (await db.query(
  `SELECT minutes_used FROM public.institution_voice_pools WHERE school_id=$1`, [schoolA])).rows[0];
ok("degraded requests book zero minutes", Number(stAfter.minutes_used) === 1000, JSON.stringify(stAfter));

// --- TEST 5b: a single oversized request never overages a fresh pool ---
await db.query(`INSERT INTO public.schools (id, name) VALUES ($1,'School C')`, ["aaaaaaaa-0000-0000-0000-0000000000c3"]);
const schoolC = "aaaaaaaa-0000-0000-0000-0000000000c3";
const cStudent = "55555555-0000-0000-0000-000000000005";
await db.query(`INSERT INTO auth.users (id, email) VALUES ($1,'c@e.dev')`, [cStudent]);
await db.query(`INSERT INTO public.profiles (id, email, role, school_id) VALUES ($1,'c@e.dev','student',$2)
                ON CONFLICT (id) DO UPDATE SET role='student', school_id=$2`, [cStudent, schoolC]);
await db.query(`SELECT public.ensure_voice_pool($1)`, [schoolC]);
const oversized = await consume(db, schoolC, 999999, true);
const cUsed = (await db.query(`SELECT minutes_used FROM public.institution_voice_pools WHERE school_id=$1`, [schoolC])).rows[0];
ok("an oversized single request degrades and books zero (no overage)",
   oversized.route === "text" && Number(oversized.granted_minutes) === 0 && Number(cUsed.minutes_used) === 0,
   JSON.stringify({ oversized, cUsed }));

// --- TEST 6: admin notification at 80% ---
// School C fresh (1000 total). Consume 800 realtime → notify_admin true; verify a
// prior sub-80 grant did not notify.
const at79 = await consume(db, schoolC, 790, true); // 79%
const at80 = await consume(db, schoolC, 10, true);  // → 800/1000 = 80%
ok("no admin notification below 80%", at79.notify_admin === false, JSON.stringify(at79));
ok("admin notification fires at 80% consumption", at80.notify_admin === true, JSON.stringify(at80));

// --- TEST 7: RLS read visibility ---
ok("a student sees ZERO pool rows", (await poolRowsVisibleTo(db, student)) === 0);
ok("a teacher sees exactly their own school's pool", (await poolRowsVisibleTo(db, teacherA)) === 1);
ok("a cross-school teacher sees ZERO of school A's pool (only their own school B, unprovisioned)",
   (await poolRowsVisibleTo(db, teacherB)) === 0);
ok("a global admin sees every provisioned pool", (await poolRowsVisibleTo(db, admin)) === 2); // A and C

// --- TEST 8: privilege posture ---
const priv = (await db.query(`
  SELECT has_table_privilege('authenticated','public.institution_voice_pools','SELECT') AS sel,
         has_table_privilege('authenticated','public.institution_voice_pools','INSERT') AS ins,
         has_table_privilege('authenticated','public.institution_voice_pools','UPDATE') AS upd,
         has_table_privilege('authenticated','public.institution_voice_pools','DELETE') AS del,
         has_table_privilege('service_role','public.institution_voice_pools','INSERT') AS svc_ins,
         has_function_privilege('authenticated','public.consume_voice_minutes(uuid,numeric,boolean)','EXECUTE') AS auth_consume,
         has_function_privilege('service_role','public.consume_voice_minutes(uuid,numeric,boolean)','EXECUTE') AS svc_consume,
         has_function_privilege('authenticated','public.ensure_voice_pool(uuid,text)','EXECUTE') AS auth_ensure,
         has_function_privilege('service_role','public.ensure_voice_pool(uuid,text)','EXECUTE') AS svc_ensure`)).rows[0];
ok("authenticated may SELECT the pool (RLS narrows it)", priv.sel === true);
ok("authenticated may NOT write the pool (no INSERT/UPDATE/DELETE grant)",
   priv.ins === false && priv.upd === false && priv.del === false, JSON.stringify(priv));
ok("service_role may write the pool", priv.svc_ins === true);
ok("authenticated may NOT EXECUTE consume_voice_minutes (server-measured only)", priv.auth_consume === false);
ok("service_role may EXECUTE consume_voice_minutes", priv.svc_consume === true);
ok("authenticated may NOT EXECUTE ensure_voice_pool", priv.auth_ensure === false);
ok("service_role may EXECUTE ensure_voice_pool", priv.svc_ensure === true);

// --- TEST 9: unprovisioned school degrades, never errors ---
await db.query(`INSERT INTO public.schools (id, name) VALUES ($1,'No Pool')`, ["aaaaaaaa-0000-0000-0000-0000000000d4"]);
const noPool = await consume(db, "aaaaaaaa-0000-0000-0000-0000000000d4", 10, true);
ok("an unprovisioned pool degrades to text (never errors, never bills)",
   noPool.route === "text" && noPool.reason === "pool_unprovisioned" && Number(noPool.granted_minutes) === 0,
   JSON.stringify(noPool));

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
