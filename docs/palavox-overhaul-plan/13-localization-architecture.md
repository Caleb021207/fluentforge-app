# 13 — Localization & Language-Pair Architecture (Target Design)

- **Repo:** `/Users/calebjaworski/fluentforge-app`, branch `overhaul`, commit `7cbaadd9`
- **Date:** 2026-07-30
- **Author role:** Localization and Language-Pair Architecture Specialist (planning phase — no implementation)
- **Inputs:** `wip-13a-localization-current-state.md` (i18n audit), `wip-02-current-user-flows.md` (journey audit), plus read-only repo spot-verification at this commit.
- **Labels:** [observed] repo evidence · [documented] external, URL+date · [estimated] · [proposed] design decision · [assumption] · [requires validation]. "Current" always means behavior at `7cbaadd9`; "Target" always means proposed.

---

## 0. Executive summary — the decisions

| # | Decision | Recommendation [proposed] |
|---|---|---|
| D1 | Language-pair model | Explicit `(instruction_language, target_language)` pair as a platform primitive, backed by a **single-source locale registry** (repo JSON → generated TS module + seeded DB table) replacing today's ≥6 divergent hardcoded lists |
| D2 | Learner L1 authority | **Server-authoritative**: `profiles` drives UI locale and tutor L1; localStorage demoted to a boot-hint cache with **no expiry**; kill the 7-day reversion |
| D3 | UI string engine | Migrate the custom `t()` to **i18next + ICU MessageFormat**, namespaced JSON, keep per-locale lazy chunking |
| D4 | Immediate repair | **Wire the unmerged on-disk pack files first** — a zero-translation-cost win that roughly doubles runtime coverage for Spanish/Nepali/Cantonese/Korean/Arabic/Mandarin — then a key-coverage CI gate so it never regresses |
| D5 | Content localization | **Tiered build-time pipeline**: `content_localizations` table with provenance + `source_hash` versioning; MT draft → human review before a locale is *enabled*; never runtime MT in the learner path |
| D6 | Glosses | Replace `vocabulary.translation_l1` (single Spanish-only column) with L1-keyed `vocabulary_glosses` |
| D7 | Spanish course | **English-only instruction, explicitly** — no L1 matrix, no gloss table rows beyond English; the cheap path, stated as policy |
| D8 | AI interactions | Preserve chat-with-tutor's graded L1 ratios; extract into a shared `languagePolicy` module driven by the registry; add per-L1 `contrastive_notes` into authoring + feedback prompts |
| D9 | TTS | Registry-driven voice/locale map per L1 and per target variant; **es-MX default** for the Spanish course [proposed, requires stakeholder validation] |
| D10 | RTL + fonts | `dir` from registry on `<html>`, logical CSS properties, mirrored-icon audit; **self-hosted Noto subsets** per script [proposed] |
| D11 | Reading level | Student-facing A1-surface strings target **Flesch-Kincaid grade ≤3**, enforced by CI lint on the English source |

Why this shape: the audit shows the current system is a façade — 40 packs at ~20% median runtime coverage, the core learning loop 100% hardcoded English, one Spanish-only gloss column, no RTL, client-authoritative L1 with a 7-day self-destruct (wip-13a §1, §3.3, §5.1, §6) [observed]. The one excellent artifact is chat-with-tutor's graded L1 scaffolding (wip-13a §5.4) [observed]; the target design generalizes that idea — *instruction language as a per-learner, per-level policy* — into data and schema instead of leaving it trapped in one edge function.

---

## 1. Language-pair model

### 1.1 Current vs target concept

**Current [observed]:** the platform's entire pair model is one ternary — `getTargetLanguage: english → spanish, else → english` (`src/utils/languageUtils.ts` / `languageConstants.ts:46-48`, wip-13a §3.5). Language identity lives in ≥6 mutually inconsistent hardcoded lists: `src/translations/constants.ts:6-43` (35 selectable), `types.ts:11-18` (40 typed), `loader.ts:17-57` (40 loadable), `languageUtils.ts` (3 maps), `LanguageSelectionCard.tsx:30-67`, and the chat-with-tutor allowlist (`supabase/functions/chat-with-tutor/index.ts:48-61`, 35 entries) [observed — verified at commit]. Five packs (Burmese, Karen, Tigrinya, Marathi, Sinhala) exist but are unselectable everywhere (wip-13a §2.1) [observed].

**Target [proposed]:** a learner's context is an explicit pair — `(instruction_language L1, target_language L2)` — resolved server-side, carried through every surface (UI chrome, lesson delivery, glosses, tutor, TTS). Product A (ESL) = `(any-of-41 L1, en)`. Product B = `(en, es)`. Nothing else ships initially; the model must make adding `(en, fr)` or `(pt, en)` a data change, not a code change.

### 1.2 Options for the language identity layer

| Option | Description | Pros | Cons |
|---|---|---|---|
| **A. Patch in place** | Keep language-name strings (`"farsi"`), add missing entries to each list | Least churn | Perpetuates 6 sources of truth; no script/direction/font metadata home; every new locale touches ~8 files [observed pattern] |
| **B. Single-source locale registry** (recommended) | One `config/locales.json` in repo → build step generates a typed TS module (client + edge `_shared`) and a migration-seeded `locales` DB table | One authority; metadata-rich (script, dir, fonts, TTS, plurals); DB copy lets RLS/edge functions validate and district admin tooling query it | Build-step plumbing; migration of legacy name-strings to BCP-47 codes |
| **C. External i18n SaaS as registry** (Lokalise/Crowdin-style TMS holds locale config) | Vendor UI for locale management | Registry becomes vendor-coupled and unavailable offline/at build determinism risk; overkill for locale *identity* (still useful for *review workflow*, §5.1) | Cost; district procurement/data-residency questions for a minors-heavy product [estimated] |

