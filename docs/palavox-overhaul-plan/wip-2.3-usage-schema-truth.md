# wip-2.3 · Usage/Quota Schema — Reconciled Truth

**Workstream 2.3.** Replaces the "requires live dump" hedge of wip-01a §10 **for the
migration-defined schema**. The shapes below are not inferred from reading SQL by eye — they were
produced by **applying the entire baseline-forward migration chain on a real Postgres 18 engine
(PGlite) via `tools/db-harness/apply-migrations.mjs --from 20260211` and querying
`information_schema` / `pg_catalog`** (probe preserved in method note at the end). Every row is
labelled:

- **[observed-from-migrations]** — proven by the harness: this is exactly what the migration chain
  produces today (20/20 files applied clean).
- **[generated-types-claim]** — what `src/integrations/supabase/types.ts` asserts (the file the app
  compiles against).
- **[live-DB drift — requires owner dump]** — the ONLY residual: whether the hosted database matches
  the migration chain. Unchanged by this doc; still gated on the owner's credentials (plan 18 B1).

**Headline reconciliation:** for `student_usage_limits`, `usage_tracking`, `usage_counters`, and
`api_calls_tracking`, **the migration-defined schema and the generated types AGREE, column-for-column.**
The disagreements wip-01a §10 flagged were between the *pre-baseline* migrations (which carried
`academic_year` / `time_restrictions` / etc.) and the types. The 2026-02-11 consolidated baseline
**reset those tables and redefined the dependent functions**, and the types were regenerated after
it — so within the migration chain there is no live reference to a missing column. What §10 could
not settle from the repo alone is now settled: **the repo is internally consistent; only live-DB
parity remains open.**

---

## 1. `public.student_usage_limits`

**[observed-from-migrations]** RLS enabled; policy `Users view own limits` (SELECT only — writes are
service-role, per 20260729061713 §RLS). PK `id`; **`student_id` is plain `UNIQUE`** (no
`(student_id, academic_year)` composite). Columns (18):

| column | type | default |
| --- | --- | --- |
| id | uuid NOT NULL | gen_random_uuid() |
| student_id | uuid NOT NULL (UNIQUE) | — |
| voice_minutes_monthly_limit | integer | 400 |
| voice_minutes_used_current_month | integer | 0 |
| premium_voice_minutes_monthly_limit | integer | 15 |
| premium_voice_minutes_used_current_month | numeric | 0 |
| whisper_stt_minutes_monthly_limit | integer | 180 |
| whisper_stt_minutes_used_current_month | numeric | 0 |
| tts_tokens_monthly_limit | integer | 500000 |
| tts_tokens_used_current_month | integer | 0 |
| text_practice_tokens_monthly_limit | integer | 500000 |
| text_practice_tokens_used_current_month | integer | 0 |
| text_messages_monthly_limit | integer | 1500 |
| text_messages_used_current_month | integer | 0 |
| certification_attempts_semester_limit | integer | 3 |
| certification_attempts_used_current_semester | integer | 0 |
| created_at | timestamptz NOT NULL | now() |
| updated_at | timestamptz NOT NULL | now() |

**[generated-types-claim]** `types.ts:1980-2040` — **identical** column set (all nullable in the
generated `Row`, which is the codegen's treatment of defaulted columns; no `academic_year`,
`current_month`, `current_semester`, or `last_reset_month`).

**Reconciles wip-01a §10 / F1.1 / F1.2 / F1.4:**
- The columns §10 warned were missing (`academic_year`, `current_month`, `current_semester`,
  `last_reset_month`) **are genuinely absent from BOTH migrations and types.** They existed only in
  pre-baseline migrations.
- **[observed-from-migrations]** `reset_monthly_usage()` and `reset_semester_usage()` **do not exist**
  in the from-baseline chain (absent from `pg_proc`). So F1.1 is precise: in the migration-defined
  schema there is **no monthly/semester reset mechanism at all** (not a broken-column one). This is a
  real functional gap the overhaul must close (a period-reset job or the pooled model in §5 below),
  not a drift artifact.
