# WIP 13a — Localization: Current State (Discovery)

- **Repo:** `/Users/calebjaworski/fluentforge-app`, branch `overhaul`, commit `7cbaadd9`
- **Date:** 2026-07-30
- **Scope:** i18n reality audit — language packs, t() machinery, unlocalized surfaces, curriculum-content localization, RTL, fonts, quality risk — feeding the "ESL usable through every supported UI language" requirement.
- **Method:** read-only repo inspection plus a read-only key-coverage script (esbuild-bundled, run from the session scratchpad; no app files touched). Claims are labeled [observed] / [inferred] / [estimated] / [requires validation].

---

## 1. Executive summary

Palavox ships **40 language packs** but the localization system is a façade at three levels:

1. **UI-string coverage is thin and partially dead.** The best pack (Portuguese) covers **41%** of English's 1,240 runtime keys; the median pack covers ~20–22%; the worst (Tigrinya) 15.6%. Worse, most packs contain translated files on disk that their `index.ts` never imports — Spanish is 71.9% translated on disk but only 40.6% reaches runtime. [observed]
2. **The core learning surfaces are 100% hardcoded English.** `Learn`, `LessonPlayer`, `PlacementQuiz`, `ChallengeMode`, and `VocabReview` contain **zero** `useLocalization` calls. The overhauled student path never consults the learner's L1 for UI text. [observed]
3. **Curriculum content has no L1 dimension.** `vocabulary.translation_l1` is a single untyped text column, seeded exclusively with **Spanish** glosses; exercises, lesson intros, and AI authoring are English-only with no learner-L1 input. A Farsi speaker reviewing vocabulary today sees Spanish translations. [observed]

The one genuinely language-pair-aware component is the `chat-with-tutor` edge function, whose CEFR-graded L1-scaffolding ratios (60% L1 at A1 → 2% at C2) are pedagogically sound and worth preserving. [observed]

There is **no RTL support of any kind** (zero `dir` attributes in 285 TSX files), no script-specific font handling, a static `lang="en"` on `<html>`, and the translations themselves were ~99.8% authored by a code-generation bot with no human review trail. [observed]

---

## 2. Inventory and coverage matrix

### 2.1 Pack inventory

- **40 language directories** under `src/translations/` (plus `constants.ts`, `index.ts`, `loader.ts`, `types.ts`, and two orphan files — see §8.4). [observed]
- All 40 are loadable: English eager + 39 lazy `import()` loaders (`src/translations/loader.ts:17-57`, `SUPPORTED_LANGUAGES` at `loader.ts:60`). [observed]
- **Only 35 are selectable.** `AVAILABLE_LANGUAGES` (`src/translations/constants.ts:6-43`) and the hardcoded pickers (`src/components/home/LanguageSelectionCard.tsx:30-67`) omit **burmese, karen, tigrinya, marathi, sinhala** — five packs that exist, load, and are typed in `LanguageCode` (`src/translations/types.ts:11-18`) but can never be chosen. [observed] These are precisely languages of refugee/newcomer populations (Karen, Tigrinya, Burmese), a notable district-use gap. [inferred]
- The chat tutor's server-side allowlist also drops those 5 (35 languages, `supabase/functions/chat-with-tutor/index.ts:48-61`), silently coercing them to English. [observed]

### 2.2 Key coverage vs English — runtime (what actually loads)

English merges to **1,240 flat keys** (`src/translations/english/index.ts:27-50`). Script: flatten each pack's default export, count English keys present. [observed]

**Top 10 most complete (runtime):**

| Pack | Coverage | Keys covered | Notes |
|---|---|---|---|
| portuguese | 41.2% | 511/1240 | |
| spanish | 40.6% | 504/1240 | 15 values identical to English |
| french | 33.0% | 409/1240 | |
| russian | 30.5% | 378/1240 | 136 extra keys not in English |
| korean | 25.8% | 320/1240 | |
| tagalog | 23.9% | 296/1240 | 37 values identical to English |
| thai | 23.8% | 295/1240 | |
| urdu | 22.4% | 278/1240 | |
| indonesian | 22.3% | 276/1240 | |
| ukrainian / swahili | 22.2% | 275/1240 | |

