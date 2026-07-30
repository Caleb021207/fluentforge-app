# 03 · Feature Decision Matrix

Every major existing feature, with a disposition. Verdicts draw on the discovery audits
(01, 02, wip-*) and the design docs (05–15). The protected uploaded-assessment flow is
**exempt from replacement** by owner mandate — its row records improvements only.

**Disposition key:** `retain` · `retain+optimize` · `redesign` · `consolidate` · `replace` ·
`deprecate` · `remove` · `owner-decision`

| # | Feature | Current behavior (evidence) | Disposition | Proposed future behavior | Value (learner/teacher/district) | Scope | Migration risk |
|---|---------|------------------------------|-------------|--------------------------|----------------------------------|-------|----------------|
| 1 | Curriculum spine (courses→units→skills→lessons→exercises) | Sound schema, seeded with ~1 demo course (wip-01a §4) | **retain+optimize** | Becomes the platform backbone for both language directions; add language-pair keys, mission/checkpoint entities per 04/07/08 | High/High/High | M | Low — additive schema |
| 2 | Lesson player | MCQ-only; drops optionless exercises; completion UI contradicts server rule (02 §2) | **redesign** | One player, pluggable primitive renderers for all 22 primitives (06) | High/–/– | L | Med — new renderers, old lessons still play |
| 3 | Exercise grading (`submit-exercise`) | Server-authoritative, MCQ answer keys only | **retain+optimize** | Extend to type-aware grading per 06; keys stay server-only | High/–/– | M | Low |
| 4 | Vocabulary review (FSRS-ish) | Real scheduler, lesson-scoped queue; recognition-only evidence | **retain+optimize** | Unified memory model per 05: chunks, grammar, phonemes, productive-use evidence, error-derived items | High/–/– | M | Med — state migration with rollback |
| 5 | AI text chat (`chat-with-tutor`) | Works; CEFR-graded L1 scaffolding (60%→2%) is excellent (wip-13a) | **retain+optimize** | Keep scaffolding engine; bind to curriculum context + mission contracts (09) | High/–/– | M | Low |
| 6 | Realtime voice (OpenAI WebRTC) | Works but personalization dead (no body sent), caps illusory, model mismatch (wip-11a) | **redesign** | Hybrid routing per 11: deterministic-first cascade for drills, realtime S2S where open conversation warrants it; new agent-hosting component; real quota enforcement | High/High/High | XL | High — phased with rollback, benchmark-gated |
| 7 | Free voice chat (browser SpeechRecognition) | Browser-only STT, quality varies (wip-11a) | **retain** as degraded/low-bandwidth tier (Pattern F floor) | Explicit fallback mode with honest labeling | Med/–/High (equity) | S | Low |
| 8 | Pronunciation coaching | LLM judging a browser transcript; no acoustic data (wip-11a) | **replace** | Azure Pronunciation Assessment (phoneme-level, minimal pairs, es variants) per 11; async analysis pattern | High/Med/Med | L | Med — new provider, benchmark first |
| 9 | Placement quiz | Fixed after July pass; persists `placement_cefr`; JWT-gated grading traps anonymous users (02 §3) | **retain+optimize** | Require sign-in before starting; consume placement in path unlocking (already does); label as *course starting point*, never proficiency | Med/Med/– | S | Low |
| 10 | Uploaded assessment (PROTECTED) | Flow exists end-to-end but PDFs always rejected; results unreadable by UI; teacher RLS dead; silent failures (wip-12a) | **retain + repair (mandated)** | Full fix plan in 12: PDF support, status lifecycle, schema-validated outputs, restored teacher visibility via new tenancy, idempotency | High/High/High | M | Low — flow-preserving, characterization-tested |
| 11 | Certificates (reading/writing/fluency) | "ACTFL Advanced Low" from one LLM judgment; spoofable image path (wip-01a F5.1) | **owner-decision** (recommend: deprecate claims → rename to "course achievement," gate any proficiency language behind the protected assessment) | Per claims policy in wip-03a | Risk-removal | S–M | Low |
| 12 | XP/streaks/levels | Two economies; `award-xp` exploitable; `check-streak` unsigned JWT; three streak numbers can disagree (wip-01a F6.x) | **consolidate** | Single server-side economy (the `learnerProgress.ts` one); retire legacy endpoints; leaderboard reads the live column | Med/Med/– | M | Med — data merge |
| 13 | Challenge mode / conversation assignments | Works after July fixes; separate from curriculum assignments | **consolidate** | One assignment system with submission tracking for both conversation and curriculum work (04) | Med/High/High | L | Med |
| 14 | Curriculum assignments (`class_curriculum_assignments`) | No submission tracking; differentiation targets unenforced (02 §4) | **consolidate** (into #13) | Differentiation enforced server-side; submissions tracked | –/High/High | M | Low |
| 15 | Teacher dashboard | Six tabs, fragmented rosters/pickers; metrics fixed in July pass | **redesign** | Class-context-first dashboard per 14; needs-grading queue; intervention flags; honest metrics | –/High/High | L | Med |
| 16 | Onboarding wizard | Unreachable for self-signup (02 §1); credentials screen exists | **redesign** | Signup → role/L1/class-join wizard inline; verified-teacher path per 15 | High/High/High | M | Low |
| 17 | Class join (3 mechanisms) | `join_class_by_code` works; access codes partially broken; add_by_email is the abuse vector (wip-15a) | **consolidate** | Class codes + rostering as the paths; kill unsanctioned add_by_email; scope by school | High/High/High | S | Low |
| 18 | Bulk student creation | Works; teacher-set plaintext passwords, no forced reset (02 §4) | **retain+optimize** | Generated passwords + forced reset + login cards per 14 | –/High/High | S | Low |
| 19 | Rostering integrations (Clever/ClassLink) | Honest stubs (wip-01a) | **redesign** (build for district tier) | OneRoster CSV first, Clever SSO+rostering next per 14 gap analysis | –/–/High | L–XL | Med |
| 20 | Localization system | Façade: ~20% median coverage, zero `t()` in core surfaces, single-L1 glosses, no RTL (wip-13a) | **redesign** | Language-pair architecture per 13; wire unmerged packs (free ~2× coverage); RTL enablement; L1-keyed gloss table | High/–/High | XL | Med — incremental by surface |
| 21 | Compliance/safety layer | Age gate writes fields nothing reads; 90-term blocklist; no crisis path (wip-01a F7.x) | **replace** | Server-enforced safety_mode at every AI touchpoint + output moderation + crisis escalation per 15 §3 | Critical/–/Critical | L | Low — additive enforcement |
| 22 | Multitenancy (district/school tables) | Rows without isolation; world-readable settings (wip-15a) | **redesign** | Real tenant model per 15 §1; required before any paid school deployment (14) | –/–/Critical | XL | High — staged, characterization-tested |
| 23 | Subscriptions/billing | No billing code; tier via access-code metadata; contradictory pricing copy (wip-01a §1) | **owner-decision** | Requires a pricing/packaging decision before building anything | Commercial | M–L | – |
| 24 | Usage quotas | Schema drift makes behavior indeterminate; resets have no scheduler (wip-01a §10) | **redesign** | Single quota service, live-schema-first reconciliation, scheduled resets, server-measured durations | Med/–/High | M | Med — needs live schema dump first |
| 25 | Analytics/telemetry | None exists (wip-01a F3.3/F3.4) | **replace** (build) | Event taxonomy + rollups per wip-03a; provider-cost dashboards; FERPA-conscious | –/High/High | L | Low |
| 26 | Notifications | Teacher-only, read-state per-browser (02) | **redesign** | Server-side read state; student nudges post-MVP | Low/Med/– | S–M | Low |
| 27 | Author/content tooling + gauntlet | Six-gate gauntlet is strong; two seeders coexist | **retain+optimize** | One seeding path through the gauntlet; author UI for curriculum ops per 07/08 workload | –/–/– | M | Low |
| 28 | Transcript-analysis UI surfaces | Readers don't unpack `analysis_data` (wip-12a) | **retain + repair** | Contract repair per 12 | High/High/– | S | Low |
| 29 | Orphaned edge functions (8) + unguarded (3) | Dead/exploitable surface (wip-01a F9.x) | **remove** (after guard audit) | Delete orphans; guard or delete the rest | Risk-removal | S | Low |
| 30 | Landing/brand system | Rebuilt July 2026; strong | **retain** | — | Med/–/Med | – | – |
| 31 | Dead deps (`@11labs/react` etc.) | Unused since Oct 2025 (wip-11a) | **remove** | — | Hygiene | S | Low |

## Notes

- **Scope classes:** S <1 wk · M 1–3 wk · L 3–8 wk · XL >8 wk (single senior engineer
  equivalents; [estimated], see roadmap assumptions in 17).
- Rows 21 and 22 are prerequisites for any school pilot per the district gap analysis (14);
  row 10's repairs are mandated by the protected-flow constraint (12).
- Acceptance criteria per row live in the referenced design docs; the roadmap (17) sequences
  these dispositions into phases.