- **[observed-from-migrations]** the baseline redefines `can_start_voice_session`,
  `can_send_text_message`, `initialize_student_usage_limits*` to reference **only** the columns above
  — none touches a missing column, so none is a latent runtime error in the chain as written.

## 2. `public.usage_tracking`

**[observed-from-migrations]** RLS enabled; policy `Users view own tracking` (SELECT only — the
client INSERT/UPDATE policies were dropped in 20260729061713, matching the F8.4 note that direct
browser writes now fail). PK `id` **only** — there is **no UNIQUE(student_id, session_id)**.

| column | type | default |
| --- | --- | --- |
| id | uuid NOT NULL | gen_random_uuid() |
| student_id | uuid NOT NULL | — |
| session_type | text NOT NULL | — |
| session_id | text | — |
| messages_count | integer | 0 |
| minutes_used | numeric | 0 |
| ended_at | timestamptz | — |
| created_at | timestamptz NOT NULL | now() |

**[generated-types-claim]** `types.ts:2281-2312` — **identical**.

**Residual risk (security-relevant):** because there is **no DB-level uniqueness on
`(student_id, session_id)`**, the replay/double-report guard in both `track-usage` and
`track-premium-voice-session` is a SELECT-then-INSERT at the application layer — a check-then-act race
window (two concurrent reports of the same `session_id` can both pass the SELECT and double-book).
The hardened writers narrowed this but cannot close it without a unique index. Flagged as a follow-up
(a partial unique index on `(student_id, session_id) WHERE session_id IS NOT NULL` is the fix); out of
this workstream's assigned surface.

## 3. `public.usage_counters`

**[observed-from-migrations]** Created by 20260729061713; RLS enabled; policy
`Users can view own counters` (SELECT own). PK `id`; **UNIQUE(user_id, bucket, day)**.

| column | type | default |
| --- | --- | --- |
| id | uuid NOT NULL | gen_random_uuid() |
| user_id | uuid NOT NULL | — |
| bucket | text NOT NULL | — |
| day | date NOT NULL | (now() at utc)::date |
| count | integer NOT NULL | 0 |
| created_at | timestamptz NOT NULL | now() |
| updated_at | timestamptz NOT NULL | now() |

**[generated-types-claim]** `types.ts:2251-2279` — **identical**. Confirms F1.6: one row per
(user, bucket, day), **no TTL / cleanup job** in the chain → unbounded growth (a maintenance
follow-up, not a drift).

## 4. `public.api_calls_tracking`

**[observed-from-migrations]** RLS enabled; policy `Users view own api tracking`. Baseline columns
plus `service` / `endpoint` added by 20260327225632.

| column | type | default |
| --- | --- | --- |
| id | uuid NOT NULL | gen_random_uuid() |
| user_id | uuid NOT NULL | — |
| api_type | text | — |
| tokens_used | integer | 0 |
| metadata | jsonb | — |
| created_at | timestamptz NOT NULL | now() |
| service | text | — |
| endpoint | text | — |

**[generated-types-claim]** `types.ts:127-158` — **identical** (includes `metadata`, `service`,
`endpoint`).

## 5. `public.time_restrictions` — RESOLVED as ABSENT

**[observed-from-migrations]** **The table does not exist** in the from-baseline chain (it was created
only by the pre-baseline `20250729055113`, which the baseline reset supersedes and the harness does
not replay). **[generated-types-claim]** absent from `types.ts`. So wip-01a §10's third bullet is
settled decisively: in the migration-defined truth, `time_restrictions` is **gone**, and — crucially —
the baseline's `can_start_voice_session` **does not reference it** (unlike the pre-baseline version at
`20250729…:270`). No dangling reference remains in the chain.

## 6. Quota functions & grants (security-relevant reconciliation)