**Bottom 10 (runtime):**

| Pack | Coverage | Keys covered |
|---|---|---|
| tigrinya | 15.6% | 194/1240 |
| burmese | 16.1% | 200/1240 |
| karen | 16.1% | 200/1240 |
| marathi | 16.5% | 205/1240 |
| sinhala | 16.6% | 206/1240 |
| gujarati | 17.7% | 220/1240 |
| punjabi | 18.6% | 231/1240 |
| pashto | 20.1% | 249/1240 |
| somali | 20.1% | 249/1240 |
| yoruba | 20.1% | 249/1240 |

A large bloc of 14 packs sits at exactly 249–251 keys (20.1–20.2%) — the shared "minimal + pronunciation + premium-voice + navigation" template. [observed] Every learner outside the top three packs sees a UI that is roughly **four-fifths English** via fallback. [inferred from coverage + fallback behavior]

### 2.3 On-disk vs runtime: translations that exist but never load

Most pack `index.ts` files import only a subset of the pack's category files. [observed]

| Pack | Runtime coverage | On-disk coverage (union of all files) | Dead translated files (examples) |
|---|---|---|---|
| spanish | 40.6% | **71.9%** | classroom, ferpa, safety, settings, progress, profile, certificates, data-privacy, landing-auth (`src/translations/spanish/index.ts:1-27` imports 11 of 23 files) |
| nepali | 22.0% | **62.7%** | |
| cantonese | 20.2% | **60.9%** | |
| korean | 25.8% | 44.8% | |
| arabic | 22.0% | 44.5% | 14 unmerged files incl. settings, progress, profile |
| mandarin | 21.9% | 44.2% | |
| farsi | 20.2% | 29.9% | `src/translations/farsi/index.ts:1-15` imports 4 of 13 files; assignments, auth, ui-elements, voice-chat, practice sit unused |

**Wiring existing files into pack indexes would roughly double effective coverage for several major languages at zero translation cost** — though the unmerged content is unreviewed machine output (§8). [observed measurement; quality caveat inferred]

### 2.4 Structural debt in the English baseline

- English category files sum to **1,532 keys but merge to 1,240** — ~292 keys silently collide across spread-merged files (`english/index.ts:27-50`); last-spread wins, so e.g. `assignments.ts` can shadow `practice.ts`. [observed count; collision semantics observed from spread order]
- Packs carry 21–177 "extra" keys absent from English (mandarin: 177) — orphaned keys that can never be reached by fallback-validated code paths. [observed]

---

## 3. The t() machinery and the language-selection lifecycle

### 3.1 What t() does (`src/contexts/LocalizationContext.tsx`)

- **Fallback chain:** selected language → English → raw key string returned to the UI (`:79-149`). Missing keys are console-warned and tracked in a `missingKeys` set. [observed]
- **Interpolation:** `{{placeholder}}` and `{placeholder}` via regex replace (`:151-164`). No pluralization, no gender, no `Intl` number/date formatting anywhere in the i18n core (0 `Intl.` hits). [observed] This is insufficient for Slavic plural rules, Arabic duals, etc. [inferred]
- **Nested keys support exactly one dot level** — `key.split('.')` destructures `[parentKey, childKey]` only (`:104-111`); deeper paths silently fail to the raw key. [observed]
- **`setMissingKeys` is called during render** inside `t()` (`:135-147`) — a React anti-pattern that triggers re-renders from a pure render path. [observed] Maintenance risk: subtle render loops as key coverage changes. [inferred]
- Placeholder names are injected into `new RegExp` unescaped (`:156,160`) — benign today, brittle if a placeholder ever contains regex metacharacters. [observed]

### 3.2 The English-forcing classroom rule is broken by the router

