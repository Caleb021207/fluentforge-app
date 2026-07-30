# 14 — District Readiness: Institutional Workflows, Gap Analysis, and Pilot Design

**Role:** School-District Product & Institutional Workflow Specialist — PLANNING phase (no implementation).
**Repo:** `/Users/calebjaworski/fluentforge-app`, branch `overhaul`, commit `7cbaadd9`.
**Inputs read:** `wip-01a-product-inventory.md`, `wip-02-current-user-flows.md`, `wip-15a-data-security-current-state.md`, `wip-13a-localization-current-state.md`, plus direct repo verification (cites below).
**Labels:** `[observed]` repo evidence · `[documented]` external source with URL + date · `[estimated]` · `[proposed]` · `[assumption]` · `[requires validation]`.
**Scope guard:** All compliance/procurement content in this document describes **technical readiness only**. Nothing here is a legal opinion, a legal-compliance claim, or a statement that any regulation is or will be satisfied.

---

## 0. Executive summary

**Current state:** Palavox has the *vocabulary* of an institutional product — classes, enrollments, join codes, bulk account creation, curriculum assignments, a genuinely differentiated WIDA/can-do benchmarks layer, CSV/JSON teacher export, and stub tables for districts, schools, and roster sync — but almost none of the *machinery*. There is no rostering integration, no SSO, no year lifecycle, no tenant isolation, no functional audit/retention/deletion, no admin persona surface, and the security discovery shows a self-serve teacher role that can read any student's records `[observed, wip-15a §7.2]`. The single most district-differentiating asset is the can-do benchmarks/readiness layer `[observed]`; the single most disqualifying liability is the teacher-role/PII structural hole plus non-functional minor-safety enforcement `[observed]`.

**Recommended target (headline decisions, detailed in §2):**
1. **Rostering:** OneRoster 1.1 CSV import as the universal baseline (pilot + paid), then **Clever Secure Sync** as the first API integration, ClassLink second. No Ed-Fi, no SIS write-back. `[proposed]`
2. **SSO:** Google SSO first (students + staff), Clever SSO with the Clever integration, ClassLink after. Password accounts remain as fallback with forced first-login reset. `[proposed]`
3. **Lifecycle:** academic-year–scoped enrollments with archive-not-delete semantics; rollover is a bulk archive + re-roster event, not data deletion. `[proposed]`
4. **Accommodations:** extended time, audio-first, and L1-scaffolding level become per-student, teacher-settable, server-enforced flags on an `accommodations` model — reusing the existing graded-L1 design from `chat-with-tutor` `[observed asset, proposed generalization]`.
5. **Sync-classroom mode:** Supabase Realtime "class session" channel, teacher-paced, 30 devices — desirable-later, not pilot-blocking. `[proposed]`
6. **Pilot:** one classroom, 4–6 weeks, entry-gated on the 12 "before ANY pilot" items in §3.1, measuring both learning movement (can-do mastery deltas, FSRS retention) and operational viability (setup time, login success, support load). `[proposed]`

---

## 1. Current institutional reality (evidence-based)

### 1.1 What exists vs what works

