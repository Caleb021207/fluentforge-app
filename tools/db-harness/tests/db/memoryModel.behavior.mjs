#!/usr/bin/env node
/**
 * BEHAVIORAL validation of WORKSTREAM 2.2 — the unified learner-memory model
 * migration (20260731020000_learner_memory_model.sql) against a real Postgres
 * engine (PGlite) with the full baseline-forward migration chain applied.
 *
 * Proves, not asserts-on-paper (plan 05 §2/§3/§6; task item 2):
 *   1. The migration chain INCLUDING this migration applies cleanly (harness
 *      stays green — the additive foundation does not break the chain).
 *   2. A SERVICE-ROLE insert into learner_memory_items succeeds (server path).
 *   3. Writes are service-role ONLY: an authenticated (non-service) insert is
 *      denied (no grant + no policy), and item_kind CHECK rejects bad kinds.
 *   4. RLS ISOLATION: the owner reads their own row; an authenticated NON-OWNER
 *      SELECT returns ZERO rows; a teacher-of-the-student and an admin can read.
 *   5. The proficiency-rung ENUM is ordered (the owner-rule gate
 *      `rung > 'recognition'` is expressible).
 *   6. The mapping view learner_memory_items_from_vocab returns a correctly
 *      SHAPED row when a vocab_card_state row exists, and (security_invoker)
 *      passes the underlying RLS through — a non-owner sees zero rows.
 *
 * How RLS is exercised: PGlite's default connection is a superuser and BYPASSES
 * RLS (used here only for seeding). `SET ROLE authenticated` drops that bypass
 * so policies apply to the JWT-GUC identity; `SET ROLE service_role` (created
 * BYPASSRLS by the harness) emulates the edge-function service path.
 *
 * Run: node tools/db-harness/tests/db/memoryModel.behavior.mjs
 */
import { createShimmedDb, applyAll } from "../../apply-migrations.mjs";

let pass = 0, fail = 0;
const ok = (name, cond, detail = "") => {
  if (cond) { pass++; console.log(`  PASS  ${name}`); }
  else { fail++; console.log(`  FAIL  ${name}${detail ? "  — " + detail : ""}`); }
};
async function denied(name, fn) {
  try { await fn(); ok(name, false, "expected an error, none thrown"); }
  catch { ok(name, true); }
}

// Set the request JWT GUCs the way Supabase does, then drop into the given
// database role so RLS is actually enforced (default conn is a superuser).
async function setJwt(db, uid, role = "authenticated") {
  await db.exec(`SELECT set_config('request.jwt.claim.sub', '${uid}', false);
                 SELECT set_config('request.jwt.claim.role', '${role}', false);
                 SELECT set_config('request.jwt.claims', '${JSON.stringify({ sub: uid, role })}', false);`);
}
async function asSuper(db)   { await db.exec(`RESET ROLE`); }
async function asService(db) { await db.exec(`RESET ROLE; SET ROLE service_role`); }
async function asAuthed(db, uid) { await db.exec(`RESET ROLE`); await setJwt(db, uid); await db.exec(`SET ROLE authenticated`); }
const n = (v) => Number(v);

const db = await createShimmedDb();

// --- 1. chain applies cleanly WITH this migration ---
const results = await applyAll(db, { from: "20260211" });
const failedMig = results.filter((r) => !r.ok);
ok(`baseline-forward chain applies cleanly incl. learner-memory migration (${results.length} files)`,
   results.length >= 18 && failedMig.length === 0,
   failedMig.map((f) => f.file).join(", "));
const hasTable = await db.query(
  `SELECT 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='learner_memory_items'`);
ok("learner_memory_items table exists", hasTable.rows.length === 1);

// Supabase-default schema/function grants so the policy function calls resolve.
// NOTE: deliberately does NOT grant table INSERT to authenticated — the migration's
// per-table grant (SELECT only) is the belt we are testing in step 3.
await db.exec(`
  GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
  GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO authenticated, service_role;
`);

// --- seed identities (default conn = superuser bypass) ---
await asSuper(db);
const owner   = "11111111-1111-1111-1111-111111111111";
const other   = "22222222-2222-2222-2222-222222222222";
const teacher = "33333333-3333-3333-3333-333333333333";
const admin   = "44444444-4444-4444-4444-444444444444";
for (const [id, email] of [[owner, "o@e.dev"], [other, "x@e.dev"], [teacher, "t@e.dev"], [admin, "ad@e.dev"]]) {
  await db.query(`INSERT INTO auth.users (id, email) VALUES ($1,$2)`, [id, email]);
}
// admin gets the admin role; teacher gets a class with owner enrolled.
await db.query(`INSERT INTO public.user_roles (user_id, role) VALUES ($1,'admin')`, [admin]);
const classId = "55555555-5555-5555-5555-555555555555";
await db.query(`INSERT INTO public.classes (id, teacher_id, name, class_code) VALUES ($1,$2,'Room A','CLS-MEM01')`,
  [classId, teacher]);
await db.query(`INSERT INTO public.student_enrollments (class_id, student_id) VALUES ($1,$2)`, [classId, owner]);

// --- 2. SERVICE-ROLE insert succeeds ---
const itemRef = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";
await asService(db);
await db.query(
  `INSERT INTO public.learner_memory_items
     (user_id, item_kind, item_ref, item_key, stability, difficulty, due, state, reps, lapses, proficiency_rung, productive_uses)
   VALUES ($1,'vocab',$2,'v-001', 12.5, 5.0, now(), 2, 4, 0, 'production', 2)`, [owner, itemRef]);