`isClassroomRoute(path) = path.startsWith("/teacher")` forces English on teacher routes (`LocalizationContext.tsx:26-28, 87-89`). But `currentPath` is only updated on **`popstate`** (`:42-52`), while the app navigates with React Router's `BrowserRouter` (pushState — `src/App.tsx:2,66+`), which does **not** fire `popstate`. So after any client-side navigation, `t()` evaluates the classroom rule against a stale path. [observed code; behavioral consequence inferred, **requires validation** in a browser] The rule mostly "works" today only because teacher pages barely use `t()` and users often hard-load URLs. [inferred]

### 3.3 The learner's L1 never actually drives the UI after signup

This is the most consequential lifecycle finding:

- The **only** `setCurrentLanguage` call site in the app is the marketing landing page (`src/components/layout/NewLandingPage.tsx:89`). [observed]
- The landing page **redirects signed-in users to `/learn` immediately** (`NewLandingPage.tsx:45`), so a signed-in learner can never reach the language panel again. [observed code; unreachable-switcher conclusion inferred]
- `Settings.tsx` and `Profile.tsx` contain **no language switcher** and zero localization hooks (grep: 0 hits). [observed]
- The preference is persisted to `secureStorage` under `nativeLanguage` **with a 7-day expiration** (`NewLandingPage.tsx:80`; `src/utils/security/dataEncryption.ts:155-191` — `getItem` deletes expired keys). After 7 days, every learner's UI silently reverts to English. [observed code; reversion behavior inferred, **requires validation**]
- `profiles.native_language` **is** captured at onboarding (`src/components/onboarding/OnboardingWizard.tsx:146,245`; migration `20260211195248...sql:18`) and even gated on for profile completeness (`src/pages/Profile.tsx:41-43`), but **nothing ever syncs it into `LocalizationContext`** — the DB knows the learner's L1; the UI ignores it. [observed]
- **Bulk-created students never see the landing page**, so their `localStorage` is empty: UI renders English, and `useChallengeChat` defaults them to `userLanguage="english"`, `targetLanguage="spanish"` (`src/components/practice/hooks/useChallengeChat.ts:80-81`) — an ESL newcomer can be tutored **in Spanish as an English speaker**. [observed defaults; scenario inferred, **requires validation**]
- Language pair sent to `chat-with-tutor` comes from client localStorage, not the server-side profile — client-authoritative language identity. [observed] Minor integrity/consistency concern for district reporting. [inferred]

### 3.4 useClassroomText and the teacher dashboard

`src/hooks/useClassroomText.ts:18-41` maps `CLASSROOM_TEXT` keys to the **English pack only** (imports `@/translations/english` directly, deliberately bypassing L1). `teacher-dashboard.ts` exists **only** in the English pack (glob across all 40 packs returns 1 file). [observed] Teacher UX is English-only by design and by data. Fine for now; a blocker if districts want Spanish-speaking co-teachers or family-facing views. [inferred]

### 3.5 languageConstants / languageUtils — hardwired pair logic