**[observed-from-migrations]** present in the from-baseline chain (all `SECURITY DEFINER`):
`initialize_student_usage_limits(uuid)`, `initialize_student_usage_limits_with_tier(uuid, text)`,
`can_start_voice_session(uuid)→json`, `can_start_premium_voice_session(uuid)→json`,
`can_send_text_message(uuid)→table`, `increment_voice_usage(uuid, numeric)`,
`increment_tts_usage(uuid, numeric)`, `consume_rate_limit(uuid, text, integer)→boolean`.

Two findings from wip-01a §1 are **neutralized in the migration-defined schema** (but stay open for
the live DB):

- **F1.2 / F1.3 (self-upgrade of quotas).** In the baseline the signature is
  `initialize_student_usage_limits_with_tier(uuid, **text**)` — which is exactly what
  `20260729062707` REVOKEs. **[observed-from-migrations]** the harness grant dump shows EXECUTE for
  **only `postgres` + `service_role`** (PUBLIC/`authenticated` revoked), and the body **ignores the
  tier argument** (inserts a default-limits row). So neither the "call from the browser" nor the
  "self-promote to premium quotas" path exists in the chain as written. **[live-DB drift]** the
  original F1.3 risk assumed the *pre-baseline* enum signature `(uuid, account_tier)`, against which
  the `(uuid,text)` REVOKE silently skips; whether the hosted DB carries the enum-signature version
  (still PUBLIC) is the open question requiring the owner's dump.
- **increment_voice_usage** EXECUTE is granted to **`postgres` + `service_role` only** (not
  `authenticated`) — students cannot inflate their own counters (a preserved strength). Note it
  floors to `GREATEST(1, p_minutes::INTEGER)`, i.e. numeric minutes are truncated to an integer and a
  0-minute report still bills 1; acceptable for the legacy per-student counters, and superseded by the
  numeric-precise pool RPC below.

## 7. What this workstream adds on top of the reconciled schema

The reconciled per-student `student_usage_limits` model is monthly-per-student and **has no reset job**
(F1.1) and no institution pooling. WS 2.3 therefore adds an **additive, PREPARED** institution-pool
layer that implements the 16 §7 policy without touching any table above:

- **Migration** `supabase/migrations/20260731030000_pooled_voice_allowance.sql`
  *(PREPARED, NOT APPLIED — validated locally, 20/20 harness)*: `institution_voice_pools`
  (per school × academic period; 1,000 min/seat pool with a protected 400 min/seat realtime
  sub-pool), the academic-period key `current_pool_period()` (August boundary — fixes F1.4's January
  flip), `ensure_voice_pool()` (sizes allocation from the activated-student roster; grant-not-revoke),
  and the `consume_voice_minutes(school_id, minutes, is_realtime)` degrade-not-bill RPC. Admin/teacher
  RLS read; service-role-only writes.
- **Pure logic** `supabase/functions/_shared/voicePool.ts` (zero-import) — the reference arithmetic the
  RPC mirrors; vitest golden vectors in `tests/server-pure/voicePool.test.ts`.
- **Behavior proof** `tools/db-harness/voicePool.behavior.mjs` — 25 assertions on a real engine
  (drills-degrade-first, realtime-last-to-yield, never-overage, RLS, privilege posture).

---

### Honest state

- **[validated-locally]** every shape above (harness, Postgres 18) and the new pool layer (harness +
  vitest). Nothing in this workstream is applied to the hosted DB.
- **[requires production apply]** the pooled migration; and a live schema dump to close the sole
  remaining drift question (does prod match the baseline, or a pre-baseline variant?).

### Method note

Produced by applying `--from 20260211` in `tools/db-harness/apply-migrations.mjs` and querying
`information_schema.columns` / `pg_policy` / `pg_proc` / `aclexplode(proacl)` for each table and
function (throwaway probe, not committed). Re-derivable at any time with the same harness the
verification gates use.