const svcCount = await db.query(`SELECT count(*)::int AS c FROM public.learner_memory_items WHERE user_id=$1`, [owner]);
ok("service-role insert into learner_memory_items succeeds", n(svcCount.rows[0].c) === 1, `count=${svcCount.rows[0].c}`);

// --- 3. writes are service-role ONLY ---
await asAuthed(db, owner);
await denied("authenticated (non-service) INSERT is denied", () =>
  db.query(`INSERT INTO public.learner_memory_items (user_id,item_kind,item_key) VALUES ($1,'vocab','v-hack')`, [owner]));
await asService(db);
await denied("item_kind CHECK rejects an unknown kind", () =>
  db.query(`INSERT INTO public.learner_memory_items (user_id,item_kind,item_key) VALUES ($1,'bogus','b-1')`, [owner]));

// --- 4. RLS isolation across all three read branches ---
await asAuthed(db, owner);
const ownerSees = await db.query(`SELECT count(*)::int AS c FROM public.learner_memory_items`);
ok("owner reads own memory item (positive control)", n(ownerSees.rows[0].c) === 1, `count=${ownerSees.rows[0].c}`);

await asAuthed(db, other);
const otherSees = await db.query(`SELECT count(*)::int AS c FROM public.learner_memory_items`);
ok("authenticated NON-OWNER SELECT returns zero rows", n(otherSees.rows[0].c) === 0, `count=${otherSees.rows[0].c}`);

await asAuthed(db, teacher);
const teacherSees = await db.query(
  `SELECT count(*)::int AS c FROM public.learner_memory_items WHERE user_id=$1`, [owner]);
ok("teacher-of-student can read the student's memory items", n(teacherSees.rows[0].c) === 1, `count=${teacherSees.rows[0].c}`);

await asAuthed(db, admin);
const adminSees = await db.query(
  `SELECT count(*)::int AS c FROM public.learner_memory_items WHERE user_id=$1`, [owner]);
ok("admin can read any learner's memory items", n(adminSees.rows[0].c) === 1, `count=${adminSees.rows[0].c}`);

// --- 5. proficiency-rung enum is ordered (owner-rule gate) ---
await asSuper(db);
const ord = await db.query(`
  SELECT ('exposed'::public.learner_proficiency_rung   < 'recognition'::public.learner_proficiency_rung)  AS a,
         ('recognition'::public.learner_proficiency_rung < 'cued_recall'::public.learner_proficiency_rung) AS b,
         ('production'::public.learner_proficiency_rung  > 'recognition'::public.learner_proficiency_rung)  AS c,
         ('spontaneous'::public.learner_proficiency_rung > 'production'::public.learner_proficiency_rung)   AS d`);
const o = ord.rows[0];
ok("proficiency_rung ladder is correctly ordered (unseen<..<spontaneous)", o.a && o.b && o.c && o.d,
   JSON.stringify(o));

// --- 6. mapping view: shape + security_invoker RLS passthrough ---
await asSuper(db);
const vocabRes = await db.query(`INSERT INTO public.vocabulary (lemma) VALUES ('schedule') RETURNING id`);
const vocabId = vocabRes.rows[0].id;
await db.query(
  `INSERT INTO public.vocab_card_state
     (user_id, vocabulary_id, stability, difficulty, due, state, reps, lapses, elapsed_days, scheduled_days, learning_steps, last_review)
   VALUES ($1,$2, 20.0, 6.0, now(), 2, 3, 1, 4, 15, 0, now())`, [owner, vocabId]);

const view = await db.query(
  `SELECT item_kind, item_ref, item_key, proficiency_rung, reps::int AS reps,
          state::int AS state, stability::float8 AS stability, productive_uses::int AS productive_uses
   FROM public.learner_memory_items_from_vocab WHERE user_id=$1`, [owner]);
const v = view.rows[0];
ok("mapping view returns exactly one row for the seeded card", view.rows.length === 1, `rows=${view.rows.length}`);
ok("mapping view row is correctly shaped (kind/ref/key/rung/fsrs)",
   !!v && v.item_kind === "vocab" && v.item_ref === vocabId && v.item_key === String(vocabId) &&
   v.proficiency_rung === "recognition" && n(v.reps) === 3 && n(v.state) === 2 &&
   n(v.stability) === 20 && n(v.productive_uses) === 0,
   JSON.stringify(v));

// security_invoker: the view honours vocab_card_state RLS for the querying role.
await asAuthed(db, owner);
const viewOwner = await db.query(`SELECT count(*)::int AS c FROM public.learner_memory_items_from_vocab`);
ok("mapping view: owner sees own projected card (security_invoker)", n(viewOwner.rows[0].c) === 1, `count=${viewOwner.rows[0].c}`);
await asAuthed(db, other);
const viewOther = await db.query(`SELECT count(*)::int AS c FROM public.learner_memory_items_from_vocab`);
ok("mapping view: non-owner sees zero rows through the view (security_invoker)", n(viewOther.rows[0].c) === 0, `count=${viewOther.rows[0].c}`);

await asSuper(db);
console.log(`\n=== ${pass} passed, ${fail} failed ===`);
process.exit(fail ? 1 : 0);