- `getTargetLanguage`: `english → spanish`, everything else → `english` (`src/utils/languageConstants.ts:46-48`). The platform's entire language-pair model is one ternary. [observed]
- `getAvailableTargetLanguages`: non-English natives get `['english']` only; English natives get `['spanish','french']` (`src/utils/languageUtils.ts:121-130`) — yet the selection card then **disables French** (`LanguageSelectionCard.tsx:112-114`), and `hasStudyMaterials` lists `english-portuguese` as supported (`languageUtils.ts:139-184`) though it's unreachable. Three sources of truth, mutually inconsistent. [observed]
- Native names exist in native script (`languageUtils.ts:72-114`, `constants.ts:6-43`) — a strength. But **no RTL flag, no script metadata, no font hints** exist anywhere. [observed]
- `getSpeechSynthesisLanguageCode` (`languageUtils.ts:191-226`) lacks entries for german, italian, thai, gujarati, punjabi, nepali (and the 5 unselectable languages), defaulting them to `en-US`. [observed]
- Flag emojis bind languages to single states: Farsi/Dari → 🇮🇷 (Afghan Dari speakers see Iran's flag), Punjabi → 🇮🇳 only, Arabic → 🇸🇦 (`LanguageSelectionCard.tsx:35,45,65`). Cultural-sensitivity risk in school deployments. [observed data; risk inferred]

---

## 4. Where the UI is not localized

### 4.1 The overhauled student core is hardcoded English

`useLocalization` appears in **109 of 285** `.tsx` files. The five pages at the heart of the new curriculum spine use it **zero** times: [observed]

| Page | `t()` usage | Sample hardcoded strings |
|---|---|---|
| `src/pages/Learn.tsx` | 0 | "Learning Path" (:48), "Structured units aligned to CEFR and WIDA can-do statements." (:51-52), "Placement quiz" (:57) |
| `src/pages/LessonPlayer.tsx` | 0 | "Could not submit your answer. Please try again." (:75), "Skill mastered!" (:86), "Lesson complete" (:131), "Finish lesson"/"Next question" (:289) |
| `src/pages/PlacementQuiz.tsx` | 0 | "Language Placement Quiz" (:131), "Quiz Format" (:148), "Your Results" (:232), "Next Steps" (:248) |
| `src/pages/ChallengeMode.tsx` | 0 | "No Assignment" (:80), "Assignment Completed! 🎉" (:192), "Continue Assignment" (:342) |
| `src/pages/VocabReview.tsx` | 0 | "Hard"/"It was difficult" (:18), "Nothing is due right now…" (:104), "Back to path" (:110) |

Also unlocalized: `Settings.tsx`, `Profile.tsx`, `Certificates.tsx`, `Accuracy.tsx` (0 hook usages each). [observed] The pre-overhaul surfaces (`Practice`, `VoiceChat`, `Progress`, `Assignments`, `XPRewards`, `StudentClass`) do use `t()`. [observed] The pattern: **the newest, most pedagogically central code is the least localized** — the overhaul regressed i18n discipline. [inferred]

### 4.2 Deliberate English-only zones

- `src/utils/englishOnlyMessages.ts:1-30` — system toasts intentionally always English ("These should always display in English regardless of the user's UI language"), used by `VoiceChat.tsx`. [observed] Defensible for error triage; hostile to an A1 newcomer who cannot read "Microphone permission denied". [inferred pedagogy concern]
- Onboarding toasts are hardcoded ("Students created!", "Profile set up!", "Error" — `OnboardingWizard.tsx:191-214`). [observed]

### 4.3 Accessibility hooks are English-locked

`<html lang="en">` is static (`index.html:2`); no code updates `documentElement.lang` (grep: 0 hits). Screen readers will pronounce Farsi/Urdu/Hindi text with English voices. [observed attribute; screen-reader consequence inferred]

---

## 5. Curriculum content and the learner's L1

### 5.1 Schema: a single, language-blind gloss column

`vocabulary` (`supabase/migrations/20260729164446...sql:114-127`): `language text DEFAULT 'en'` (the lemma's language) and **`translation_l1 text`** — one gloss, no column saying *which* L1 it is. `courses.language` defaults `'en'` (`:3-13`); `units`, `skills`, `lessons`, `exercises`, `exercise_options`, `passages` have English-only `title/prompt/intro_md/body` fields with no locale dimension; the later curriculum migrations (`20260729171206`, `20260729175720`) add **no** language/L1 columns at all (grep: 0 hits). [observed]

### 5.2 The seed hardcodes Spanish as "the" L1

`supabase/functions/_shared/seedCurriculum.ts:209` — literally: "Frequency-ranked A1/A2 word list with L1 (Spanish) glosses" — and every row follows (`name→nombre`, `family→familia`, `:214-228`). [observed]

### 5.3 Delivery path is L1-blind end to end

- `learn-lesson` (`supabase/functions/learn-lesson/index.ts:58,82-94`) returns lesson intro + exercise prompts verbatim from the DB — no learner language parameter exists in the function. [observed]
- `vocab-review` (`supabase/functions/vocab-review/index.ts:96-100`) selects `translation_l1` with no learner-L1 filter; `VocabReview.tsx:136-137` renders it directly. **Every learner, regardless of L1, sees Spanish glosses.** [observed]
- `author-content` generation prompt (`supabase/functions/_shared/contentGauntlet.ts:321-350`) authors "English/ESL exercises for US middle school multilingual learners" — no L1 input, no contrastive-error awareness, English-only rationales. [observed]

### 5.4 The exception: chat-with-tutor is genuinely pair-aware (preserve this)

`supabase/functions/chat-with-tutor/index.ts:317-346` defines CEFR-graded `nativeLanguageRatio` (A1: 60% L1, A2: 45%, B1: 25%, B2: 12%, C1: 5%, C2: 2%) with explanation styles `native_heavy → target_only`, expanded into concrete system-prompt guidance in `supabase/functions/_shared/proficiencyUtils.ts:101-142` ("ALWAYS provide {L1} translations for new vocabulary… When the student seems confused, immediately switch to {L1}"). It also has an on-demand translation mode (`index.ts:240`). This graded-L1-scaffolding design is the most pedagogically sophisticated i18n artifact in the repo. [observed] Caveats: language pair arrives from client localStorage (§3.3), the allowlist drops 5 languages (§2.1), and output quality per L1 is untested [requires validation].

### 5.5 Offline translation tooling (unwired)

`src/utils/translationGenerator.ts` (static per-language template dictionaries), `translationValidator.ts` (1,026-line `MASTER_TRANSLATION_KEYS` list + completeness checks), `translationAudit.ts`, `languageIntegrator.ts` (`:148-178` — generates `[KEYNAME]` **placeholder** strings, comment: "will need actual translation service"), `batchTranslationImplementer.ts` (strategies `'template' | 'ai-generated' | 'hybrid'`; `PRIORITY_LANGUAGES` includes `dutch`, which has no pack). The admin UI `src/components/admin/BatchTranslationImplementer.tsx` is **mounted on no route** (grep: no usages). [observed] Net: an aspirational pipeline that never became infrastructure; `MASTER_TRANSLATION_KEYS` is a second, drifting source of truth vs the actual English pack. [inferred]

---

## 6. RTL: nonexistent

- `dir="rtl"` / `dir={...}`: **0 occurrences** in all of `src` (the only grep hits are substrings like "shortly", "partly"). [observed]
- No `document.documentElement.dir` manipulation (0 hits), no `[dir=rtl]` CSS, no Tailwind logical-property or `rtl:` variant usage found. [observed]
- **0 test files exist in the repo** (`*.test.*`/`*.spec.*` = 0), so there is no RTL test evidence — or any i18n test evidence. [observed]
- Arabic, Farsi, Urdu, Pashto packs exist and are selectable, so RTL-script users receive RTL strings rendered in LTR layout: left-aligned paragraphs, mirrored punctuation at wrong ends, mixed-direction lines when English fallback interleaves (which, at ~20% coverage, is constant). [observed pack existence; rendering consequence inferred, **requires validation** via browser]

## 7. Fonts and scripts

- No `@font-face`, no `fontFamily` in `tailwind.config.ts`, no font links in `index.html`, no Google-Fonts/Noto references (grep: 0 hits). Rendering relies entirely on OS system fonts. [observed]
- Consequence: CJK, Devanagari, Ge'ez (Amharic/Tigrinya), Sinhala, Burmese, Karen (Myanmar script), Khmer-adjacent scripts render only as well as each district device's font inventory; managed Chromebooks generally carry Noto, but line-height/fallback tofu on older or locked-down devices is unverified. [inferred; **requires validation** on target hardware]
- `font-feature-settings "cv02"…` (`src/index.css:125`) implies a Latin-optimized type treatment (Inter-style features) with no script-specific adjustments. [observed setting; implication inferred]

## 8. Translation quality risk

1. **Authorship:** `git log` on `src/translations/` — **663 of 664 commits by `gpt-engineer-app[bot]`** (Lovable), 1 by a human, with commit subjects like "Changes". No review artifacts, no translator attribution, no glossary. [observed]
2. **Pipeline design admits it:** `languageIntegrator.ts:148` — "Create placeholder translations (will need actual translation service)". [observed]
3. **Untranslated payloads:** identical-to-English values in packs (tagalog: 37, spanish: 15) [observed]; the widespread `minimal.ts` template bloc (§2.2) shows copy-scaffolding rather than translation effort. [inferred]
4. **Orphans and drift:** root `src/translations/practice.ts` (English strings labeled "placeholder", imported nowhere), `_home-translations.txt` (a scratch notes file listing "startPracticing" in 30+ languages), and the eager barrel `src/translations/index.ts` (imports all 40 packs; superseded by `loader.ts`, imported nowhere) are all dead weight. [observed]
5. **No QA loop:** zero tests; the validator tooling (§5.5) is disconnected; missing-key telemetry goes only to `console.warn` (`LocalizationContext.tsx:136`). [observed]

**Net quality assessment:** the packs must be treated as unreviewed machine translation of unknown accuracy, especially for lower-resource languages (Karen, Tigrinya, Somali, Amharic) where MT quality is weakest and the stakes (newcomer families, legal/privacy texts like `ferpa.ts`, `safety.ts`) are highest. [inferred; per-language accuracy **requires validation** by bilingual reviewers]

---

## 9. Walk-through: how a lesson renders for a Farsi-speaking learner today

Actual code path, assuming she picked فارسی on the landing page within the last 7 days: [observed path; composite behavior inferred]

1. **Landing:** picks Farsi → `secureStorage.setItem("nativeLanguage","farsi")` + `setCurrentLanguage("farsi")` (`NewLandingPage.tsx:80-89`). Target language auto-locks to English (`languageUtils.ts:121-124`).
2. **Boot:** `LocalizationProvider` restores `"farsi"` (`LocalizationContext.tsx:54-60`) and lazily fetches the Farsi chunk (`loader.ts:31`) — which merges only 4 of the 13 Farsi files (`farsi/index.ts:8-13`): ~250 keys, 20.2% of English.
3. **Navigation chrome:** partially Farsi (`navigation.ts` is merged), left-aligned LTR — no `dir="rtl"` exists anywhere (§6). `<html lang="en">` throughout.
4. **/learn:** `Learn.tsx` uses no `t()` at all → "Learning Path", "Structured units aligned to CEFR and WIDA can-do statements.", "Placement quiz", all English (:48-57). Unit titles come from the DB (`useLearningPath`) — English-only rows.
5. **Lesson:** `LessonPlayer.tsx` → `useLessonRunner.ts:63` → `learn-lesson` edge function → English `intro_md`, English exercise prompts and options, no L1 anywhere (§5.3). Buttons "Next question"/"Finish lesson" hardcoded (:289). Mistake feedback and mastery toasts: English (:75,86).
6. **Vocab review:** `/review` → `vocab-review` returns `translation_l1` → she studies "family = **familia**" — a **Spanish** gloss (§5.2). The one place the product tries to use her L1, it uses someone else's.
7. **Tutor chat:** the sole L1-correct experience — `useChallengeChat` sends `userLanguage:"farsi"` from localStorage, and `chat-with-tutor` scaffolds ~60% Farsi at A1 (§5.4) — rendered LTR, in system fonts, inside English chrome.
8. **Day 8:** the 7-day expiry deletes `nativeLanguage` (`dataEncryption.ts:176-181`); her UI reverts fully to English and — with the landing page unreachable while signed in (§3.3) — there is no in-app way to get Farsi back. localStorage-reading hooks (`useChallengeChat.ts:81` uses plain `localStorage`, which never expires the key — inconsistent with `secureStorage`) may keep sending "farsi" to the tutor while the UI shows English. [observed mechanisms; day-8 composite **requires validation**]

---

## 10. Gaps blocking "ESL through any L1"

| # | Gap | Evidence | Concerns |
|---|---|---|---|
| G1 | Core learning UI hardcoded English | §4.1 | pedagogy (A1 learners can't parse instructions), district (WIDA "home-language support" expectations), maintenance |
| G2 | `translation_l1` single-column, Spanish-only | §5.1–5.3 | pedagogy (wrong-L1 glosses are worse than none), scalability (no way to add L1s), district |
| G3 | L1 preference lifecycle broken (7-day expiry, no post-login switcher, profile never synced, bulk students defaulted to English/Spanish) | §3.3 | district (bulk-created rosters are the district norm), security/privacy (client-authoritative language), maintenance |
| G4 | No RTL at all | §6 | pedagogy/equity for Arabic/Farsi/Urdu/Pashto learners; district |
| G5 | 5 packs unselectable (Karen, Tigrinya, Burmese, Marathi, Sinhala) | §2.1 | district (newcomer languages), maintenance (three inconsistent language lists) |
| G6 | Coverage ~20% median; dead-on-disk translations | §2.2–2.3 | pedagogy, maintenance (fallback hides regressions) |
| G7 | Unreviewed MT quality, no review trail, no tests | §8 | district procurement/compliance (FERPA/safety texts in MT), pedagogy |
| G8 | No pluralization/Intl, 1-dot key nesting, render-time setState | §3.1 | scalability (morphologically rich languages), maintenance |
| G9 | English-forcing route rule relies on stale `popstate` path | §3.2 | maintenance, correctness |
| G10 | No fonts/`lang`/screen-reader handling for 12+ scripts | §4.3, §7 | accessibility, district (IEP/504 + ELL overlap) |
| G11 | AI authoring pipeline has no L1 input → no contrastive content possible | §5.3 | pedagogy (transfer errors are L1-specific) |

## 11. What a proper language-pair architecture needs (proposal — none of this exists today)

All items in this section are **[proposal]**, contrasted with observed current state:

1. **L1-keyed gloss table** replacing the single column: `vocabulary_glosses(vocabulary_id, l1_code, gloss, example_translation, reviewed_by, reviewed_at)` — vs today's `translation_l1 text` (`20260729164446...sql:118`). Same for lesson intros and instruction strings: `content_localizations(content_type, content_id, l1_code, field, text, source['human'|'mt'|'ai'], review_status)`.
2. **A real locale registry:** one table/config with code, native name, display name, script, direction (rtl/ltr), font stack, BCP-47 tag, TTS voice, enabled-surfaces — replacing today's ≥6 divergent hardcoded lists (`constants.ts`, `types.ts`, `loader.ts`, `languageUtils.ts` ×3 maps, `LanguageSelectionCard.tsx` ×2, chat-with-tutor allowlist).
3. **Server-authoritative L1:** derive UI language and tutor language from `profiles.native_language` with client override, not localStorage-with-expiry (§3.3).
4. **Instruction-language policy per proficiency:** generalize chat-with-tutor's graded-L1 ratios (§5.4) into the exercise player — L1 instructions at A1 fading to English by B1 — which requires localized instruction strings (G1) and glosses (G2) as data, not code.
5. **Per-L1 contrastive layer:** `contrastive_notes(l1_code, grammar_point, note, common_error_pattern)` feeding `author-content` prompts and error feedback — today the authoring prompt has zero L1 awareness (`contentGauntlet.ts:327-337`).
6. **RTL as a first-class rendering mode:** `dir` from the locale registry on `<html>`, logical CSS properties, mirrored iconography audit; plus per-script font stacks (Noto subsets, self-hosted for districts with filtered networks).
7. **Translation ops:** single source of truth for keys (the English pack), CI check for coverage regression + collision detection (the ~292-key collision problem, §2.4), human review workflow with per-string provenance, prioritized by student-facing surface.
8. **Key namespacing + ICU MessageFormat** (plurals/gender/number) to replace the flat 1,240-key bag and regex interpolation.

## 12. Strengths worth preserving

- **Lazy per-language chunking** (`loader.ts:4-7,17-57`) — clean Vite code-splitting, ~3.3 MB kept out of the initial bundle, with an eager English fallback. Good scalability posture. [observed]
- **Graded L1-scaffolding design in chat-with-tutor** (§5.4) — the pedagogical core to build the whole instruction-language policy around. [observed]
- **`profiles.native_language` exists and is enforced at onboarding** (§3.3) — the data foundation for server-authoritative L1 is already captured. [observed]
- **Content gauntlet quality gates** (`contentGauntlet.ts`: level gate, solver gate, pedagogy gate, bias gate; authoring rule "Never use culturally exclusive or US-only background knowledge", `:337`) — extendable to per-L1 gloss QA. [observed]
- **Native-script language names** throughout the selection UX (`constants.ts:6-43`). [observed]
- **Fallback-to-English in `t()`** means missing keys degrade to readable English rather than blank UI (`LocalizationContext.tsx:119-149`). [observed]
- **Validator tooling skeleton** (`translationValidator.ts`, `types.ts:21-45` report interfaces) — the right idea, needing wiring into CI rather than rewriting. [observed]

## Appendix A — Method

Coverage script: esbuild-bundled TS run under the session scratchpad; flattened each pack's `index.ts` default export (dot-joined nested keys) and compared against English's 1,240 flat keys; second pass unioned every category file per pack for on-disk coverage. No repo files were modified; no servers or databases touched. Numbers are exact for commit `7cbaadd9`. "Identical-to-English" counts exclude strings ≤3 chars.

## Appendix B — Full runtime coverage table

| Pack | % | Covered | Extra keys | Identical to EN |
|---|---|---|---|---|
| portuguese | 41.2 | 511 | 101 | 4 |
| spanish | 40.6 | 504 | 75 | 15 |
| french | 33.0 | 409 | 73 | 11 |
| russian | 30.5 | 378 | 136 | 8 |
| korean | 25.8 | 320 | 60 | 8 |
| tagalog | 23.9 | 296 | 74 | 37 |
| thai | 23.8 | 295 | 74 | 8 |
| urdu | 22.4 | 278 | 77 | 8 |
| indonesian | 22.3 | 276 | 71 | 11 |
| ukrainian | 22.2 | 275 | 72 | 8 |
| swahili | 22.2 | 275 | 85 | 9 |
| hindi | 22.1 | 274 | 61 | 8 |
| turkish | 22.1 | 274 | 80 | 9 |
| arabic | 22.0 | 273 | 60 | 8 |
| nepali | 22.0 | 273 | 73 | 8 |
| mandarin | 21.9 | 271 | 177 | 8 |
| vietnamese | 21.0 | 260 | 60 | 9 |
| japanese | 20.8 | 258 | 60 | 8 |
| bengali | 20.8 | 258 | 60 | 8 |
| cantonese | 20.2 | 251 | 80 | 8 |
| amharic | 20.2 | 251 | 66 | 8 |
| farsi | 20.2 | 250 | 58 | 8 |
| malayalam | 20.2 | 250 | 58 | 8 |
| polish | 20.2 | 250 | 58 | 10 |
| romanian | 20.2 | 250 | 58 | 13 |
| igbo | 20.2 | 250 | 58 | 10 |
| haitian | 20.2 | 250 | 58 | 8 |
| german | 20.2 | 250 | 58 | 9 |
| italian | 20.2 | 250 | 58 | 12 |
| pashto | 20.1 | 249 | 58 | 8 |
| somali | 20.1 | 249 | 58 | 10 |
| yoruba | 20.1 | 249 | 58 | 9 |
| punjabi | 18.6 | 231 | 74 | 8 |
| gujarati | 17.7 | 220 | 60 | 8 |
| sinhala | 16.6 | 206 | 21 | 0 |
| marathi | 16.5 | 205 | 21 | 0 |
| burmese | 16.1 | 200 | 21 | 0 |
| karen | 16.1 | 200 | 21 | 0 |
| tigrinya | 15.6 | 194 | 21 | 0 |

(On-disk union coverage per pack is in §2.3; full list available from the same script.)