| Capability | Exists? | Works? | Evidence |
|---|---|---|---|
| Classes (teacher-owned) | Yes | Yes — create/delete via dashboard; delete is a hard cascade with no archive | `src/components/teacher/dashboard/TeacherClassesTab.tsx:129-136` `[observed, wip-02 §4.2]` |
| Enrollments (single table) | Yes | Mostly — `student_enrollments` unified, but ≥18 files run ad-hoc roster queries; 3 roster UIs; N+1 count queries | `wip-02 §0, §4.2` `[observed]` |
| Class join codes | Yes | Partially — `join_class_by_code` RPC is sound (SECURITY DEFINER, normalization, migration `20260730020000`), but codes are client-side `Math.random()` with no uniqueness retry, and the only post-onboarding join UI is on an orphaned route `/student/class` | `wip-02 F1-6, §4.2, O1` `[observed]` |
| Legacy access codes (district/school/teacher/class + tier metadata) | Yes | Diverging — second, parallel code system (`process_access_code`); the Profile entry point tries only this one, so teacher CLS-codes fail there | `supabase/migrations/20251102044050…sql:22-163`; `wip-02 F1-5` `[observed]` |
| Bulk student creation | Yes | Yes, with a serious caveat — `bulk-create-students` verifies teacher-owns-class, sets role server-side, one-time credentials screen + CSV download; but passwords are teacher-chosen plaintext with `email_confirm: true` and **no forced first-login reset** | `supabase/functions/bulk-create-students/index.ts:13-60,110-119`; `wip-02 F1-4` `[observed]` |
| Curriculum assignments | Yes | Half — teachers can assign units/lessons with due dates and CEFR/WIDA targets, but **no submission/completion tracking exists** (no table), and differentiation targets are stored but unenforced (every enrolled student sees every group's assignment) | `supabase/migrations/20260729175720…sql:1-40` (no submissions table) `[observed]`; `wip-02 F4-1, §4.4` |
| Conversation assignments | Yes | Yes mechanically — auto-created submissions, autosaved transcripts, completion-based scoring (message count ⇒ 100) with no quality assessment | `wip-02 §2.6, §4.3` `[observed]` |
| Benchmarks / WIDA panels | Yes | **Yes — the crown jewel.** Can-do heatmap, practiced-vs-tested coverage, readiness projections, needs-help grouping, all RLS-scoped to teacher-of-student | `src/hooks/useClassCanDoMastery.ts:16-31`; `src/components/teacher/curriculum/{CanDoHeatmap,BenchmarkReadinessPanel,NeedsHelpGroups,ClassBenchmarksTab}.tsx` `[observed]` |
| Teacher export | Yes | Exists — CSV/JSON via `generate-teacher-report` edge function with date range; format/fields unaudited for district reporting needs | `src/components/teacher/dashboard/ExportReportButton.tsx:68-91` `[observed]` |
| District/school tables | Yes | **Shell only** — `school_districts`, `district_settings`, `schools`, `grade_levels`, `district_users` exist (`20260211222712:7,22`; baseline `20260211195248:454`) but org config is world-readable to any authenticated user, `district_users` has no INSERT policy, nothing enforces `district_settings.require_parental_consent`, and **no student-data table carries a `district_id`/`school_id`** — tenancy is row-ownership only | `wip-15a §1.3, §3, G2, G4` `[observed]` |
| Roster sync (Clever/Google/OneRoster) | Table + UI copy only | **No** — `roster_sync_connections` table with provider CHECK (`'clever','google_classroom','oneroster'`) and admin RLS exists; zero sync code; UI says "district sync is not wired up yet" | `supabase/migrations/20260729175720…sql:42-62`; `src/components/teacher/curriculum/ClassRosterPanel.tsx:148` `[observed]` |
| SSO | No | — no OAuth/SAML config anywhere in repo; auth is email+password via Supabase | `[observed — grep for google/clever/saml/oauth providers in src/ and supabase/config.toml returns nothing auth-related]` |
| Admin/district persona | Fragments | No — `AdminProfile.tsx`, `DistrictProfile.tsx`, `CodeManagement.tsx`, compliance panels exist but there is no admin dashboard route with district-level aggregates; several read empty tables | `src/components/profile/{AdminProfile,DistrictProfile}.tsx`; `wip-01a F3.4, F7.5` `[observed]` |
| Notifications | Derived-on-poll only | No durable record, localStorage read-state, no email/push channel at all | `wip-01a §2` `[observed]` |
| Year rollover / transfers / graduation | No | Nothing — `graduation_year` column exists on profiles `[observed, wip-15a §5]` but no lifecycle code of any kind; enrollments have no year/term dimension (`20260211195248:103-106` — just class_id/student_id) | `[observed]` |
| Audit / retention / deletion / export (student data) | Tables + UI | **Non-functional** — audit table never written, DSAR export has no processor, no deletion path, retention tables dropped by the baseline reset | `wip-15a §5, G3, G7` `[observed]` |

### 1.2 The five structural facts that shape everything below

1. **No tenant boundary.** Access = row ownership (teacher_id, enrollment). A District A teacher can read a District B student's records if enrolled; any authenticated user can enumerate all districts/schools and their consent config `[observed, wip-15a §3, G2]`.
2. **Teacher is self-grantable** (`20260730010000` allows role flips) and `class-roster add_by_email` enrolls any account by email → any adult can grant themselves read access to any student's PII and transcripts `[observed, wip-15a §7.2, G1]`. This is disqualifying for any school deployment in its current form.
3. **Minor-safety flags are decorative.** `is_minor`/`safety_mode` are set server-side correctly but gate nothing — no route, RLS policy, or AI prompt reads them `[observed, wip-01a F7.1; wip-15a §7.3]`.
4. **The learning spine is server-authoritative and sound** (answer keys, grading, XP, FSRS, RLS-scoped teacher reads) — the institutional layer can be built on it without re-architecture `[observed, wip-01a §11; wip-15a §2.1]`.
5. **The i18n reality undermines the ESL district pitch**: core learner surfaces are hardcoded English, glosses are Spanish-only for all L1s, 5 newcomer languages are unselectable, no RTL `[observed, wip-13a §1, §2.1, §5, §6]`. Districts buy ESL products substantially for WIDA home-language support expectations `[assumption — validate with district advisory conversations]`.

---

## 2. Target institutional workflows `[proposed throughout unless labeled]`

Effort classes used in §2–§3: **S** ≤ 1 engineer-week · **M** 1–4 engineer-weeks · **L** > 4 engineer-weeks. All `[estimated]`.

### 2.1 Rostering

**Options considered:**

| Option | What it is | Pros | Cons | Cost `[estimated]` `[requires validation]` |
|---|---|---|---|---|
| A. Manual (status quo+) | Teacher bulk-create + join codes | Zero integration cost; already ~works | No SIS truth; drift; teacher labor; no district credibility at scale | S (harden existing) |
| B. **OneRoster 1.1 CSV import** | 1EdTech standard CSV bundle (orgs, users, classes, enrollments) uploaded by admin or dropped via SFTP. Spec: https://www.1edtech.org/standards/oneroster `[documented, accessed via Jan-2026 training data — verify current rev]` | Universal — every major SIS exports it; no per-vendor partnership fee; works for the long tail of districts that use neither Clever nor ClassLink; same data model feeds later API sync | Manual/periodic, not live; CSV quality varies by SIS; needs robust validation + dry-run diff UX | M build; $0 licensing. 1EdTech conformance certification optional (membership fee) `[documented: https://www.1edtech.org/certification, Jan-2026]` `[requires validation]` |
| C. Clever Secure Sync | Managed roster API + SSO; largest US K-12 install base `[documented: https://www.clever.com / https://dev.clever.com, Jan-2026]` | Districts already have it; nightly sync solved for you; includes SSO; strong district trust signal | Vendor partner fees (not public; commonly reported low-to-mid four figures annually for full sync partnership) `[estimated]` `[requires validation]`; certification review process; US-centric | M–L build + annual fee |
| D. ClassLink Roster Server | OneRoster-API-based roster delivery + LaunchPad SSO `[documented: https://developer.classlink.com, Jan-2026]` | Second-largest US footprint; OneRoster API skills reuse from B | Separate partner program/fees `[estimated]` `[requires validation]` | M build (large reuse of B's data model) + fee |
| E. Google Classroom import | Classroom API courses/rosters `[documented: https://developers.google.com/workspace/classroom, Jan-2026]` | Free; huge Chromebook overlap; teacher-initiated (no district project) | Classroom rosters ≠ SIS truth (teacher-maintained); API quotas; consent screens per teacher | M |
| F. Ed-Fi / SIF / direct SIS APIs | District data-warehouse standards | Deep integration | Massive effort, district-side infrastructure, wrong stage for a pilot-scale product | L+ — **avoid** (§3.5) |

**Recommendation (ONE approach): B → C → D staged, with A hardened as the permanent floor.**
*Rationale:* CSV OneRoster is the only path that (a) works for **every** district including pilots with no IT project, (b) forces us to build the durable internal model (`orgs → academic sessions → classes → enrollments` keyed by `sourcedId`) that C and D then populate via API, and (c) costs nothing in partner fees until revenue justifies Clever. Clever before ClassLink because of larger US share and bundled SSO `[estimated]` `[requires validation with actual target-district survey]`. Google Classroom import is a fast-follow teacher-convenience feature, not the rostering backbone, because Classroom is not SIS truth.
*Dependency:* requires the tenancy model (district_id/school_id on classes + enrollments, §2.3 of wip-15a's gaps) and idempotent upsert-by-`sourcedId` semantics; requires the two code systems (CLS codes vs access_codes) to be collapsed first so imports have one enrollment path `[observed problem: wip-02 F1-5]`.
*Risks:* CSV dialect drift per SIS (mitigate: validation report + dry-run diff before commit); orphan/duplicate student matching when a district switches from manual to synced rosters (mitigate: match on district-scoped `student_number` + email, with an explicit merge queue).

### 2.2 SSO

**Options:** Google OAuth (Supabase native provider) · Clever SSO (OAuth2, part of C above) · ClassLink SSO (SAML/OAuth) · Microsoft Entra ID · email+password.

**Recommendation:** Google SSO first for both students and staff (Supabase Auth supports Google natively — config change + domain-claim UX, S–M effort `[documented: https://supabase.com/docs/guides/auth/social-login/auth-google, Jan-2026]`), because US K-12 device/identity share is dominated by Google Workspace for Education `[estimated]` `[requires validation]`. Clever SSO ships with Clever rostering; ClassLink after. Keep password accounts for pilots and non-SSO districts **but add forced first-login password reset for bulk-created students** (closes wip-02 F1-4 `[observed]`). Microsoft Entra: desirable-later, only on demand.
*Dependency:* account-linking rules (SSO identity ↔ existing email account ↔ rostered `sourcedId`) must be specified before any provider ships; under-13 Google sign-in flows depend on district Workspace management `[assumption]` `[requires validation]`.
*Risk:* SSO + rostered accounts makes email the join key; rostered students often have district-issued emails that change on transfer — store immutable `sourcedId` as primary external key, email as mutable attribute.

### 2.3 Account lifecycle (year rollover, transfers, graduation)

Current: nothing `[observed, §1.1]`. Enrollment rows are (class_id, student_id) with no term (`20260211195248:103-106`), class delete is a destructive cascade (`wip-02 D8`).

**Proposed model:**
- Add `academic_sessions` (year/term, per district) and scope `classes` and `student_enrollments` to a session; enrollments get `status ∈ {active, transferred_out, completed, archived}` instead of row deletion.
- **Rollover** = bulk transition: end-of-session job archives classes/enrollments (data intact, teacher read access ends per retention policy), new session's roster arrives via CSV/sync. Learner-owned longitudinal data (mastery, FSRS state, xp_events) persists across sessions — that continuity is a product differentiator for multi-year A1→A2 progressions.
- **Transfers:** enrollment ends in class A, begins in class B (possibly other school); teacher A's access to *future* data ends at transfer (requires point-in-time access windows on the teacher-read RLS helpers — extends `is_teacher_of_student` with enrollment-period checks) `[proposed]`. Note the academic-year keying bug (calendar-year flip on Jan 1, `wip-01a F1.4 [observed]`) must be replaced by session-based keying at the same time.
- **Graduation/exit:** session end triggers retention countdown per district config; export-then-purge path (depends on the DSAR/export processor existing — wip-15a G7 `[observed gap]`).
*Effort:* M–L. *Risk:* retro-fitting session scoping onto live enrollment RLS is the riskiest migration in this document; do it before scale, not after.

### 2.4 Assignments, interventions, accommodations

- **Unify the two assignment systems** (`assignments` vs `class_curriculum_assignments`, two inboxes — wip-02 I1 `[observed]`) into one assignment model with type = {lesson, unit, conversation-mission}, one student inbox, and a **real per-student submission/status table** (the missing feedback loop, wip-02 §4.4 `[observed]`). Effort M.
- **Make differentiation real:** targeting (CEFR/WIDA band, group) must filter server-side (RLS or edge function), not cosmetically (closes wip-02 F4-1 `[observed]`). Effort S once unified.
- **Interventions:** the needs-help grouping already computes who is behind `[observed: NeedsHelpGroups.tsx]`; add a teacher action on top — assign a scaffolded variant, extra FSRS review load, or an audio-first pathway — recorded as an `interventions` row so admin reporting can show intervention→outcome linkage. Effort M. `[proposed]`
- **Accommodations as first-class, server-enforced per-student flags** `[proposed]`:

| Accommodation | Mechanism | Builds on `[observed]` |
|---|---|---|
| Extended time (e.g., 1.5×/2×) | multiplier applied server-side wherever timing matters (timed checkpoints, session limits); stored per student, teacher/admin-settable | timing data exists (`exercise_attempts.response_ms`, `submit-exercise/index.ts:93-94`) |
| Audio-first | TTS auto-play on prompts, audio-primary exercise variants, dictation de-emphasis | `SpeakButton` is already on lesson/review surfaces (`wip-02 §0`) |
| L1 scaffolding level (none/light/heavy) | per-student override of the CEFR-graded L1 ratio, passed to tutor prompts and (future) exercise instructions | `chat-with-tutor` graded-L1 ratios (`wip-13a §5.4`) — generalize, don't reinvent |
| Reduced item load / chunking | per-assignment item-count cap | lesson runner already sequences items |

Store on an `accommodations` table (student_id, type, value, set_by, effective dates), readable by teacher-of-student, applied inside edge functions (never client-side, or it's bypassable). *Dependency:* L1 scaffolding accommodation depends on the localization overhaul's server-authoritative L1 (`wip-13a §11.3`) and localized instruction strings. Effort M (flags + 2 enforcement points) growing with each enforcement surface.

### 2.5 Teacher reporting

Keep and polish the benchmarks layer (heatmap, coverage, readiness, needs-help) — it is the differentiator `[observed]`. Additions `[proposed]`: (a) per-assignment completion report (depends on submissions table); (b) weekly digest email per class (depends on a notifications/email channel — none exists, wip-01a F2.4 `[observed]`); (c) fix teacher-report trust prerequisites — XP/streak numbers teachers see must come from the single server-authoritative economy (wip-01a F6.1–F6.4 `[observed exploit]`), or the reports are unreliable.

### 2.6 Admin reporting

Nothing exists today beyond profile fragments `[observed §1.1]`. **Proposed minimum admin surface** (school/district admin role, properly granted — not self-serve): usage adoption (active students/teachers per school per week), progress rollups (can-do mastery distribution by school/grade), quota consumption vs license, accommodation/intervention counts. All rollups derive from existing tables (`xp_events`, `skill_mastery`, `student_usage_limits`) via nightly aggregate views `[proposed]`. *Dependency:* tenant scoping (district_id on classes) is a hard prerequisite — admin reporting without tenancy would leak cross-district data `[observed risk, wip-15a §3]`. Effort M after tenancy.

### 2.7 Exports

- Teacher CSV/JSON exists (`ExportReportButton.tsx` `[observed]`); audit its fields against what teachers actually submit for grades/EL documentation `[requires validation with pilot teacher]`.
- Add: class gradebook CSV (per-assignment status/scores), district data-export (admin-initiated, all-students-in-tenant, machine-readable) — the latter doubles as the DSAR/offboarding export processor the compliance layer lacks (wip-15a G7 `[observed]`). Effort M.
- **Avoid** LTI gradebook write-back and SIS write-back at this stage (§3.5).

### 2.8 Synchronized-classroom mode (30 devices, one activity)

**Options:** (a) Supabase Realtime channels (already in stack) with a teacher-paced session; (b) polling a `class_session` row every 2–5 s; (c) WebRTC/peer — rejected outright (school NAT/firewalls).
**Recommendation:** (a) with (b) as automatic fallback, because district networks sometimes proxy/block WebSockets `[assumption]` `[requires validation on pilot network]`. Design: teacher opens a session on an activity → students' devices join a channel keyed by class session → teacher controls pacing (start/pause/advance) → results aggregate live to the teacher view. Server-authoritative answers unchanged (`submit-exercise` path is reused `[observed]`). 30 concurrent clients on one channel is well within Supabase Realtime capability `[documented: https://supabase.com/docs/guides/realtime, Jan-2026]` `[requires validation at classroom scale on school wifi]`. Effort L. **Not pilot-blocking** — classic asynchronous mode is sufficient to pilot; sync mode is a paid-tier wow-feature (§3.4).

### 2.9 Low-power devices & school-network constraints

Current posture: no offline story, no service worker, thin mobile layout, fallback chains that hit dead endpoints `[observed, wip-01a §8]`. Target `[proposed]`:
- **Device floor:** define and test against a low-RAM Chromebook profile (4 GB, older Celeron) `[assumption re: fleet composition]` `[requires validation in pilot]`; bundle-size budget and route-splitting already exist `[observed, wip-02 §9.10]`.
- **Network:** publish a domain allowlist for district content filters (Supabase project domain, TTS/AI provider endpoints). **The Lovable AI gateway in the data path is a procurement and allowlist liability** (single reseller vendor, wip-01a F9.6 `[observed]`) — the voice/provider workstream should treat "direct provider contracts or documented subprocessor chain" as a district prerequisite `[proposed]`.
- **Degraded mode:** queue-and-retry for `submit-exercise` (currently a dropped attempt on failure, `useLessonRunner.ts:93-98` `[observed]`); browser-TTS fallback already exists for TTS exhaustion `[observed, wip-01a §1.3]`. Full offline PWA: desirable-later.
- Fonts for 12+ scripts self-hosted (filtered networks block Google Fonts; today there are zero font declarations `[observed, wip-13a §7]`).

### 2.10 Support operations

Nothing exists: no error telemetry, no admin impersonation/diagnostics, no status page, silent client failures `[observed, wip-01a F3.3, F8.2]`. Target `[proposed]`: error reporting with session correlation (before pilot — otherwise classroom failures are invisible); a support runbook with the top 10 classroom failure modes (mic permissions, filtered domains, login loops); an in-app "get help" surface with teacher-visible error codes; support SLA definition before paid deployment. Effort S–M.

### 2.11 Procurement documentation set — technical readiness only

`[proposed]` Build the evidence base that district procurement asks for; **explicitly not legal claims**:
- **Security questionnaire readiness:** a maintained internal answers document mapping to common district questionnaires (hosting, encryption in transit/at rest, RLS model, subprocessor list, breach process, data flows). Blocker: the current repo would answer several questions badly (self-serve teacher role, no audit trail, no deletion) `[observed]` — the §3 gap buckets sequence exactly these.
- **DPA template needs:** technical capability to *honor* standard student-data-privacy agreement terms (e.g., the Student Data Privacy Consortium's national DPA framework, https://privacy.a4l.org/national-dpa/ `[documented, Jan-2026]` `[requires validation]`): enumerated data elements collected, subprocessor list (Supabase, Azure Speech, OpenAI, Lovable gateway — the gateway must be resolved, §2.9), deletion-on-request capability, breach-notification capability, no-sale/no-ads posture. Also reconcile `Legal.tsx` claims with actual providers/pricing first (wip-01a F1.5 `[observed]` — a named-model mismatch is exactly what derails questionnaires).
- **Accessibility conformance statement path:** target WCAG 2.1 AA (https://www.w3.org/TR/WCAG21/ `[documented, Jan-2026]`), produce an ACR using the ITI VPAT template (https://www.itic.org/policy/accessibility/vpat `[documented, Jan-2026]`) after an audit. Known current failures to fix first: no `aria-live` answer feedback, non-ARIA nav popover, copy-blocking on Practice, hardcoded-gray contrast issues, static `lang="en"`, zero RTL `[observed, wip-02 §6; wip-13a §4.3, §6]`.
- **Age-gating/consent technical posture:** describe what the system enforces (server-side minor determination `[observed strength]`) and close the enforcement gap (flags gate nothing today `[observed]`) before any statement is drafted.

---

## 3. Mandated gap analysis — five buckets

Effort: S ≤1 wk · M 1–4 wk · L >4 wk `[estimated]`. Deps reference items by ID.

### 3.1 Required before ANY pilot (even free, one classroom)

| ID | Item | Effort | Dependencies / notes |
|---|---|---|---|
| P1 | Kill self-serve teacher→student-PII path: teacher role becomes granted (admin/verified), `add_by_email` becomes invite-based or school-scoped | M | wip-15a G1/§7.2 `[observed]`. Non-negotiable with minors |
| P2 | Enforce `is_minor`/`safety_mode` server-side in chat/voice prompts + output moderation; add crisis-escalation routing instead of blocklisting crisis terms | M | wip-01a F7.1, F7.3; wip-15a §7.3 `[observed]` |
| P3 | Close `award-xp` exploit; single XP/streak economy (System A) so teacher-visible data is trustworthy | M | wip-01a F6.1–F6.4 `[observed]`; pilot measures depend on this data |
| P4 | Forced password reset for bulk-created students; stop teacher-chosen plaintext passwords | S | wip-02 F1-4 `[observed]` |
| P5 | Curriculum-assignment submission/status tracking (teacher can see who did the work) | M | wip-02 §4.4 `[observed gap]`; pilot's operational metrics need it |
| P6 | Onboarding reachable + L1 lifecycle fixed (route incomplete profiles; L1 from `profiles.native_language`, no 7-day expiry) | M | wip-02 F1-1; wip-13a G3 `[observed]` |
| P7 | Localize the core learner loop for the pilot's actual L1s (Learn/LessonPlayer/VocabReview/Placement) + correct-L1 glosses for those L1s | M–L | wip-13a G1, G2 `[observed]`; scope to pilot languages only |
| P8 | Error telemetry + support runbook (classroom failures must be visible same-day) | S–M | wip-01a F3.3 `[observed]` |
| P9 | Baseline product analytics events (logins, lesson starts/completes, feature use) — the pilot cannot be measured without them | S–M | wip-01a F3.2 `[observed]` |
| P10 | Leaderboard default to class scope (no cross-school ranking of minors); remove/rename ACTFL-labeled certificates | S | wip-01a F6.6, F5.1 `[observed]` |
| P11 | Delete/lock orphan endpoints (`verify-certification-code`, `seed-course-data`, etc.) and fix unauthenticated patterns | S | wip-01a F9.1–F9.2; wip-15a F1–F5 `[observed]` |
| P12 | Live-schema reconciliation (dump + reconcile migrations) so quota behavior is knowable | S | wip-01a §10 `[observed]`; prerequisite for P13/D-bucket quota work |

### 3.2 Required before PAID school deployment

| ID | Item | Effort | Dependencies |
|---|---|---|---|
| S1 | OneRoster 1.1 CSV import with validation + dry-run diff | M | P12; unified enrollment path (wip-02 F1-5 collapse) |
| S2 | Google SSO (students + staff) with account linking | M | S1's external-ID model |
| S3 | Tenancy: `district_id`/`school_id` on classes/enrollments; org config no longer world-readable; admin roles granted not self-served | M–L | wip-15a G2/§3; prerequisite for S6 |
| S4 | Functional audit logging (educational-record access writes real rows) + data-export processor + account-deletion path + retention job | M–L | wip-15a G3, G7, §5 `[observed gaps]` |
| S5 | Quota lifecycle fixed: reset job on academic-session boundaries, tier provisioning working, learner-legible limit messaging | M | P12; wip-01a F1.1–F1.4 |
| S6 | Admin (school-level) reporting + district export | M | S3, P9 |
| S7 | Durable notifications + one email channel (teacher digest, credential resets) | M | none hard; wip-01a §2 |
| S8 | Unified assignment model + enforced differentiation | M | P5 |
| S9 | Class archive semantics replace hard delete | S | precursor to L1-lifecycle (Y1) |
| S10 | Procurement doc set v1: security-questionnaire answers, subprocessor list (Lovable-gateway question resolved), WCAG audit + fix list, reconciled Legal.tsx | M | P1–P4, S4; §2.11 |
| S11 | Accommodations v1 (extended time, audio-first, L1-scaffold level) server-enforced | M | P7 for L1 levels |
| S12 | Accessibility fixes for conformance path (aria-live feedback, nav ARIA, contrast, `lang`, copy-unblock) | M | none |

### 3.3 Required before DISTRICT-WIDE

| ID | Item | Effort | Dependencies |
|---|---|---|---|
| D1 | Clever Secure Sync (rostering + SSO), then ClassLink | L | S1 data model; partner fees `[estimated]` |
| D2 | Academic-session lifecycle: rollover, transfers with access-window RLS, graduation retention countdown | L | S3, S9, S4 |
| D3 | Scale hardening: notification/report queries off per-minute client polling; N+1 roster queries; `usage_counters` TTL | M | wip-01a F2.3, F1.6; wip-02 §4.2 |
| D4 | Degraded-network mode (submission retry queue) + device-floor performance budget + self-hosted fonts | M–L | §2.9 |
| D5 | RTL + full locale registry (Arabic/Farsi/Urdu/Pashto districts) | L | wip-13a G4, §11 |
| D6 | Support ops at scale: SLAs, admin diagnostics, status page | M | P8 |
| D7 | District admin persona complete (multi-school rollups, license/quota management) | M–L | S3, S6 |
| D8 | VPAT/ACR published from S12 audit; DPA-honoring capabilities verified end-to-end | M | S10, S12 |

### 3.4 Desirable later

- Synchronized-classroom mode (§2.8) — L; sales differentiator, not adoption-blocking `[proposed]`
- Google Classroom roster import (teacher convenience) — M
- Microsoft Entra SSO — S–M, on demand
- Family/guardian portal with L1-localized progress views — L (leverages wip-13a assets)
- Offline PWA lesson caching — L
- Teacher-authored/imported content with gauntlet validation — L (wip-01a F4.8)
- LTI 1.3 launch (launch-only, no grade write-back) if LMS-first districts demand it — M–L

### 3.5 Unnecessary complexity to AVOID `[proposed]`

- **Ed-Fi / SIF / direct SIS bidirectional write-back** — district-infrastructure-scale work with near-zero pilot value; OneRoster covers rostering.
- **LTI gradebook sync (AGS)** at this stage — Palavox's mastery model doesn't map cleanly onto LMS gradebooks; a CSV export satisfies the actual teacher need.
- **Building certification into a proctored credential** — the discovery shows the current certificates are invalid as credentials (wip-01a §5 `[observed]`); rename/reframe rather than invest in item banks, rater programs, and verification infra this cycle.
- **Per-district self-hosting / on-prem** — Supabase single-tenant-per-district forks would multiply ops cost; solve with tenancy + subprocessor documentation instead.
- **A real-time "live district dashboard"** — nightly aggregates satisfy admin reporting; streaming infra is unjustified.
- **Custom SSO/IdP or password-vault features** — use platform providers only.
- **Reviving the dropped legacy compliance-table zoo wholesale** (wip-15a §1.1) — rebuild only the four workflows that matter (consent record, access audit, retention, export/delete), not all 21 tables.

---

## 4. Pilot design `[proposed]`

### 4.1 Shape

One ESL classroom (one teacher, 25–30 students, grades 6–8), 4–6 weeks, free, with a named district IT contact. Async mode only (no sync-classroom). Palavox staff on-call; weekly teacher check-in. `[assumption: middle-school ESL is the target segment — matches authoring gauntlet's "US middle school" framing, `contentGauntlet.ts` bias gate `[observed]`]`

### 4.2 Entry criteria (gate)

All §3.1 items P1–P12 complete and verified, plus:
- E1: Pilot-classroom L1 coverage confirmed — every enrolled student's L1 is selectable, drives UI + glosses (P6/P7); if a student's L1 is one of the 5 unselectable packs (wip-13a §2.1 `[observed]`), it is enabled first.
- E2: Network dry-run on the school's actual wifi/filter: login, lesson, TTS, chat all pass; domain allowlist delivered to IT.
- E3: Rostering rehearsal: teacher rosters the class (bulk-create with forced reset, or CSV) in ≤30 min with zero support intervention.
- E4: Data agreement executed per district process (business/legal owns content; product owns that export-on-request and delete-on-request actually function — S4 may be waived for a pilot **only** with an explicit documented deletion commitment honored manually) `[requires validation with district]`.
- E5: Baseline instrumentation live (P9) and a pre-pilot snapshot of class can-do mastery captured.

### 4.3 What the pilot measures

**Learning metrics** (all computable from existing server-authoritative tables `[observed: skill_mastery, xp_events, vocab_card_state, lesson_progress]`):
- L-1: Can-do mastery delta — % of tracked A1-band can-do statements per student moving to mastered (≥0.8, ≥5 attempts — current thresholds `[observed, useLearningPath]`); target: median student masters ≥6 new statements over the pilot `[estimated target — calibrate week 1]`.
- L-2: Vocabulary retention — FSRS again-rate on reviews ≤20%, ≥100 reviews/student median.
- L-3: Practice depth — median ≥3 sessions/week, ≥12 min/session active learning `[estimated]`.
- L-4: Teacher-judged transfer — teacher rubric rating (weekly, 3 items) on observed classroom language use; qualitative anchor for L-1.

**Operational metrics:**
- O-1: Roster time ≤30 min; day-1 login success ≥95% of present students without individual troubleshooting.
- O-2: Support load ≤0.2 tickets/student/week after week 1; zero data-visibility incidents (student seeing another's data) — hard fail.
- O-3: Error budget: <1% of `submit-exercise` attempts lost (P8 telemetry measures); TTS/chat availability ≥99% during class periods.
- O-4: Teacher workflow adoption — teacher checks benchmarks/assignment-status views ≥2×/week unprompted; assigns ≥1 differentiated assignment (S8 preview or manual grouping).
- O-5: Accommodation usage where applicable — extended-time/audio-first flags applied and observably honored `[requires S11 at least in minimal form, else logged as manual workaround]`.
- O-6: Device/network floor — measured task success on the school's actual device model; no class period abandoned due to product failure.

### 4.4 Exit criteria

**Pass (proceed toward paid, unlock §3.2 investment):** all hard-fail items clean (O-2 data-visibility, E4 commitments honored), ≥4 of {L-1, L-2, L-3, O-1, O-3, O-4} at target, teacher would recommend (NPS-style ≥8/10), and district IT signs off on the network/security experience.
**Fail/iterate:** any hard-fail, or learning metrics flat with healthy usage (content/pedagogy problem — route to curriculum workstream), or usage collapse after week 2 (engagement problem — route to learner-experience workstream).
**Evidence pack produced either way:** anonymized metrics readout + teacher testimonial + ops report — this becomes the seed of the §2.11 procurement documentation.

---

## 5. Consolidated risks

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Pilot proceeds before P1/P2 (minors' data + safety holes) | — | Existential (trust/район procurement) | Hard gate §4.2; these are not parallelizable-away |
| Schema drift makes quota/limits behavior unknowable in classroom (`[observed, wip-01a §10]`) | High | Medium — mid-pilot feature loss | P12 first; S5 before paid |
| Lovable gateway subprocessor blocks DPA/security questionnaire | Medium | High for paid | Resolve in voice/provider workstream before S10 |
| CSV rostering underestimated (SIS dialect chaos) | Medium | Medium | Dry-run diff UX; pilot with one known SIS export `[requires validation]` |
| i18n scope explosion (41 L1s) | High | Medium | P7 scopes to pilot L1s only; registry architecture (wip-13a §11) prevents rework |
| External-cost assumptions wrong (Clever/ClassLink fees, Google K-12 share) | Medium | Low–Medium | All flagged `[estimated]` `[requires validation]`; confirm before D1 budgeting |
| Session-scoped RLS migration (D2) breaks teacher access | Medium | High | Stage behind tenancy (S3); shadow-verify access parity before cutover |

## 6. Measurable acceptance criteria for this plan's implementation

1. A verified-teacher-only path exists: an unprivileged account cannot obtain any other student's profile/progress rows by any sequence of role flips + enrollments (automated test) — closes wip-15a G1.
2. A `safety_mode='strict'` account demonstrably receives modified AI prompting and output moderation (test transcript diff) — closes wip-01a F7.1.
3. A district-formatted OneRoster 1.1 CSV bundle (orgs/users/classes/enrollments) imports idempotently: re-import produces zero duplicate rows; dry-run diff matches applied changes.
4. A student can complete Google SSO sign-in and land in their rostered class with zero manual linking for the matched-email case.
5. Teacher assignment view shows per-student status (not started/in progress/complete) for a curriculum assignment within 60 s of student completion.
6. An accommodation flag (extended time 1.5×) set by the teacher measurably changes server-side behavior for that student only.
7. Year-rollover rehearsal on a staging tenant: archive + re-roster completes with all prior-year learner mastery/FSRS data intact and prior-year teacher access removed.
8. Admin export produces a complete per-tenant dataset; deletion request removes the student's rows (spot-checked across the 7 progress tables) within the committed window.
9. Pilot instrumentation dashboard reports every §4.3 metric from live data with no manual queries.
10. All §3.1 items closed and re-verified against the checked-in evidence cites before any pilot start date is set.

---
*End of document. All `[proposed]` content is design intent for the PLANNING phase; nothing here has been implemented at commit `7cbaadd9`.*