**Recommendation [proposed]: Option B.** Rationale: the audit's root disease is list divergence (G5, wip-13a §10); only a generated-from-one-file design structurally prevents recurrence. The DB seed (not runtime-fetched for boot) gives server functions the same truth without an extra request on the hot path.

### 1.3 Locale registry schema [proposed]

Repo source of truth `config/locales.json`, one entry per locale:

```jsonc
{
  "code": "fa",                    // BCP-47 primary key
  "legacyName": "farsi",           // maps existing profiles/localStorage/pack-dir values during migration
  "englishName": "Persian (Farsi)",
  "nativeName": "فارسی",          // preserve current native-script names — a strength (wip-13a §12)
  "script": "Arab",                // ISO 15924
  "direction": "rtl",
  "fontStack": "arabic",           // key into font-stack config (§2.7)
  "pluralRules": "cldr",           // resolved via Intl.PluralRules(code) — no custom data needed
  "tts": { "locale": "fa-IR", "provider": "browser", "fallback": "en-US" },
  "roles": { "instruction": true, "target": false },  // fa can be an L1, not (yet) an L2
  "enabled": true,                 // master switch; gated on font + review criteria (§5.3 AC-10)
  "tier": 2                        // content-localization tier (§3.3)
}
```

Generated artifacts: `src/locales.generated.ts` (client), `supabase/functions/_shared/locales.generated.ts` (edge), migration seeding `public.locales`. The chat-with-tutor `validateLanguage` allowlist (`index.ts:48-61` [observed]) is deleted and replaced by a registry lookup — this alone un-strands the 5 refugee-language packs currently silently coerced to English [observed → target].

**Flags policy [proposed]:** the registry deliberately has **no flag field**. Current UI binds Farsi→🇮🇷, Punjabi→🇮🇳, Arabic→🇸🇦 (`LanguageSelectionCard.tsx:35,45,65` [observed]) — a cultural-sensitivity risk for Afghan Dari speakers and diaspora populations in school deployments (wip-13a §3.5). Selection UI uses native-script names only.

### 1.4 Pair bindings and course model [proposed]

Current: `courses.language text DEFAULT 'en'` is the only language dimension (`supabase/migrations/20260729164446…sql:3-13` [observed]) — it names the *target*, and nothing represents instruction language at all.

Target schema additions (names indicative):

```sql
-- What the course teaches, and its instruction-language policy
ALTER TABLE courses
  ADD COLUMN target_locale text NOT NULL REFERENCES locales(code) DEFAULT 'en',
  ADD COLUMN instruction_policy text NOT NULL DEFAULT 'any_l1'
    CHECK (instruction_policy IN ('any_l1',      -- ESL: instruction renders in learner L1 per tier support
                                  'en_only'));   -- Spanish course: instruction fixed to English (§3.5)

-- Which L1s a course supports, at what depth (drives enablement UI + fallbacks)
CREATE TABLE course_locale_support (
  course_id uuid NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
  l1_code   text NOT NULL REFERENCES locales(code),
  support_level text NOT NULL CHECK (support_level IN ('full','glosses_only','ui_only')),
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','review','enabled','retired')),
  PRIMARY KEY (course_id, l1_code)
);

-- L1-keyed glosses, replacing vocabulary.translation_l1 (Spanish-only single column, wip-13a §5.1-5.2 [observed])
CREATE TABLE vocabulary_glosses (
  vocabulary_id uuid NOT NULL REFERENCES vocabulary(id) ON DELETE CASCADE,
  l1_code text NOT NULL REFERENCES locales(code),
  gloss text NOT NULL,
  example_translation text,
  source text NOT NULL CHECK (source IN ('human','mt','ai')),
  review_status text NOT NULL DEFAULT 'machine'
    CHECK (review_status IN ('machine','in_review','approved','rejected','stale')),
  source_hash text NOT NULL,            -- hash of (lemma, example_sentence) at translation time (§3.4)
  reviewed_by uuid, reviewed_at timestamptz,
  PRIMARY KEY (vocabulary_id, l1_code)
);

-- Localized curriculum text fields (lesson intros, exercise instruction lines, rationales) — §3
CREATE TABLE content_localizations (
  content_type text NOT NULL CHECK (content_type IN ('lesson_intro','exercise_instruction','exercise_rationale','unit_title','skill_title')),
  content_id uuid NOT NULL,
  l1_code text NOT NULL REFERENCES locales(code),
  field text NOT NULL,
  text text NOT NULL,
  source text NOT NULL CHECK (source IN ('human','mt','ai')),
  review_status text NOT NULL DEFAULT 'machine' CHECK (review_status IN ('machine','in_review','approved','rejected','stale')),
  source_hash text NOT NULL,
  reviewed_by uuid, reviewed_at timestamptz,
  PRIMARY KEY (content_type, content_id, l1_code, field)
);

-- Per-L1 contrastive pedagogy layer feeding AI prompts (§4.2) — nothing like this exists today [observed: contentGauntlet.ts has zero L1 input]
CREATE TABLE contrastive_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  l1_code text NOT NULL REFERENCES locales(code),
  target_locale text NOT NULL REFERENCES locales(code) DEFAULT 'en',
  grammar_point text NOT NULL,          -- e.g. 'articles', 'third_person_s', 'p_b_distinction'
  note text NOT NULL,                   -- teacher-readable explanation of the transfer pattern
  common_error_pattern text,            -- machine-usable, e.g. "omits articles: 'I have dog'"
  cefr_range text,                      -- where it bites: 'A1-A2'
  source text NOT NULL CHECK (source IN ('human','ai')),
  review_status text NOT NULL DEFAULT 'in_review' CHECK (review_status IN ('in_review','approved','rejected'))
);
```

