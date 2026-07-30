# 01 · Current Product Audit (Consolidated)

**Baseline:** branch `overhaul`, commit `7cbaadd9` · Audited 2026-07-30 by six read-only
specialists. This document consolidates their verdicts; the full evidence (file:line citations,
claim labels) lives in the companion files:

| Deep-dive | File |
| --- | --- |
| Product & feature inventory | `wip-01a-product-inventory.md` |
| End-to-end user flows | `02-current-user-flows.md` |
| Voice/speech infrastructure | `wip-11a-voice-current-state.md` |
| Localization | `wip-13a-localization-current-state.md` |
| Data, security, multitenancy | `wip-15a-data-security-current-state.md` |
| Uploaded-assessment workflow | `wip-12a-assessment-current-state.md` |

All claims below are [observed] in the repository unless labeled otherwise.

---

## 1. What Palavox is today

Two products fused in one codebase:

1. **A newer, well-engineered learning spine** — the curriculum tree
   (courses→units→skills→lessons→exercises), server-authoritative grading
   (`submit-exercise` + `_shared/learnerProgress.ts`), an FSRS-style vocabulary scheduler,
   a six-gate AI content-authoring gauntlet (`_shared/contentGauntlet.ts`), ephemeral-token
   realtime-voice minting, fail-closed rate limiting, and a hardened RLS baseline. **This layer
   is worth preserving wholesale.**
2. **An older client-trusting layer wrapped around it** — exploitable XP endpoints, JWT parsing
   without signature verification, LLM-minted certificates, localStorage "safety modes,"
   base64 branded as encryption, and quota systems whose schema no longer exists. This layer is
   variously exploitable, dead, or dishonest about what it does.

The fusion is visible everywhere: **two XP economies, two streak systems, two level formulas,
and two content seeders run simultaneously.**

## 2. The ten most consequential problems

Ranked by (impact on learners/schools) × (certainty of evidence):

1. **Safety theater for minors.** `verify-age` correctly determines minority server-side and
   writes `is_minor`/`safety_mode` — then *nothing anywhere reads them*. AI input passes an
   ~8-word English regex; AI output is never filtered; there is no crisis-escalation path
   (the blocklist silently swallows "suicide"). The COPPA gate blocks nothing.
2. **Anyone can become a "teacher" and read any student's records.** The role is self-settable
   and `class-roster add_by_email` enrolls any student by email into the attacker's class —
   no school scope, no consent. Combined with teacher-visible transcripts/grades this is the
   single worst security finding.
3. **The protected assessment flow rejects its own input.** The client accepts PDFs; the edge
   function accepts images only (`data:image/` check) — **PDF uploads always fail**. Where
   processing succeeds, rich results are written into a JSONB column no reader unpacks, teacher
   visibility is RLS-dead, failed inserts return `success: true`, and parse-failure stubs are
   persisted as real analyses.
4. **Onboarding is unreachable for self-signup.** Signup lands on `/learn`; the wizard only
   mounts via `/profile`. Role, L1, and class-join are silently never captured. Anonymous
   visitors can finish the placement quiz and silently receive a default "A1" because grading
   requires a JWT they don't have.
5. **Localization is a façade at every level.** 40 packs ship, but the median pack covers ~20%
   of the 1,240 runtime keys; the rebuilt core student surfaces (Learn, LessonPlayer,
   PlacementQuiz, ChallengeMode, VocabReview) contain **zero `t()` calls**;
   `vocabulary.translation_l1` is a single Spanish-only column (a Farsi learner reviews
   "family = familia"); no RTL; language preference expires after 7 days with no post-login
   switcher. [observed] — the full coverage matrix is in the localization audit.
6. **Lesson delivery is MCQ-only** although the schema defines nine exercise types; optionless
   exercises are silently dropped client-side, and the lesson-complete screen contradicts the
   server's completion rule.
7. **Voice value props don't reach the wire.** The realtime client sends no body, so CEFR/
   language personalization always defaults to B1/English; the premium 15-min cap reads a
   counter nothing increments; the session mints one model and pins another in SDP; pronunciation
   "analysis" is an LLM judging a browser transcript — no acoustic/phoneme data exists anywhere;
   quota accounting trusts client-supplied duration.
8. **Proficiency claims outrun evidence.** "ACTFL Advanced Low" certificates issue from a single
   LLM judgment of user-supplied material with no rater agreement, proctoring, expiry, or
   verification path; a certificate can be minted from a spoofable image upload.
9. **No tenancy.** District/school tables exist but student data carries no tenant key;
   isolation is row-ownership only; `schools`/`districts`/settings are world-readable to any
   authenticated user. The consolidated schema baseline silently **dropped the entire prior
   COPPA/FERPA scaffolding** (consent records, retention logs, audit tables) — the FERPA access
   log has one writer that is never called.
10. **The repo cannot tell you what quotas do.** Migration baseline, older quota migrations, and
    generated types disagree about which columns exist (`student_usage_limits`,
    `time_restrictions`, `courses`); monthly quota resets exist as SQL with zero callers and no
    scheduler. Resolving this requires dumping the live schema [requires validation].

Additional material findings: `award-xp` accepts client-supplied sources (~600 XP/request, loops
freely, inflates teacher-visible metrics); `check-streak` parses JWTs without verifying
signatures; 8 of 37 edge functions are orphans, 3 perform no in-body auth (including an
access-code oracle and an any-user roster export with FERPA exposure); no error telemetry or
product analytics exist at all; `.env` is committed (public anon key only — latent hazard);
`@11labs/react` is a dead dependency from the ElevenLabs era.

## 3. Strengths worth preserving (explicit)

- Server-authoritative grading with admin-only answer keys; RLS enabled everywhere with a real
  hardening pass; `search_path`-hardened SECURITY DEFINER helpers.
- The curriculum spine's data model (incl. can-do statements, WIDA/CEFR duality) and the
  six-gate content gauntlet.
- FSRS-style scheduling core and mastery EWMA in `learnerProgress.ts`.
- `chat-with-tutor`'s CEFR-graded L1-scaffolding ratios (60% L1 at A1 → 2% at C2) — the
  pedagogical keystone for the language-pair architecture.
- Ephemeral-token voice session minting; fail-closed rate limiting; origin-allow-listed CORS.
- The uploaded-assessment flow's shape (append-only history, server-only writes of proficiency
  data, separation from placement) — the flow needs repair, not replacement.
- The brand system and rebuilt student navigation/UX from the July 2026 pass.

## 4. Verdict

The platform's bones — schema, grading, gauntlet, voice token flow — support the
conversation-first product the owner wants. The failure modes are concentrated in (a) trust
boundaries inherited from the older layer, (b) claim/behavior gaps (safety, certificates,
quotas, localization), and (c) missing institutional structure (tenancy, consent, audit,
telemetry). The overhaul plan therefore **rebuilds around the spine rather than replacing it**,
and sequences trust-boundary repairs before any new capability.
