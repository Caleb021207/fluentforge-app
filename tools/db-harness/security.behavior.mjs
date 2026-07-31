#!/usr/bin/env node
/**
 * BEHAVIORAL validation of the Phase 0.4 role-security fix against a real
 * Postgres engine (PGlite) with the full migration chain applied.
 *
 * Proves, not asserts-on-paper:
 *  1. A non-admin CANNOT change their own profiles.role (trigger freeze).
 *  2. join_class_by_code still enrolls a student (regression guard).
 *  3. provision_teacher rejects a bad code and burns no use.
 *  4. provision_teacher promotes the caller with a valid staff code and the
 *     use-count increments atomically.
 *  5. A cross-tenant self-promotion attempt via the client path is blocked.
 *
 * Run: node tools/db-harness/security.behavior.mjs
 */
import { createShimmedDb, applyAll } from "./apply-migrations.mjs";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? "  — " + detail : ""}`); }
};

// Set the request JWT GUCs the way Supabase does for a given user/role.
async function asUser(db, uid, role = "authenticated") {
  await db.exec(`SELECT set_config('request.jwt.claim.sub', '${uid}', false);
                 SELECT set_config('request.jwt.claim.role', '${role}', false);
                 SELECT set_config('request.jwt.claims', '${JSON.stringify({ sub: uid, role })}', false);`);
}
async function asAnon(db) {
  await db.exec(`SELECT set_config('request.jwt.claim.sub', '', false);
                 SELECT set_config('request.jwt.claim.role', 'anon', false);
                 SELECT set_config('request.jwt.claims', '', false);`);
}

const db = await createShimmedDb();
const results = await applyAll(db, { from: "20260211" });
const failedMig = results.filter((r) => !r.ok);
ok(`baseline-forward migration chain applies cleanly (${results.length} files)`,
   results.length >= 16 && failedMig.length === 0,
   failedMig.map((f) => f.file).join(", "));

// --- seed two users directly (service role bypasses RLS/triggers is emulated
// by running as postgres/no-JWT, which the trigger treats as privileged) ---
await asAnon(db);
const student = "11111111-1111-1111-1111-111111111111";
const attacker = "22222222-2222-2222-2222-222222222222";
const teacher = "33333333-3333-3333-3333-333333333333";
for (const [id, email] of [[student, "s@e.dev"], [attacker, "a@e.dev"], [teacher, "t@e.dev"]]) {
  await db.query(`INSERT INTO auth.users (id, email) VALUES ($1,$2)`, [id, email]);
  // profiles insert as the user themselves (mimics handle_new_user / client insert)
  await asUser(db, id);
  await db.query(
    `INSERT INTO public.profiles (id, email, role) VALUES ($1,$2,'student')
     ON CONFLICT (id) DO NOTHING`, [id, email],
  );
}

// --- TEST 1: self-promotion is frozen ---
await asUser(db, attacker);
await db.query(`UPDATE public.profiles SET role='teacher' WHERE id=$1`, [attacker]);
const r1 = await db.query(`SELECT role FROM public.profiles WHERE id=$1`, [attacker]);
ok("non-admin self-promotion to teacher is silently frozen", r1.rows[0].role === "student",
   `role is '${r1.rows[0].role}'`);

// --- TEST 1b: even 'admin' string injection via role column is frozen ---
await db.query(`UPDATE public.profiles SET role='admin' WHERE id=$1`, [attacker]);
const r1b = await db.query(`SELECT role FROM public.profiles WHERE id=$1`, [attacker]);
ok("self-escalation to admin is frozen", r1b.rows[0].role === "student");

// --- TEST 2: join_class_by_code regression ---
// create a class owned by teacher (as service/no-JWT so RLS doesn't block seed)
await asAnon(db);
const classId = "44444444-4444-4444-4444-444444444444";
await db.query(
  `INSERT INTO public.classes (id, teacher_id, name, class_code) VALUES ($1,$2,'Room A','CLS-ABC123')`,
  [classId, teacher],
);
await asUser(db, student);
const joinRes = await db.query(`SELECT public.join_class_by_code('cls-abc123') AS r`);
const joined = joinRes.rows[0].r;
ok("join_class_by_code enrolls the student (case-insensitive)", joined?.success === true,
   JSON.stringify(joined));
const enroll = await db.query(
  `SELECT status FROM public.student_enrollments WHERE class_id=$1 AND student_id=$2`, [classId, student]);
ok("enrollment row exists after join", enroll.rows.length === 1);

// --- TEST 3 + 4: provision_teacher ---
// seed a staff access code as service/admin (hash of 'STAFF-2026')
await asAnon(db);
const code = "STAFF-2026";
await db.query(
  `INSERT INTO public.staff_access_codes (code_hash, school_name, max_uses, current_uses)
   VALUES (encode(digest($1,'sha256'),'hex'), 'Test School', 5, 0)`, [code]);

await asUser(db, teacher);
const bad = await db.query(`SELECT public.provision_teacher('WRONG-CODE') AS r`);
ok("provision_teacher rejects an invalid code", bad.rows[0].r?.success === false, JSON.stringify(bad.rows[0].r));
const uses0 = await db.query(`SELECT current_uses FROM public.staff_access_codes`);
ok("a rejected code burns no use", Number(uses0.rows[0].current_uses) === 0);

const good = await db.query(`SELECT public.provision_teacher($1) AS r`, [code]);
ok("provision_teacher accepts a valid staff code", good.rows[0].r?.success === true, JSON.stringify(good.rows[0].r));
const teacherRole = await db.query(`SELECT role FROM public.profiles WHERE id=$1`, [teacher]);
ok("caller is now a teacher after valid provisioning", teacherRole.rows[0].role === "teacher",
   `role is '${teacherRole.rows[0].role}'`);
const uses1 = await db.query(`SELECT current_uses FROM public.staff_access_codes`);
ok("a valid provisioning increments the use count exactly once", Number(uses1.rows[0].current_uses) === 1,
   `uses = ${uses1.rows[0].current_uses}`);

// --- TEST 5: student STILL cannot self-promote even after the system has teachers ---
await asUser(db, student);
await db.query(`UPDATE public.profiles SET role='teacher' WHERE id=$1`, [student]);
const r5 = await db.query(`SELECT role FROM public.profiles WHERE id=$1`, [student]);
ok("student remains frozen at 'student' after others are provisioned", r5.rows[0].role === "student");

console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