**Migration of `translation_l1` [proposed]:** existing values are Spanish glosses seeded by `seedCurriculum.ts:209` ("L1 (Spanish) glosses") [observed] — copy them into `vocabulary_glosses` as `l1_code='es', source='ai', review_status='machine'`, then drop the column. This converts today's bug (every learner sees Spanish, wip-13a §5.3/§9.6 [observed]) into correct per-L1 data with an honest provenance label.

Delivery-path change: `vocab-review` and `learn-lesson` edge functions gain a server-resolved `l1_code` (from profiles, §1.5) and join glosses/localizations on it, falling back to English with an explicit `fallback: true` marker in the payload so the client can render a "shown in English" affordance rather than silently wrong-language content [proposed; current behavior: no learner-language parameter exists in either function, `learn-lesson/index.ts:58,82-94`, `vocab-review/index.ts:96-100` [observed]].

### 1.5 Server-authoritative learner L1 [proposed]

**Current [observed]:** L1 is client-authoritative and self-destructing — set once on the marketing landing page (`NewLandingPage.tsx:89`, the app's *only* `setCurrentLanguage` call site), persisted to secureStorage with a **7-day expiry** (`dataEncryption.ts:155-191`), never synced from `profiles.native_language` (captured at onboarding, `OnboardingWizard.tsx:146,245`; column since migration `20260211195248…sql:18`), and sent to chat-with-tutor from localStorage (wip-13a §3.3). Bulk-created students get `userLanguage="english", targetLanguage="spanish"` defaults (`useChallengeChat.ts:80-81`) — an ESL newcomer tutored in Spanish [observed defaults; scenario requires validation].

**Target resolution order (every session)** [proposed]:

1. `profiles.ui_locale` (new column; explicit user override, set by the switcher §1.6)
2. `profiles.native_language` (migrated from legacy names to BCP-47; set at onboarding **and settable by teacher per student at roster creation** — new CSV/roster column, fixing the bulk-create gap)
3. `navigator.languages` match against enabled registry locales (first-visit only)
4. `en`

- localStorage keeps a copy purely as a **pre-auth boot hint** (avoid flash-of-English before the profile loads), written on every successful resolution, **no expiry** — the 7-day TTL for the language key is removed.
- Edge functions (`chat-with-tutor`, `vocab-review`, `learn-lesson`, `submit-exercise` feedback) re-derive `l1_code` from the JWT-bound profile server-side and **ignore client-supplied language fields** except as an explicit per-message override (the tutor's "translate this" affordance). This closes the client-authoritative integrity gap flagged for district reporting (wip-13a §3.3) [observed → target].
- `LocalizationProvider` sets `document.documentElement.lang` and `dir` from the registry on every locale change — currently static `lang="en"` in `index.html:2` with zero runtime updates [observed].

**Dependency note:** step 2 only works if onboarding is reachable — currently self-signup never routes to the wizard (wip-02 F1-1, critical) [observed]. That fix belongs to the onboarding workstream; this design **depends on it** (§6).

### 1.6 Post-login language switcher placement [proposed]

Current: none — signed-in users are redirected off the landing page (`NewLandingPage.tsx:45`) and `Settings.tsx`/`Profile.tsx` have no switcher (wip-02 F1-3) [observed].

Target:
1. **Settings page** — primary home: "Language / اللغة / Idioma" section, locale list rendered in native script, writes `profiles.ui_locale` then updates context. Label the section bilingually (native + English) so a learner stuck in the wrong language can still find it — standard practice on multilingual products [estimated].
2. **Persistent globe icon in the student header** (`NewLayout.tsx` chrome) opening the same picker as a popover — an A1 learner should never be more than one tap from their language. Justification: the audit's day-8 scenario (UI silently reverts to English with no in-app recovery, wip-13a §9.8) [observed mechanism].
3. **Onboarding wizard** step retains language selection (already present) but now writes profiles as authority.
4. Teacher surfaces stay English-default (current `useClassroomText` behavior, `src/hooks/useClassroomText.ts:18-41` [observed]) — but implemented via the same policy layer with `en` forced by *route-scoped configuration in React Router context*, not the broken `popstate` path listener (`LocalizationContext.tsx:26-52`, stale under pushState navigation — wip-13a §3.2) [observed defect → target fix].

---

## 2. UI localization repair plan

### 2.1 Step zero: wire the unmerged pack files — the free win

**Current [observed, verified at commit]:** most pack `index.ts` files import a subset of translated files that exist on disk. `spanish/index.ts` imports 11 of 23 files (unmerged: classroom, ferpa, safety, settings, progress, profile, certificates, data-privacy, landing-auth, general-core, language-frameworks); `farsi/index.ts` imports 4 of 13 (unmerged: assignments, auth, general, language-selection, languages, practice, ui-elements, voice-chat).

**Quantified win (wip-13a §2.3 measurements) [observed]:**

| Pack | Runtime today | On-disk union | Delta |
|---|---|---|---|
| spanish | 40.6% | 71.9% | **+31.3 pts** |
| nepali | 22.0% | 62.7% | **+40.7 pts** |
| cantonese | 20.2% | 60.9% | **+40.7 pts** |
| korean | 25.8% | 44.8% | +19.0 pts |
| arabic | 22.0% | 44.5% | +22.5 pts |
| mandarin | 21.9% | 44.2% | +22.3 pts |
| farsi | 20.2% | 29.9% | +9.7 pts |

One mechanical PR (union all category files per pack, deterministic spread order) delivers this at **zero translation cost**. Caveat [observed→policy]: the unmerged content is unreviewed bot output (wip-13a §8) — so gate the FERPA/safety/data-privacy namespaces behind human review before *enabling* them per-locale (§5.1); everything else ships immediately, since ~80%-English fallback is strictly worse than unreviewed MT for navigation/settings copy [estimated pedagogical judgment; requires validation with bilingual reviewers].

### 2.2 Message-format standard: ICU via i18next [proposed]

**Current [observed]:** custom `t()` with regex `{{placeholder}}` interpolation, no plurals, no gender, no `Intl` usage anywhere, 1-dot key nesting only, `setMissingKeys` during render (React anti-pattern), unescaped placeholder regexes (`LocalizationContext.tsx:79-164`, wip-13a §3.1). Insufficient for Slavic plural rules, Arabic duals [estimated linguistic requirement].

| Option | Pros | Cons |
|---|---|---|
| **Keep custom `t()`, add features** | No migration | Reimplementing plurals/ICU/formatting is exactly how the current façade happened; no ecosystem tooling (extractors, linters, TMS integrations) |
| **FormatJS/react-intl** | Purest ICU; extraction tooling | Default workflow favors inline `defineMessages`/IDs; heavier migration from key-based packs |
| **i18next + `i18next-icu`** (recommended) | Key/namespace model maps 1:1 onto existing packs; lazy per-locale backends preserve the current chunking strength (wip-13a §12); ICU plurals/selects via plugin; mature React bindings, missing-key handlers for telemetry | Plugin dependency for full ICU; two syntaxes possible if undisciplined (lint to ICU-only) |
| **Lingui** | Compact, good extraction | Smaller ecosystem; macro-based workflow is a bigger paradigm shift for 285 TSX files [estimated] |

[documented: i18next namespaces/lazy backends/ICU plugin — https://www.i18next.com and https://github.com/i18next/i18next-icu, known as of training cutoff 2026-01; re-verify versions at implementation time.]

**Target shape [proposed]:** namespaced JSON per locale (`/locales/{code}/{namespace}.json`), namespaces = `student-core`, `student-secondary`, `teacher`, `auth`, `legal`, `marketing`. A codemod converts existing TS packs → JSON (unioning per §2.1) with a provenance sidecar (`source: "machine-bot-lovable"`). The English pack's **~292 silent key collisions** (1,532 keys merging to 1,240, `english/index.ts:27-50`, wip-13a §2.4 [observed]) must be resolved *before* conversion — collisions become build errors in the new pipeline. Delete the dead parallel tooling: `translationGenerator.ts`, `translationValidator.ts` (drifting `MASTER_TRANSLATION_KEYS`), `languageIntegrator.ts`, `batchTranslationImplementer.ts`, unrouted `BatchTranslationImplementer.tsx`, orphan `src/translations/practice.ts`, `_home-translations.txt`, eager barrel `index.ts` (wip-13a §5.5, §8.4 [observed]) — replaced by the CI gate (§2.3).

### 2.3 Key-coverage CI gate [proposed]

A build-time script (the discovery audit's flattener, productionized) producing `coverage.json` per locale per namespace, failing the PR when:

1. English source has duplicate keys (collision count > 0).
2. Any ICU string fails syntax parse.
3. Coverage in `student-core` for any **enabled** locale drops below its recorded high-water mark (ratchet, no regressions).
4. New/changed English strings in `student-core`/`legal` lack a translation-request entry (queue file), so drift is visible at PR time.
5. ESLint `react/jsx-no-literals` (scoped to `src/pages` + student components) reports new violations — stops the "newest code is least localized" regression pattern (wip-13a §4.1) [observed pattern → gate].
6. Runtime missing-key telemetry: replace `console.warn` (`LocalizationContext.tsx:136` [observed]) with sampled reporting to a `i18n_missing_keys` table feeding the dashboard (§5.2).

### 2.4 Hardcoded-English core-surfaces remediation list [observed inventory → proposed priority]

Zero `useLocalization`/`t()` usage today (wip-13a §4.1, wip-02 §7.8):

| Priority | Surface | Evidence | Notes |
|---|---|---|---|
| P0 | `src/pages/LessonPlayer.tsx` | 0 t(); "Next question", "Lesson complete" (:131,289) | The A1 daily loop |
| P0 | `src/pages/Learn.tsx` | 0 t(); "Learning Path", CEFR/WIDA jargon (:48-57) | Home surface; also rewrite per §2.8 |
| P0 | `src/pages/VocabReview.tsx` | 0 t(); rating hints (:15-20) | Copy is already A1-grade — extract as the model namespace |
| P0 | `src/components/learner/StudentHomePanel.tsx` | 0 t() (wip-02 §7.8) | Streak/XP/targets copy |
| P1 | `src/pages/PlacementQuiz.tsx` | 0 t() (:131-252) | Plus jargon rewrite |
| P1 | `src/pages/ChallengeMode.tsx` | 0 t() (:80-342) | Assignment loop |
| P1 | `src/components/onboarding/OnboardingWizard.tsx` | ~95% hardcoded (wip-02 §7.8); toasts (:191-214) | First-run = first impression in L1 |
| P2 | `Settings.tsx`, `Profile.tsx`, `Certificates.tsx`, `Accuracy.tsx` | 0 hook usages each | Settings must localize before it hosts the switcher |
| P2 | `src/utils/englishOnlyMessages.ts` (:1-30) + `VoiceChat` toasts | Deliberately English-only | Replace policy: bilingual (L1 + English) for error toasts — an A1 newcomer cannot read "Microphone permission denied" [observed string → proposed policy] |
| P3 | Teacher dashboard (`useClassroomText`, English-only by design) | wip-13a §3.4 | Keep English for v1; architecture leaves the door open for Spanish co-teacher/family views |

### 2.5 Pseudo-localization testing [proposed]

Add a build-only `en-XA` pseudo-locale (accented expansion, e.g. `[!!! Ļéşşőñ çőmpļéţé !!!]`, +40% length) and `ar-XB` (RTL pseudo). CI Playwright pass over the student-core routes in `en-XA` asserts: no unpseudolocalized (i.e., hardcoded) strings visible, no clipped/overflowing containers at 375px width. This is the mechanical detector for §2.4 regressions and layout brittleness under long German/Tamil-length strings [proposed; standard industry technique].

### 2.6 RTL enablement plan [proposed]

Current: **zero** RTL support — no `dir` anywhere in 285 TSX files, no logical CSS, no `[dir=rtl]` styles; Arabic/Farsi/Urdu/Pashto users get RTL strings in LTR layout (wip-13a §6) [observed].

1. **Direction propagation:** `LocalizationProvider` sets `document.documentElement.dir` from the registry (`direction` field). Radix/shadcn components receive it via their `DirectionProvider` [requires validation of shadcn component behavior under dir=rtl].
2. **Logical CSS:** codemod Tailwind physical utilities → logical (`ml-`→`ms-`, `pl-`→`ps-`, `left-`→`start-`, `text-left`→`text-start`); Tailwind supports logical properties natively [documented: https://tailwindcss.com/docs — logical properties, known as of cutoff 2026-01]. CI grep-gate on new physical-direction utilities in student surfaces.
3. **Component audit list** (mirror-or-exempt each): `NewLayout` header + nav dropdown; `top-navigation-dropdown` popover alignment; `LessonPlayer` option rows + letter badges; chat bubbles and send-button placement (`Practice`, `ChallengeMode`, `VoiceChat`); progress bars/XP bar fill direction; `SpeakButton` icon slot; toast placement (sonner corner); back-arrows/chevrons (mirror); `StudentHomePanel` stat rows; onboarding stepper. Directional icons get a `rtl:scale-x-[-1]` convention *except* audio/play icons (never mirrored, per Material/Apple HIG conventions [documented: https://m3.material.io/foundations/glossary — bidirectionality guidance, known as of cutoff 2026-01]).
4. **Mixed-direction hygiene:** target-language (English) tokens inside RTL sentences wrapped with `<bdi>`/`unicode-bidi: isolate` — constant in this product since English lemmas embed in L1 glosses [estimated frequency; pattern proposed].
5. **Acceptance:** `ar-XB` pseudo pass + real Arabic/Farsi Playwright screenshots on the P0 surfaces (§5.3 AC-4).

### 2.7 Script/font strategy [proposed]

Current: no `@font-face`, no font stack config, OS-fonts-only; Latin-tuned `font-feature-settings` (wip-13a §7) [observed].

**Self-hosted Noto subsets** [proposed], keyed by the registry `fontStack` field: `latin` (Noto Sans), `arabic` (Noto Naskh Arabic for body readability at A1 [estimated readability judgment]), `devanagari` (Hindi/Marathi/Nepali), `bengali`, `gurmukhi`, `gujarati`, `sinhala`, `myanmar` (Burmese; S'gaw Karen also uses Myanmar script — coverage [requires validation]), `ethiopic` (Amharic/Tigrinya), `thai`, `malayalam`, `cjk` (system-first with Noto Sans SC/TC/JP/KR fallback — full CJK payloads are multi-MB; subset or rely on managed-device system fonts [estimated tradeoff]). Self-hosting rationale: district content filters commonly block third-party CDNs, and Google Fonts requests raise student-privacy review flags in EU/US districts [estimated; requires validation with district IT]. Load only the active locale's fonts via preload + `unicode-range`. Enabling a locale (registry `enabled: true`) **requires** a font-stack smoke test on target hardware (managed Chromebooks) — the current unknown flagged in wip-13a §7 [observed gap → gate].

### 2.8 Reading-level policy for student-facing strings [proposed]

Current: median FK grade ≈9-10 on core-path copy; "Structured units aligned to CEFR and WIDA can-do statements" = grade 11.5; only VocabReview hits A1-appropriate levels (wip-02 §7.1) [observed].

Policy: English **source** strings in the `student-core` namespace targeting A1 surfaces must score **FK grade ≤3** and draw from a ~1,000-word controlled vocabulary (aligned to the curriculum's own A1/A2 wordlist — the product should speak the language it teaches [proposed principle]). Enforced by the CI lint (FK computation already prototyped in wip-02 Appendix B) as a warning at ≤4 and failure at >6. Jargon (CEFR, WIDA, mastery %, retention %) moves to teacher surfaces or tooltip-layer only. VocabReview's existing hint copy (`VocabReview.tsx:15-20` [observed]) is the style model. Translated strings inherit simplicity from simple sources; per-locale grade scoring is out of scope [assumption: source simplicity carries through translation adequately; requires validation].

---

## 3. Content localization pipeline (curriculum text in learner L1)

### 3.1 What must render in L1, per proficiency [proposed]

Generalize chat-with-tutor's graded ratios (A1: 60% L1 → C2: 2%, `chat-with-tutor/index.ts:317-346` [observed]) into a platform **instruction-language policy**:

| Content | A1 | A2 | B1+ | Source table |
|---|---|---|---|---|
| Lesson intro (`intro_md` — currently fetched, never rendered, wip-02 F2-3 [observed]) | L1 | L1 + EN toggle | EN | `content_localizations` |
| Exercise instruction line ("Choose the correct word") | L1 | Bilingual | EN | `content_localizations` |
| Exercise prompt/options (the target-language item itself) | **EN always** — it *is* the content | EN | EN | `exercises` (no localization) |
| Answer rationale/feedback | L1 | Bilingual | EN | `content_localizations` |
| Vocab gloss + example translation | L1 | L1 | L1 (glosses stay L1 at all levels) | `vocabulary_glosses` |
| UI chrome | L1 always | L1 | L1 | i18next packs |

### 3.2 Pipeline options

| Option | Description | Pros | Cons |
|---|---|---|---|
| **A. Runtime MT** (translate on request, cache) | Instant 41-L1 coverage | Per-request cost/latency in the learner hot path; no human review possible pre-exposure — unacceptable for minors at scale [estimated risk]; cache invalidation vs source edits |
| **B. Build-time batch MT → human review → stored rows** (recommended) | Translations are *data* with provenance, review status, and version binding; zero runtime cost; review before exposure | Upfront pipeline work; per-locale enablement is gated, not instant |
| **C. Human-authored per L1** | Highest quality | 41 L1s × full curriculum is cost-prohibitive (~1,240 UI keys is trivial; curriculum text is thousands of strings × 41) [estimated] |

**Recommendation [proposed]: B, tiered.** Curriculum text volume is bounded (A1→A2 scope) and changes slowly; batch translation with review fits. Runtime MT is reserved for exactly one place: the tutor's on-demand "translate this" (already exists, `chat-with-tutor/index.ts:240` [observed]) — conversational, ephemeral, learner-initiated.

### 3.3 Tiers [proposed]

- **Tier 1 (launch-enabled, human-reviewed before enable):** es, pt, fr, ru, ko, zh (Mandarin), ar, vi, ht, tl — selection [estimated] from current pack completeness + typical US-district EL demographics; final list **[requires validation]** against actual district demand data.
- **Tier 2 (MT + bilingual spot-check ≥20% sample):** remaining mid-resource locales. Enabled with an internal "machine translated" provenance flag.
- **Tier 3 (human review mandatory before enable — MT is weakest exactly here):** Karen, Tigrinya, Burmese, Amharic, Somali, Pashto, Sinhala, Marathi [estimated MT-quality ranking; wip-13a §8 flags these]. Interim state: `support_level='glosses_only'` with human-reviewed wordlist glosses (small, high-value, reviewable) while full instruction text awaits review. Rationale: these are refugee/newcomer languages where wrong-translation harm and trust cost are highest (wip-13a §2.1 note) [observed population inference].

### 3.4 Versioning, review workflow, bot governance [proposed]

- **Versioning:** every `content_localizations`/`vocabulary_glosses` row stores `source_hash` = SHA of the English source field at translation time. A content edit changes the hash; a nightly job marks mismatched rows `stale`; stale rows **fall back to English at delivery** (never serve a translation of a sentence that no longer exists) and re-enter the MT→review queue. This is the mechanism the current pack system lacks entirely (drift is invisible, wip-13a §8.4) [observed gap → target].
- **Review workflow:** MT draft rows land as `review_status='machine'`; a reviewer UI (admin surface, or a TMS like Crowdin for reviewer UX — decision deferred, either writes to the same tables [proposed]) moves rows through `in_review → approved/rejected`. `reviewed_by/reviewed_at` give the audit trail that currently does not exist (663/664 bot commits, no review artifacts, wip-13a §8.1 [observed]).
- **Bot/AI governance:** (1) AI/MT output can never reach `approved` without a human actor id; (2) `legal`, `safety`, `ferpa`, `data-privacy` namespaces and any parent/guardian-facing string **must** be `source='human'` or human-approved before the locale is enabled — MT'd FERPA text for newcomer families is a compliance and trust hazard (wip-13a §8 net assessment) [observed risk]; (3) the content gauntlet's bias/pedagogy gates (`contentGauntlet.ts` [observed]) extend with a per-L1 gloss QA gate (round-trip check + reviewer sampling).

### 3.5 Spanish course: English-only instruction — the explicit cheap path [proposed]

Product B (Spanish for English speakers) sets `courses.instruction_policy='en_only'`:
- Instruction text, rationales, and UI render in English — **no** `content_localizations` rows, no L1 matrix, no per-locale review.
- `vocabulary_glosses` rows only for `l1_code='en'` (Spanish lemma → English gloss).
- Tutor policy runs with `(en, es)` and the same graded ratios (60% English scaffolding at A1).
- The only localization cost is es-target TTS (§4.3) and target-variant content decisions.
This asymmetry is deliberate and should be stated in product docs: ESL carries the 41-L1 matrix; Spanish rides the English rails. It also means Spanish-course work is **not blocked** by any of §3.2-3.4 [proposed].

---

## 4. AI-interaction localization

### 4.1 Preserve and centralize the graded-L1 policy [proposed]

Current: the `LEVEL_BEHAVIOR` table (A1 60% → C2 2%, `explanationStyle: native_heavy → target_only`) lives only inside `chat-with-tutor/index.ts:317-346`, expanded in `_shared/proficiencyUtils.ts:101-142` [observed — verified]. Target: extract to `supabase/functions/_shared/languagePolicy.ts` exposing `getLanguagePolicy(l1_code, target_locale, cefr)` → `{ ratio, explanationStyle, complexityGuidance, l1DisplayName (native + English from registry), ttsConfig }`. Consumers: `chat-with-tutor` (unchanged behavior — ratios are preserved verbatim), `submit-exercise` feedback generation, `author-content`, future speaking/voice surfaces. The 35-language hardcoded allowlist dies; validation = registry `enabled && roles.instruction` (§1.3).

### 4.2 Prompt parameterization by L1 [proposed]

- **Tutor:** input pair comes from the server-resolved profile (§1.5), not client localStorage [current: client-authoritative, `useChallengeChat.ts:80-81` [observed]]. Prompt gains a contrastive block: top-N `approved` `contrastive_notes` for `(l1, en)` scoped to the learner's CEFR — e.g., for Spanish L1 at A1: article omission, ser/estar transfer, /b~v/ conflation [estimated examples; note content authored via §3.4 workflow].
- **Authoring (`author-content`):** current prompt has zero L1 input (`contentGauntlet.ts:321-350` [observed]). Target: authoring stays L1-neutral for shared exercises (one English curriculum serves all L1s — cost containment), but gains an optional per-L1 **distractor pass**: generate MCQ distractors from `common_error_pattern` rows so a Spanish speaker sees article-omission distractors while a Mandarin speaker sees plural-marking distractors [proposed; pedagogical value requires validation with curriculum specialists]. This is additive — base exercises remain pair-independent.
- **Feedback:** wrong-answer rationales at A1 render in L1 via `content_localizations`; AI-generated dynamic feedback passes through `languagePolicy` for ratio/style.

### 4.3 TTS voice/locale mapping [proposed]

Current: `getSpeechSynthesisLanguageCode` covers 30 languages, silently defaults german/italian/thai/gujarati/punjabi/nepali and the 5 unselectable languages to `en-US` (`languageUtils.ts:191-226` [observed — verified]); Spanish target is `es-ES`.

Target: TTS config lives in the registry (`tts.locale`, `tts.provider`, `tts.fallback`), consumed via `languagePolicy`:
- **Per-L1 (gloss/instruction audio):** every enabled locale must declare a `tts.locale`; locales with no viable browser voice (Karen, Tigrinya likely [requires validation per platform]) declare `tts.fallback: null` → UI hides the speak button rather than playing English audio over Karen text (current behavior would mispronounce [inferred]).
- **Per target variant:** Spanish course default **es-MX** [proposed] — rationale: US school Spanish-speaking population is majority Mexican/Central-American heritage, and es-MX is the conventional US-market neutral pick [estimated; **requires validation** with stakeholders and any district style guide]. Registry supports per-course variant override (`courses.target_locale = 'es-MX'`), so a future Castilian offering is data, not code. English target remains `en-US`.
- Server TTS (native real-time / cascade voice) and browser TTS read the same registry mapping — one truth for voice selection [proposed].

---

## 5. Quality governance

### 5.1 Translation review process [proposed]

- **Roles:** translator (MT post-editor), reviewer (bilingual educator — for Tier 3, community/heritage-speaker reviewers [estimated sourcing]), approver (staff). Two-eyes rule for `legal`/`safety` namespaces.
- **Workflow:** CI-extracted string diffs → MT draft → TMS or admin review UI → `approved` rows → next deploy/refresh. UI strings flow through the same provenance states as content rows (§3.4) via a sidecar manifest per locale file.
- **Glossary + style guide per locale:** tone (student-facing = simple, warm), do-not-translate list (Palavox, XP), script conventions. Currently none exists (wip-13a §8.1) [observed].
- **Locale enablement checklist** (gates registry `enabled: true`): student-core UI coverage ≥95% · legal/safety namespaces human-approved · font-stack smoke test on managed Chromebook · RTL pass if `direction='rtl'` · TTS declared or explicitly nulled · glosses approved for launch wordlist.

### 5.2 Coverage dashboards [proposed]

1. **Build-time:** CI publishes `coverage.json` (per locale × namespace: % keys, % approved-vs-machine, stale counts) rendered as a static dashboard page in the admin surface.
2. **Runtime:** `i18n_missing_keys` telemetry table (sampled) + per-locale fallback-render counters from edge functions (`fallback: true` markers, §1.4) — measures what learners actually *see*, not just what ships.
3. **Content:** `content_localizations`/`vocabulary_glosses` rollups: per (course, l1): % approved, % stale, % machine — drives the `course_locale_support.status` display and district-facing "supported languages" claims (never claim a language above its measured state — honesty requirement for procurement [proposed policy]).

### 5.3 Measurable acceptance criteria

| # | Criterion | Measure |
|---|---|---|
| AC-1 | Single locale authority | Grep gate: 0 hardcoded language lists outside `locales.generated.ts`; chat-with-tutor allowlist == registry (unit test asserts set equality) |
| AC-2 | Server-authoritative L1 | New-device sign-in (empty localStorage) renders profile L1 UI; automated test. 7-day expiry code path removed (no TTL on language key). Bulk-created student with `native_language='fa'` gets Farsi UI + tutor without ever visiting the landing page |
| AC-3 | Free-win merge landed | Runtime coverage for es ≥70%, ne ≥60%, yue ≥60%, ko/ar/zh ≥44% (matching on-disk union, wip-13a §2.3 numbers); CI ratchet active |
| AC-4 | RTL | `document.documentElement` carries correct `lang`+`dir` per locale (E2E assert); Arabic + Farsi Playwright screenshot suite on P0 surfaces with 0 physical-direction utility regressions in CI |
| AC-5 | No hardcoded strings on core | `en-XA` pseudo-locale pass: 0 unpseudolocalized visible strings on `/learn`, `/lessons/:id`, `/review`, `/placement-quiz`, `/challenge-mode`, onboarding |
| AC-6 | Correct glosses | `vocab-review` payload gloss `l1_code` == learner profile L1, or explicit `fallback:true`; **0** wrong-L1 glosses possible (the Farsi-sees-Spanish bug, wip-13a §9.6, structurally eliminated) |
| AC-7 | Instruction-language policy | A1 learner receives L1 lesson intro + instruction line + rationale for Tier 1/2 locales; B1 receives English; verified per-fixture E2E |
| AC-8 | TTS integrity | Every `enabled` locale has explicit `tts.locale` or `tts.fallback: null`; 0 registry entries silently defaulting to `en-US`; Spanish course emits `es-MX` voices |
| AC-9 | Reading level | FK lint: `student-core` A1-tagged English strings median ≤3, max ≤6; the 12 failing strings from wip-02 §7.1 rewritten |
| AC-10 | Governance | 0 `machine`-status strings in legal/safety namespaces for any enabled locale; dashboard live showing per-locale coverage + provenance; 100% of enabled locales passed the §5.1 checklist with recorded artifacts |
| AC-11 | Switcher | Signed-in learner can change UI language from Settings and header globe in ≤2 interactions; persists across devices (profiles-backed) |
| AC-12 | i18n engine | Plural-bearing strings render correct CLDR plurals in ru/ar/pl test fixtures; interpolation injection test (regex metacharacters in values) passes |

---

## 6. Dependencies

| Dependency | Direction | Why |
|---|---|---|
| Onboarding reachability fix (wip-02 F1-1) | **Blocks** §1.5 | profiles L1 must actually get captured for self-signup users [observed gap] |
| Auth/roster workstream (bulk-create) | Blocks §1.5 step 2 | teacher-set L1 column at student creation |
| Curriculum schema workstream (doc 0x — courses/exercises) | Coordinates with §1.4 | `content_localizations` references content ids; migration ordering |
| Design-system/component workstream | Coordinates with §2.6-2.7 | logical-CSS codemod + font stacks land in shared components |
| Voice workstream (wip-11a/c) | Consumes §4.3 | registry TTS mapping is the shared contract |
| CI infrastructure (currently 0 tests in repo, wip-13a §6 [observed]) | **Blocks** §2.3/§2.5 gates | Playwright + lint harness must exist first |
| MT vendor + reviewer sourcing (esp. Tier 3 languages) | Blocks §3.3 enablement | [requires validation: vendor choice, reviewer availability for Karen/Tigrinya] |

**Sequencing [proposed]:** (1) free-win merge + coverage script (days) → (2) locale registry + profiles-authoritative L1 + switcher (the lifecycle fixes; unblock everything) → (3) i18next migration + P0 surface extraction + pseudo-locale gate → (4) gloss/content tables + delivery-path L1 + Spanish-gloss migration → (5) RTL + fonts + locale enablement waves → (6) contrastive layer + distractor pass. Effort: steps 1-2 ≈ 1-2 engineer-weeks; 3-4 ≈ 4-6; 5 ≈ 3-4; 6 ≈ open-ended with curriculum team [estimated].

## 7. Risks

| Risk | Severity | Mitigation |
|---|---|---|
| Bulk-enabling unreviewed MT (free win + Tier 2) exposes minors/families to wrong translations in sensitive texts | High | §3.4 governance: legal/safety namespaces human-gated; provenance labels; Tier 3 held to glosses-only until reviewed |
| i18next migration churn across 285 TSX files destabilizes the overhaul mid-flight | Med-High | Compatibility shim: keep `t()` signature during migration; namespace-by-namespace cutover; pseudo-locale gate catches regressions |
| English-key collision cleanup (~292 keys) silently changes visible copy | Med | Snapshot diff of resolved English strings before/after; review the delta explicitly |
| RTL retrofit uncovers deep layout assumptions (fixed-position chat UI, `ChallengeMode` full-screen) | Med | Audit list §2.6.3 scoped up front; `ar-XB` pseudo run *before* enabling real RTL locales |
| es-MX default offends es-ES-preferring stakeholders/districts | Low | Per-course variant override is data (§4.3); decision flagged [requires validation] |
| Tier 3 reviewer sourcing fails (Karen/Tigrinya) | Med | Glosses-only interim state is a designed resting point, not a failure mode |
| Registry BCP-47 migration breaks stored legacy names (`profiles.native_language='farsi'`, localStorage) | Med | `legacyName` mapping in registry + one-time profile migration + dual-read during transition |
| FK-grade lint blocks legitimate strings (proper nouns, teacher jargon leaking into shared components) | Low | Tag-scoped enforcement (`student-core` A1 only) + per-string opt-out with justification comment |

---

*Current-state evidence throughout is from wip-13a and wip-02 at commit `7cbaadd9`, with §1-§4 registry/ratio/TTS/schema citations re-verified directly against the repo during this design pass. All schema DDL, tiering, and policy content in this document is [proposed] target design — none of it exists in the repo today.*
