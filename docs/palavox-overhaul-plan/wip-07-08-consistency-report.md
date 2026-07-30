# wip — 07/08 Cross-Course Consistency & Schema Validation Report

**Scope:** `07-esl-curriculum-map.md` (Direction A, EN for multilingual learners) vs
`08-spanish-curriculum-map.md` (Direction B, ES for English speakers), with spot-checks into the
8 `wip-curriculum-*` band files.
**Role:** Cross-Course Consistency and Schema Validator. Planning only; no app code or DB changes.
**Labels:** **[proposed]** decision for owner review · **[assumption]** premise · **[requires validation]** needs data/SME/pilot check.

**Verdict up front:** Both maps are internally strong, arithmetic is largely clean, and both honor
the owner's progressive-release bands and performance-evidence-only rule. But they do **NOT** share
one authoring schema today — they diverge on ~20 contract fields, table names, identifier regimes,
and enums, and 08 carries one systemic arithmetic contradiction (its own new-item load ceilings
cannot accommodate its own unit vocab budgets in 8 of 12 units). §2 below is the unified schema
both files must adopt; §8 is the ranked defect list.

---

## 1. Do the two courses use ONE shared authoring schema? — **No (yet).** Field-by-field diff

Both maps correctly treat the existing DB (courses > units > skills > lessons > exercises +
exercise_options; passages; vocabulary; can_do_statements; vocab_lesson_map; vocab_card_state;
skill_mastery; lesson_progress; draft→gated→operational) as untouched and propose additive
extensions only. The extensions, however, were designed independently and disagree:

| Concern | 07 (ESL) §8 | 08 (Spanish) §9 | Disposition in unified schema (§2) |
|---|---|---|---|
| Interaction contract field count | **16 fields** ("16-field owner contract", §8.2c) | **"15 mandatory fields"** (§1, §9.3, lint V11) — YAML actually contains all 16 keys but `failure_handling` is unnumbered and the count text/lint say 15 | **16** (owner spec lists 16). 08 must correct §1, §9.3 heading, V11 |
| Interaction table | `ai_interaction_specs`, `profile ENUM('full','micro')`, `version: n` | `ai_interactions`, `tier: micro\|guided\|open\|mission`, no version field | `ai_interaction_specs` with `tier` (08's, richer) + `version` (07's) |
| Scaffolding model | prose rules: `attempt_1, attempt_2plus, fade_trigger, stall_behavior, floor` | numeric `levels 0–3` + `auto_escalate {idle_s, failed_sends}` | Levels 0–3 + declarative fade/escalate triggers (08 model; 07's floor rule kept as `floor_level`) |
| Mission shape | `scenario, difficulty_tiers{T1..T3}, rubric{cells,scale,pass_rule}, variants, retry_policy, evidence` | `scenes[], planted_breakdowns[], lifeline policy, outcome enum, fresh-scenario-on-retry` | Union of both — see `$defs/mission` |
| Mission outcome vocabulary | missions "rated ≥ **functional**" (GR-0b) | §9.3: `completed \| completed_with_support \| repeat_mission`; but §8.4 + sample es-10.10 use **`achieved_with_support`** — 08 is internally inconsistent | One enum: `completed \| completed_with_support \| repeat_mission`; rating scales map onto it |
| Translations table | `vocabulary_translations(vocabulary_id, l1_code, translation, usage_note, source ENUM('human','mt','mt_reviewed'), reviewed_by, reviewed_at)` | `vocabulary_translations(vocab_id, lang, gloss, usage_note)` — no provenance | 07's shape (provenance is required for the 41-L1 pipeline); names `vocabulary_id, l1_code, translation` |
| Contrast notes | `l1_contrast_notes` superset: scope, ref_id, l1_code, contrast_type, severity, render_priority, note_l1_md, predicted_errors JSONB, distractor_hints, recast_example, remediation_refs, inherited | thin `contrast_notes(target_id, l1, note_md)` "ESL-parity" stub | 07's superset table, name `l1_contrast_notes`; optional per course (ES-for-EN may inline contrast in `intro_md`) |
| Chunk marking | `item_type ENUM('word','chunk')` **or** `part_of_speech: chunk` (07 leaves it ambiguous) | `vocabulary.is_chunk BOOL` | `item_type ENUM('word','chunk')` — one mechanism; `part_of_speech` stays linguistic |
| Grammar registry | `grammar_points` table, canonical dotted keys `gram.*`, `lesson_grammar_map` junction, `contrast_priority` | **no table proposed**; opaque sequential keys `GS-01..GS-83`; `extends:` field in lesson contract | `grammar_points` table adopted; id = dotted key namespaced per course; `GS-nn`/legacy IDs kept as `aliases[]`; 08's `extends` column adopted for both |
| Pron registry | `pron_targets` table, `pron.*` keys, minimal_pairs JSONB, l1_priority; FSRS card type `pron_pair` | no table; `PR-01..PR-18`; gateable/feedback status in prose only | `pron_targets` table + `gate_status ENUM('gateable','feedback')` (08's concept, made schema) |
| Error store | `saved_errors(user_id, category dotted taxonomy, source_ref, example, severity, l1_mechanism_ref, resolved_at)` | `error_log(learner_id, category UPPERCASE codes, lesson_id, interaction_id, ts, resolved)` | One table `saved_errors`; `user_id`; dotted taxonomy with per-course category registry; 08's codes remap (`SER-ESTAR` → `gram.ser_estar`) |
| Assessment evidence | evidence lives in `checkpoint_attempts.part_scores/evidence_refs` | separate `assessment_evidence(learner_id, component, instrument_ref, score, scaffolding_profile, media_refs)` FK → can_do_statements | Keep both: `checkpoint_attempts` (07 shape + 08's `retake_n`) **and** `assessment_evidence` (08's can-do-linked claims table — directly implements the owner's evidence rule) |
| Prerequisites | inline lesson lists `prereqs_hard/prereqs_soft` | table `lesson_prereqs(lesson_id, requires_lesson_id, gate_type hard/advisory, mastery_key?, threshold?)` | 08's table (data > inline lists; supports mastery gates); `advisory` = 07's `soft` |
| Exercise extras | `review_source_unit` (N−2 interleaving audit), mandatory option rationales | `accent_sensitivity ENUM(fail/flag/ignore)`, exit_rule, warmup | All adopted; `accent_sensitivity` renamed **`orthography_sensitivity`** (language-neutral) |
| Lesson ID grammar | `EN-U{uu}-L{nn}` (canonical R1) | `es-{unit}.{n}` / `es-{unit}.m1` (R1) | One grammar `{course}.u{uu}.l{nn}` / `.m{n}` **[proposed]**; both current forms registered as aliases; at minimum, course_map must declare its ID regex so platform tooling can parse either |
| Lesson type enum | `vocab\|grammar\|pron\|listening\|reading\|speaking\|writing\|culture\|review\|mission` (+ YAML codes V/G/P/L/R/S/W/C/X/M/AIW/AIS) | claims "existing skills.type enum" but index uses `lab`, `review`, `mission`, `ai:` tags | 07's enum (renaming 08 `lab`→`pron`); `ai_role` attribute replaces AIW/AIS/`ai:` tags |
| Mastery thresholds | 0.65 unlock course-wide; 0.70 missions | 0.60 unlock; 0.70 missions; <0.4 remediation trigger | Values become **per-course config** in course_map (`mastery_thresholds`), not platform constants — both stated values are legal |
| Speaking/exercise unlock | course rule: speaking blocks unlock at ≥70% on lesson flashcard+cloze | per-lesson `exit_rule {min_first_try_accuracy: 0.6}` | Both expressible via `lesson.exit_rule` + course default |
| Passage vocab boundary | passages ≥**70%** known vocabulary | exercises 100%; passages ≥**95%** (U1–U9) / 93 / 90 | Parameterized per course band in config — but see defect D5: 07's 70% needs pedagogical re-justification [requires validation] |
| Audio speed spec | mixed ×-rates (0.75×/0.85×/1.0×) and wpm | wpm ladder (R13), chosen "because wpm is what the pipeline configures" | wpm as canonical + optional `support_rate` multiplier for slowed renders |
| Checkpoint outcome labels | band gate `pass/pass_with_review/remediate` but CP1/CP2 `passed/passed_with_review/remediation` (inconsistent inside 07) | §8.1 `pass/…/remediate`, §8.2 `pass/…/remediation` (also inconsistent) | One enum: `passed \| passed_with_review \| remediation`; graduation: `graduated \| graduated_with_review \| remediation \| repeat_missions` (owner's words) |
| L1-contrast template slot | map: `{{l1_contrast: <target_id>}}`; band sample U1-L05: `{{l1_contrast_note: copula_be}}` (two spellings inside Direction A) | n/a (inline English) | `{{l1_contrast:<target_id>}}` only |
| Counting policy for vocab headline | recognition-tier (~15%, ~270 items) **included** in 1,800 | receptive pool (~210–330) **excluded** from 1,825 | One policy (defect D3; owner decision — recommendation below) |

**Conclusion:** the intent is one platform, but as written the platform team would have to build two
content pipelines. The unified schema below resolves every row above.

---

## 2. Unified authoring schema — the contract both courses must adopt **[proposed]**

JSON Schema style (draft 2020-12 conventions). This is the platform build target. All tables are
additive extensions; existing DB objects unchanged. DDL belongs to the schema workstream.

```yaml
# ============================================================
# PALAVOX UNIFIED CONTENT-AUTHORING SCHEMA v0.1  [proposed]
# One schema, two (n) courses. Anything language-specific is DATA
# under this schema, never a schema fork.
# ============================================================
$id: palavox/authoring-schema/v0.1
$defs:

  course_config:            # one row per course — platform engines read ONLY config, never code forks
    type: object
    required: [course_id, l2, instruction_language_mode, id_regex, mastery_thresholds,
               vocab_counting_policy, passage_known_vocab_min, release_ratio_targets,
               orthography_policy, audio_speed_ladder_wpm, review_mix_policy, load_ceilings]
    properties:
      course_id: {type: string}                    # en-esl-a0-to-strong-a2 | es-for-en
      l2: {type: string}
      instruction_language_mode:
        enum: [learner_l1, fixed]                  # 07: learner_l1 (41 UI langs); 08: fixed 'en'
      fixed_instruction_language: {type: [string, "null"]}
      id_regex: {type: string}                     # declared lesson-ID grammar; canonical target:
                                                   #   {course}.u{uu}.l{nn} / .m{n}  [proposed]
      mastery_thresholds:
        type: object                               # VALUES are course data (07: .65/.70; 08: .60/.70/.40)
        required: [unlock, mission_gate]
        properties:
          unlock: {type: number}
          mission_gate: {type: number}
          remediation_floor: {type: [number, "null"]}
      vocab_counting_policy:
        enum: [core_includes_recognition_tier,     # current 07
               core_excludes_receptive_pool]       # current 08 — see defect D3: pick ONE course-wide
      passage_known_vocab_min: {type: object}      # per band, e.g. {A1E: 0.95, ...}
      release_ratio_targets: {type: object}        # per band {structured, guided, open}
      orthography_policy: {type: object}           # e.g. ES accent timeline (R10); EN mechanics thread
      audio_speed_ladder_wpm: {type: object}       # canonical wpm per unit; optional support_rate
      review_mix_policy: {type: object}            # 07 N-2 >=20% | 08 warm-up gradient — both encodable
      load_ceilings:
        type: object                               # new items per lesson kind (see defect D2)
        properties: {teaching: {type: integer}, interaction: {type: integer}}

  lesson:
    type: object
    required: [id, course_id, unit, band, type, status, est_minutes, can_do_refs,
               grammar_refs, pron_refs, vocab_map, intro_md, exercises]
    properties:
      id: {type: string}                           # must match course_config.id_regex; aliases[] allowed
      course_id: {type: string}
      unit: {type: string}
      band: {enum: [A1E, A1L, A2E, A2L]}
      type: {enum: [vocab, grammar, pron, listening, reading, speaking, writing,
                    culture, review, mission, integrated]}
      ai_role: {enum: [none, written, spoken, written_micro, spoken_micro, spoken_open]}
      status: {enum: [draft, gated, operational]}  # existing lifecycle, unchanged
      est_minutes: {type: integer, minimum: 8, maximum: 18}
      one_line_objective: {type: string}
      can_do_refs: {type: array, items: {type: string}, minItems: 1}   # -> can_do_statements
      grammar_refs: {type: array, items: {type: string}}   # dotted keys, e.g. gram.pres_cont.now
      extends: {type: array, items: {type: string}}        # 08 R4e rule, adopted for both courses
      pron_refs: {type: array, items: {type: string}}      # pron.* keys
      test_out_condition: {type: [string, "null"]}         # 07 (e.g., Latin-script L1s skip U1-L02)
      warmup: {type: object}                               # {fsrs_cards: n, composition: ref} (08)
      vocab_map:
        type: array
        items:
          type: object
          required: [lemma, item_type, receptive_productive]
          properties:
            lemma: {type: string}
            item_type: {enum: [word, chunk]}
            part_of_speech: {type: string}
            receptive_productive: {enum: [receptive, productive, receptive_to_productive]}
            register: {type: string}               # incl. 'sign', 'service_script' (07)
            form_of: {type: [string, "null"]}      # irregular/tense-partner forms, one card family
            variant_of: {type: [string, "null"]}   # 08 regional variants
            variant_region: {type: [string, "null"]}
            grammar_pattern: {type: [string, "null"]}   # gustar-class etc. (08)
            stress_position: {type: [integer, "null"]}
            ipa: {type: string}
            frequency_rank: {type: [integer, "null"]}
            example_sentence: {type: string}
            recycled: {type: boolean}
      intro_md: {type: string, maxLength_words: 120}       # {{l1_contrast:<target_id>}} slots only
      exercises: {type: array, minItems: 8, maxItems: 14, items: {$ref: "#/$defs/exercise"}}
      micro_interaction: {type: [string, "null"]}  # ai_interaction ref, tier=micro; REQUIRED for
                                                   # non-review lessons from U7 on (both courses)
      exit_rule: {type: [object, "null"]}          # {min_first_try_accuracy, else}
      mastery_effects: {type: object}
      saved_error_categories: {type: array, items: {type: string}}   # dotted taxonomy
      analytics_extra: {type: array}
      prereqs: "-> lesson_prereqs table rows (hard | advisory, lesson- or mastery-keyed); DAG-checked"

  exercise:
    type: object
    required: [seq, type, prompt, difficulty, receptive_productive, rationale]
    properties:
      seq: {type: integer}
      type: {enum: [flashcard, cloze, matching, ordering, dictation, listening_mc,
                    speaking, translation, dialogue]}         # EXISTING enum only — both courses comply
      prompt: {type: string}       # instructional frame localized per course_config; L2 content constant
      difficulty: {type: integer, minimum: 1, maximum: 5}
      receptive_productive: {enum: [receptive, productive, receptive_to_productive]}
      timing_s: {type: integer}
      keys: {type: array}
      options:                     # EVERY option carries a rationale (both courses' lints agree)
        type: array
        items: {type: object, required: [label, is_correct, rationale]}
      distractor_bank: {type: array}          # L1-interference-informed where l1_contrast rows exist
      audio_assets: {type: array}             # [{ref, wpm|support_rate}]
      vocab_refs: {type: array}               # ⊆ cumulative taught set (lint)
      grammar_ref: {type: [string, "null"]}
      review_source_unit: {type: [string, "null"]}   # 07 interleaving audit — adopted for both
      orthography_sensitivity: {enum: [fail, flag, ignore]}  # renamed from 08 accent_sensitivity
      scoring: {type: string}

  vocabulary_translations:     # serves 41 L1s (07) and the single-L1 case (08, l1_code='en')
    columns: [vocabulary_id, l1_code, translation, usage_note,
              source ENUM('human','mt','mt_reviewed'), reviewed_by, reviewed_at]
    note: "cognate_status lives HERE (per language-pair), not on vocabulary — see defect D10"
    added_column: cognate_status ENUM('transparent','semi','false_friend','none') NULL

  l1_contrast_notes:           # 07 superset — course-optional
    columns: [id, scope ENUM('grammar_point','pron_target','lesson','vocab_item','pragmatics'),
              ref_id, l1_code, contrast_type ENUM('absent_in_l1','present_but_different',
              'false_friend','positive_transfer','phonological'), severity 1-3, render_priority 1-3,
              note_l1_md, predicted_errors JSONB, distractor_hints JSONB, recast_example,
              remediation_refs JSONB, inherited BOOL]

  grammar_points:
    columns: [id TEXT dotted-key unique per course, course_id, name, cefr_level,
              communicative_need, ordered_index, contrast_priority ENUM('low','med','high'),
              aliases JSONB]   # legacy GS-nn / G-nn / A1E-Gn IDs preserved here
    junction: lesson_grammar_map(lesson_id, grammar_id, role ENUM('introduce','extend','recycle'))
    note: "role='extend' encodes 08's extends: rule; role='recycle' makes grammar recurrence lintable (defect D11)"

  pron_targets:
    columns: [id TEXT dotted-key, course_id, feature, minimal_pairs JSONB, l1_priority JSONB,
              gate_status ENUM('gateable','feedback'), aliases JSONB]
    fsrs: "card type pron_pair in vocab_card_state (07) — available to both courses"

  ai_interaction:              # THE 16-FIELD OWNER CONTRACT — all 16 required, no exceptions
    type: object
    required: [id, lesson_id, mode, tier, version,
               communicative_objective, curriculum_context, assumed_vocabulary, target_grammar,
               target_pronunciation, permitted_unfamiliar_language, scaffolding_rules,
               expected_ai_behavior, correction_rules, success_criteria, mastery_effects,
               saved_error_categories, review_behavior, analytics, failure_handling,
               cost_expectations]
    properties:
      mode: {enum: [written, spoken]}         # written mode: target_pronunciation holds orthographic targets
      tier: {enum: [micro, guided, open, mission]}   # micro may inherit unit defaults (07 R11-band rule)
      version: {type: integer}
      scaffolding_rules:
        type: object                          # unified model
        required: [levels, auto_escalate]
        properties:
          levels: {type: object}              # 0 none .. 3 L1-hint/model (level-3 turns unassessed)
          auto_escalate: {type: object}       # {idle_s, failed_sends|false_starts}
          fade_trigger: {type: [string, "null"]}
          floor_level: {type: [integer, "null"]}   # A1 rule: scaffolds never fully removed
      correction_rules:
        type: object
        required: [priority, in_flight, post_task]
        properties:
          priority:
            const: [understanding_blocking, current_lesson_target,
                    repeated_high_value, intelligibility_pronunciation]   # owner order, fixed
          in_flight: {type: string}           # concise recasts, max/turn, never mid-utterance
          post_task: {type: string}           # bounded feedback card + >=1 strength
      success_criteria:
        type: object
        required: [task, language, interaction]
      cost_expectations:
        type: object
        required: [est_usd, p95_usd]          # [estimated][requires validation] at authoring

  mission:                     # extends ai_interaction (tier=mission); union of 07 §8.2d and 08 §9.3
    allOf: [{$ref: "#/$defs/ai_interaction"}]
    required: [scenario, scenes, planted_breakdowns, difficulty_tiers, rubric,
               lifeline_policy, variants, retry_policy, outcome_enum, evidence]
    properties:
      scenario: {type: string}                # learner task card, instruction-language rendered
      scenes: {type: array, minItems: 1}      # 08; single-scene missions = 1 entry
      planted_breakdowns: {type: array}       # >=1 where the map specifies; exactly one per scene (08)
      difficulty_tiers: {type: object}        # {T1_supported, T2_default, T3_stretch} (07)
      rubric: {type: object, required: [cells, scale, pass_rule]}
      lifeline_policy: {type: object}         # mission tier scaffolding 0-1 only; lifelines logged
      variants: {type: array}                 # retry never verbatim (both courses agree)
      retry_policy: {type: object}            # {max_per_day, remedial_branch_after, escalation}
      outcome_enum:
        const: [completed, completed_with_support, repeat_mission]
      evidence: {type: string}                # feeds checkpoint/graduation evidence chain

  checkpoints:
    columns: [id, course_id, after_unit, kind ENUM('band_gate','checkpoint','graduation'),
              certifies JSONB, minutes, parts JSONB, outcome_enum JSONB, retake_policy JSONB]
    outcome_enums:
      gate_and_checkpoints: [passed, passed_with_review, remediation]
      graduation: [graduated, graduated_with_review, remediation, repeat_missions]
  checkpoint_attempts:
    columns: [checkpoint_id, user_id, part_scores JSONB, evidence_refs JSONB, outcome, retake_n]
  assessment_evidence:         # 08's can-do-linked claims ledger — adopted for BOTH courses
    columns: [user_id, course_id, component, instrument_ref, score, scaffolding_profile,
              media_refs JSONB, can_do_statement_id FK]
    rule: "proficiency claims derive ONLY from rows here + checkpoint_attempts — never XP/streaks/completion/time"

  saved_errors:                # unified error store (07 name; replaces 08 error_log)
    columns: [user_id, course_id, category TEXT dotted, source_kind ENUM('exercise','interaction',
              'mission','assessment'), source_ref, example, severity, l1_mechanism_ref NULL,
              created_at, resolved_at]
    taxonomy: "dotted, per-course registry: gram.* vocab.* pron.* orth.* prag.* listen.* mech.*;
               08's codes remap (SER-ESTAR -> gram.ser_estar, ACC-DIACRITIC -> orth.diacritic, ...)"
    clearance: "2 consecutive correct productions IN INTERACTION (07 rule; adopt course-wide)"

  lesson_prereqs:              # 08 shape, adopted
    columns: [lesson_id, requires_lesson_id NULL, mastery_key NULL, threshold NULL,
              gate_type ENUM('hard','advisory')]
    lint: DAG-required

  vocab_exposure_matrix:       # 08's derived view — adopted for BOTH courses (defect D11 fix for 07)
    view: "item x 8 recycling contexts x planned refs; gate: >=6/8 planned, listening + spaced
           review mandatory, before unit gated->operational"
```

**Lint suite (merged; supersedes 07 §9.3 and 08 §10.3):** vocabulary boundary (thresholds from
course_config) · grammar ceiling · key/field completeness (**16** interaction fields; option
rationales; IPA + example on vocab) · audio coverage at declared wpm/support rates · recycling
(exposure-matrix ≥6/8 **and** review_source_unit share vs course policy) · readability caps ·
translation completeness (priority L1s human/mt_reviewed) · prereq DAG · L1-contrast gate
(priority L1s on med/high targets before gating; ESL only) · orthography-policy conformance ·
cost/analytics presence · ID/alias resolution.

---

## 3. Totals audit (all sums recomputed from the files)

| Metric | Owner range | 07 ESL | 08 Spanish | Verdict |
|---|---|---|---|---|
| Units | 12 | 12 | 12 | ✓ both |
| Core lessons | 200–300 scope; ~240 working target | **220** (54+55+55+56 — unit sums verified) | **228** (19+18+19+18+19+17+20+21+21+18+18+20 — verified) | ✓ in scope; both under ~240 with logged justification (07 R3 via 240 scheduled sessions; 08 R2 no-padding rationale). Acceptable per owner "justify deviations" |
| A1 / A2 lessons | 90–110 / 120–150 | 90 / 130 (verified; U6→A2 per R2) | 93 / 135 (verified) | ✓ both |
| Vocab items | 1,800–2,200 | **1,800** (unit sums verified; 1,197 words + 603 chunks = 1,800 ✓; cumulative column ✓) | **1,825** (unit single+chunk sums all verified; cumulative ✓) | ✓ both at low end, with matching independent justification ("chunk-limited, not lemma-limited") — but counting policies differ (D3) |
| Chunk share | — | 603 (33.5%) | table sums to **459**, text says "~457" (25.2%) | ⚠ trivial arithmetic slip in 08 §1/§12 (~457 → 459) |
| Hours | ~100–165 | 6,943 min = **115.7 h** verified (all 9 activity rows × 4 bands re-added ✓); claimed median ~117 with R4 uplift ✓; **claimed range [95, 150] — the 95 floor is BELOW the owner's 100 floor while the text claims "inside the owner's envelope"** | 7,308 min = **121.8 h** verified (all rows ✓); range [100, 145] ✓ | ⚠ 07 wording/range defect (D8); 08 ✓ |
| Hour buckets separated per owner list | required | ✓ 9 buckets | ✓ 8 buckets | ✓ both |
| Grammar targets | — | 66 (counted: 7+9+7+5+4+4+6+4+5+6+5+4 ✓) | 83 (GS-01..83 contiguous ✓) | ✓ |
| Pron targets | — | 18 (counted ✓) | 18 (PR-01..18 ✓) | ✓ |
| Missions | — | 12 (one/unit) | 10 (U1, U2 none) | ✓ (owner doesn't mandate per-unit missions; both meet the per-unit written+spoken interaction rule) |
| Assessment events | 2 checkpoints + graduation (skeleton) | Band Gate + CP1 + CP2 + GRAD-01/02/03 | Band Gate + CP1 + CP2 + Graduation | ✓ both (band gate is an addition both made; consistent) |
| Internal arithmetic notes | — | Graduation session minutes: §11.1 describes ~12+15+25 ≈ 52 min, but §7.2 budgets **95 min** assessment for A2L — ~43 min unexplained (retakes/buffer unstated) | Assessment row 25+35+35+55 = 150 ✓ | ⚠ minor 07 (D15) |
| Review-lesson claim | — | — | §1 claims "12 cumulative-review lessons"; YAML types only **9** as `review` (U1–U3 embed review in combined lessons) | ⚠ minor 08 (D14) |

**Cross-course comparability warning (D3):** 07's 1,800 **includes** ~15% recognition-tier items;
08's 1,825 **excludes** its ~210–330 receptive pool. The two headline numbers are not the same
metric. Recommendation **[proposed]**: adopt 08's policy (core = countable taught items with the
productive/recognition split reported; exposure-only pool excluded) and restate 07's headline with
its split shown (07 already has the R17 tagging to do this at zero content cost).

---

## 4. Progressive-release audit — **both compliant**

| Band | Owner (S/G/O) | 07 planned | 08 planned | Verdict |
|---|---|---|---|---|
| Early A1 | 70–80 / 20–30 / ~0 | 78 / 22 / 0 | 75 / 25 / 0 | ✓✓ |
| Late A1 | 55–65 / 30–40 / 5–10 | 59 / 34 / 7 | 61 / 32 / 7 | ✓✓ |
| Early A2 | 40–50 / 35–45 / 10–20 | 46 / 36 / 15 (+3 assessment) | 45 / 40 / 15 | ✓✓ |
| Late A2 | 25–35 / 35–45 / 25–35 (+missions) | 34 / 35 / 30 | 30 / 41 / 29 | ✓✓ |

- Band-file spot-checks corroborate the derivations (en-early-a1 §14: 1,002/279/0 min = 78/22/0 ✓;
  en-early-a2 §14: 46/35.7/14.8 ✓; es-early-a1 §14: 75/25/0 ✓). These are planned exercise-slot/
  minute mixes — pilot telemetry must confirm actuals [requires validation].
- Per-unit owner rule (≥1 written AND ≥1 spoken AI interaction per unit) verified in both:
  EN U1 satisfies it via controlled-completion chat (L03/L17) + guided spoken Q&A — thin but
  present; ES U1 via es-1.18/es-1.19. From U7 both add per-lesson micro-interactions ✓ (aligned
  progressive-release choice, deliberately mirrored).
- ⚠ 08 §3.2 caption bug: the AI (S/W/M) column says "micro-interactions not counted," but the
  printed counts only reconcile with the lesson index if `*_micro`-tagged lessons ARE counted
  (U4 3/2/1, U5 3/2/1, U6 3/1/1, U12 4/1/1). Fix caption or counts (D13).
- ⚠ 08's per-lesson micro rule says "every core lesson" from U7; 07 exempts review lessons.
  Unified schema wording: required for non-review lessons U7+ (both maps should state it identically).

---

## 5. Shared-platform vs language-specific separation

**Both maps correctly treat as platform (build-once):** FSRS scheduler + vocab_card_state; the
skill_mastery/gating engine; the lint/CI framework; the AI-interaction runtime (persona, scaffold
executor, owner correction-priority stack, recast budgets); the mission runtime (scenes, planted
breakdowns, variants, retries); the checkpoint/graduation runtime (adaptive conversation, rubric
scoring, evidence chain); error-store → review regeneration; TTS/ASR pipeline; translation/
localization rendering; the status lifecycle. All parameterized by content. This is the right cut.

**Leaks found (content ↔ platform):**

1. **08 → shared schema:** `vocabulary.cognate_status` as a global column presumes a fixed L1
   (English). Cognate-ness is a property of a language *pair*: for the ESL course, `taxi` is
   transparent for es/pt/ru learners and opaque for zh learners. Move it to
   `vocabulary_translations.cognate_status` (per l1_code) — done in §2. (D10)
2. **08 naming:** `exercises.accent_sensitivity` is Spanish-shaped naming for a general mechanism
   (diacritic/orthography scoring). Renamed `orthography_sensitivity`; ES's R10 timeline and EN's
   apostrophe/capitalization rules both become data under it. (D18)
3. **Both:** mastery thresholds (0.65 vs 0.6), passage known-vocab minima (70% vs 95%),
   sentence-length caps, new-item ceilings and review-mix ratios are written as if constants.
   Neither map states that these are per-course *config* the platform reads. §2 `course_config`
   fixes this; both files should add one line saying their numbers are config values. (D20)
4. **07 internal:** two spellings of the L1-contrast template slot (`{{l1_contrast: …}}` in the
   map vs `{{l1_contrast_note: …}}` in the A1E sample) — a platform templating feature must have
   exactly one name. (D19)
5. **08, minor:** §11.1 budgets 80 h of authoring for the "Graduation (adaptive conversation
   engine spec…)". Spec-writing is legitimately content-adjacent, but the *engine* is platform
   work shared with 07's GRAD-03; the two graduation runtimes must be one engine with two
   course configs (07: 4-phase conversation + 3-session structure; 08: 6-phase single sitting +
   component battery). Neither map names the other's graduation shape; the platform team should
   be told explicitly the runtime must support both. (D16)
6. **No reverse leak found:** 07 does not embed English-specific assumptions in its proposed
   platform tables (its `l1_contrast_notes`, `test_out_condition`, register enums are generic). ✓

---

## 6. Recycling audit — vocabulary guaranteed in both; grammar under-enforced in 07

| Dimension | 07 ESL | 08 Spanish | Verdict |
|---|---|---|---|
| 8-context vocab recurrence | Structural table for all 8 contexts + coverage contract (≥1 productive in origin + ≥2 later lessons; N−2 ≥20% review slots; listening ≥70% known; assumed_vocabulary ⊆ taught; FSRS lifetime; worked example "I'd like") | Structural table for all 8 + **vocab_exposure_matrix gate: ≥6/8 contexts planned, listening + spaced review mandatory, blocking at unit gating**; ≥2 passages within 2 units; worked example "la cuenta" (8/8) | Both guarantee recurrence structurally ✓ — but 08's ≥6/8 matrix gate is strictly stronger than 07's ≥2-future-placements orphan lint. **Adopt the matrix for both** (§2). |
| Review interleaving | exercises.review_source_unit + ≥20% N−2 rule, audited by lint gate 5 | R8 warm-up composition gradient (50/30/20 → 40/30/30) + review-lesson mix | Both fine; mechanisms differ but are both schema-expressible; unified schema carries both fields |
| Grammar recurrence | Spine's "Extended/recycled at" column: **~26 of 66 targets show "—" (no planned recycling)**; no lint checks grammar recurrence; recycling implicitly via cumulative reviews/missions | Spiral rows with `extends:` (R4e), R8 gradient pulls old grammar, `grammar_review_state` delayed micro-probes (R9), running-spine list per unit | ⚠ 07 weaker: grammar recurrence is asserted, not enforced. Fix (D11): adopt `lesson_grammar_map.role='recycle'` rows + a grammar-recurrence lint (every med/high target ≥2 post-introduction planned occurrences), and fill 07's "—" cells or justify each |
| Error-driven recycling | saved_errors → drills ≤48 h; clearance = 2 correct productions in interaction | error_log → +1/+4-day scheduling; clinics at category count ≥4 | Both present ✓; unify store + clearance rule per §2 |

---

## 7. Sample-quality audit — 2 lessons + 2 mission contracts per course vs the owner's interaction-contract checklist

Checklist = the owner's 16 mandated fields (communicative objective · curriculum context · assumed
vocabulary · target grammar · target pronunciation · permitted unfamiliar language · scaffolding
rules · expected AI behavior · correction rules w/ priority stack · success criteria · mastery
effects · saved error categories · review behavior · analytics · failure handling · cost
expectations), plus each map's own lesson-contract requirements.

### 07 ESL samples

| Sample | File | Missing / defective vs contract |
|---|---|---|
| Lesson `EN-A1E-U1-L05` | `wip-curriculum-en-early-a1.md` §13a | Missing lesson fields: `band`, `can_do_refs`, `grammar_refs`, `pron_refs`, lesson-level `mastery_effects`, `saved_error_categories`, `analytics_extra`; `prerequisites` not split hard/advisory; vocab_map entries are bare strings (no item_type/pos/ipa/frequency_rank/example); wrong slot name `{{l1_contrast_note:}}`; embedded dialogue references short-form contract `…-DLG` that "inherits unit defaults" — unit-default contract itself never shown; **review-slot share ≈1/9 ≈ 11% < the map's own ≥20% N−2 rule** |
| Lesson `EN-A2-U9-L04` | `wip-curriculum-en-early-a2.md` §13a | Missing: `can_do_refs`, `pron_refs` (P7 only in prose), legacy `grammar_point: G11` not canonical `gram.past.regular_ed` (expected pre-R5, must remap at authoring); **review-slot share 1/12 ≈ 8% < 20% rule** (E12 is the only interleave); micro-interaction present ✓ (good — matches R11) |
| Mission `EN-A1E-U3-M01` | `wip-curriculum-en-early-a1.md` §13d | All 16 owner fields present ✓. Missing vs 07 §8.2d mission_extra: `difficulty_tiers` (none), structured `rubric {cells, scale, pass_rule}` (uses checklist prose), `variants` only implied ("variant B"), `retry_policy` buried inside cost_expectations ("max 2 attempts/day"); no `version`/`profile` |
| Mission `MISSION-U8-L19` (pharmacy) | `wip-curriculum-en-early-a2.md` §13d | All 16 owner fields present ✓, incl. a real rubric ✓. Missing: structured `difficulty_tiers` (tiers referenced in prose only), `variants` absent; **mastery_effects bakes in "CP2 Part D exemption"** which map-of-record R13 explicitly HELD as an open owner decision — band file must carry the resolution flag or the pipeline will author a contradicted behavior |

### 08 Spanish samples

| Sample | File | Missing / defective vs contract |
|---|---|---|
| Lesson `ES-A1E-U1-L06` | `wip-curriculum-es-early-a1.md` §13a | Missing structured fields vs 08 §9.2: `one_line_objective`, `grammar_targets` (no GS refs at all), `pron_targets` (vowel goal prose only), `can_do_refs`, `warmup`, `prereqs` hard/advisory (prose "gates U1-L07"); saved categories appear only inside exercise prose; intro_md in English ✓ (R11-compliant) |
| Lesson `es-10.6` | `wip-curriculum-es-late-a2.md` §13a | Vocab table lacks **IPA** (08 lint V1 requires it) and `cognate_status` column (v9 prose only); grammar refs use legacy `G-L6` (pre-R6, must remap to GS-71); missing `can_do_refs`, `warmup` detail; **no closing AI micro-interaction despite the course rule "from U7 on, every core lesson ends with a 1–2-turn micro-interaction"** (E8 branching dialogue is an exercise, not a contracted micro) |
| Mission `ES-A1E-U3-M01` | `wip-curriculum-es-early-a1.md` §13d | All 16 owner fields present ✓ (+ scenario, mission-type). Missing structured: `scenes[]` (4 scenes prose), `tier`, mission `outcome_enum` (failure handling says "repeat_missions state" — wrong enum, that's the graduation outcome; mission-level should be `repeat_mission`), no rubric cells/scale |
| Mission `es-12.19` | `wip-curriculum-es-late-a2.md` §13d | All 16 owner fields present ✓; planted breakdown per segment ✓; graduation-evidence link consistent with 08 §8.4 ✓. Missing structured: `difficulty_tiers`, `rubric {cells, scale}` (success criteria prose), `variants` as templates ("fresh surface details" prose); uses outcome `repeat_mission` while sibling sample es-10.10 and §8.4 use `achieved_with_support` — the 08-internal enum clash again |

**Pattern:** every sampled mission carries all 16 owner fields (excellent), but **none of the four
missions ships the structured difficulty-tier + rubric-cells shape its own map mandates**, and
**all four sampled lessons are missing `can_do_refs`** — the field that links content to the
evidence model both maps stake their proficiency claims on. Lesson samples also predate the ID
unification (legacy G/GS keys) — expected, but the authoring pipeline must remap, so the unified
schema's `aliases` field is load-bearing, not cosmetic.

---

## 8. Ranked defect list

Severity: **CRITICAL** (blocks platform build or breaks an owner mandate) · **MAJOR** (contradiction
that will corrupt content or metrics if authored as-is) · **MODERATE** (inconsistency requiring
coordinated edit) · **MINOR** (localized fix).

| # | Sev | Defect | File(s) to change | Required change |
|---|---|---|---|---|
| D1 | CRITICAL | No single shared authoring schema: ~20 divergent fields/tables/enums (§1) — platform would need two pipelines | 07 §8, 08 §9 (+ both YAML maps) | Both adopt §2 unified schema; each map replaces its §8/§9 with a pointer + course-specific config values |
| D2 | MAJOR | 08's R12 load ceilings (≤10 new items/teaching lesson, ≤4/interaction lesson) are arithmetically impossible against its own unit budgets in **8 of 12 units**. Worst: U11 capacity ≈ (12 teaching×10)+(4 interaction×4) = **136 < 182 budgeted**; U8 ≈ 160 < 183; U5 ≈ 140 < 162; also U4, U6, U7, U10, U12. Lint V7 as specified would block most of the course | 08 §2 R12, §4.1, §10.3 V7 | Either raise the ceiling for designated vocab-wave lessons (e.g., ≤14 with justification), reclassify part of each budget to the receptive pool, or cut unit budgets; recompute and restate R12 with the per-unit arithmetic shown |
| D3 | MAJOR | Vocab headline metrics computed under different counting policies (07 includes ~15% recognition tier in 1,800; 08 excludes its 210–330 receptive pool from 1,825) — cross-course dashboards, owner reporting, and the 1,800–2,200 compliance claim are not comparable | 07 §4.1, 08 §4.1, both YAML `totals` | Owner picks one policy (recommend 08's); the other map restates its headline with the productive/recognition split explicit |
| D4 | MAJOR | 08 declares the owner interaction contract as "**15** mandatory fields" (§1, §9.3 heading, lint V11) — owner mandates **16**; 08's own YAML has all 16 keys but `failure_handling` is unnumbered, so V11 as written could pass an empty failure-handling field, violating the owner's "never a dead end" rule | 08 §1, §9.3, §10.3 V11 | s/15/16/; number failure_handling; V11 validates 16 non-empty fields |
| D5 | MAJOR | Passage known-vocabulary floors differ hugely: 07 ≥**70%** vs 08 ≥**95/93/90%**. 70% is far below comprehensible-input norms for A-level listening and contradicts 07's own "planted recycling" intent | 07 §4.2 row 3, §7.3, §9.3 gate 1 | Raise 07's floor to ≥90–95% per band (or produce evidence justifying 70%) [requires validation]; unified schema makes the floor per-course config either way |
| D6 | MODERATE | Three mission-outcome vocabularies: 07 "rated ≥ functional"; 08 §9.3 `completed_with_support`; 08 §8.4 + samples `achieved_with_support` (08 is internally inconsistent) | 07 §11.2 GR-0, 08 §8.4/§9.3, es band files §13 | One enum `completed / completed_with_support / repeat_mission` (§2); 07 maps its "functional" rubric label onto it; 08 fixes §8.4 + 13b |
| D7 | MODERATE | Assessment outcome labels drift *within each file*: 07 band gate `pass/remediate` vs CP `passed/remediation`; 08 §8.1 `remediate` vs §8.2 `remediation` | 07 §3.2 assessments, 08 §8.1/§12 | One enum `passed / passed_with_review / remediation` everywhere below graduation |
| D8 | MODERATE | 07 claims hours "range 95–150 — inside the owner's 100–165 h envelope"; 95 < 100. The claim is false at the low end (fast learners finishing under 100 h is fine pedagogically, but the compliance sentence is wrong) | 07 §1, §7.2, YAML est_hours | Restate: median 117, range 95–150, "median and bulk of range inside owner envelope; sub-100 tail = fast-learner case, flagged" — or clip the planning floor to 100 |
| D9 | MODERATE | Identifier regimes diverge: dotted `gram.*`/`pron.*` + dotted error taxonomy (07) vs `GS-nn`/`PR-nn` + UPPERCASE error codes (08); lesson-ID grammars incompatible (`EN-U01-L05` vs `es-1.6`) | 08 §5/§6/§9.4 (remap tables), 07 R1 note, both YAML | Adopt dotted keys + aliases per §2; 08 adds a GS→dotted and code→dotted mapping column (mechanical; no content change); course_map declares id_regex |
| D10 | MODERATE | `vocabulary.cognate_status` proposed as a global column (08) is language-*pair* data — wrong for the shared vocabulary table serving a 41-L1 course | 08 §9.1 | Move to `vocabulary_translations.cognate_status` (per l1_code); ES-for-EN populates only `l1_code='en'` rows |
| D11 | MODERATE | Grammar recycling unenforced in 07: ~26/66 spine targets list no recycling point and no lint checks grammar recurrence (vocab-only gates) | 07 §5, §9.3 | Fill/justify the "—" cells; adopt `lesson_grammar_map.role` + grammar-recurrence lint and the `vocab_exposure_matrix` analogue (§2); 08 already stronger — adopt its `grammar_review_state` for both |
| D12 | MINOR | Both EN sample lessons violate 07's own ≥20% N−2 review-slot rule (U1-L05 ≈11%; U9-L04 ≈8%) — samples are the calibration exemplars for authors | wip-curriculum-en-early-a1.md §13a, wip-curriculum-en-early-a2.md §13a | Add review slots or annotate why early-position lessons get a reduced quota (and encode that exception in the lint) |
| D13 | MINOR | 08 §3.2 AI-column caption ("micro-interactions not counted") contradicts the printed counts, which only reconcile if `*_micro` lessons are counted (U4 3/2, U5 3/2, U6 3/1, U12 4/1) | 08 §3.2 | Fix caption ("counts standalone interaction lessons incl. micro-led; per-lesson closing micros not counted") or recount |
| D14 | MINOR | 08 §1 "includes 12 cumulative-review lessons" vs 9 `type: review` lessons in its own §12 YAML (U1–U3 reviews are embedded halves); chunk total states ~457, table sums 459 | 08 §1, §4.1, §12 | Say "9 standalone + 3 embedded reviews"; fix 457→459 |
| D15 | MINOR | 07 graduation minutes: §11.1 describes ≈52 min of GRAD sessions but §7.2 budgets 95 min A2L assessment — ~43 min unexplained | 07 §7.2 or §11.1 | Reconcile (state retake/buffer allowance explicitly) |
| D16 | MINOR | Graduation runtimes differ structurally (07: 3 sessions, 4-phase conversation, 7-dim rubric; 08: single 55-min battery, 6-phase conversation, component gates) and neither tells the platform team the engine must be one configurable runtime | 07 §11, 08 §8.4 (one paragraph each) | Add a cross-reference: single adaptive-conversation engine, phases/rubrics/gates as course data |
| D17 | MINOR | Band sample MISSION-U8-L19 hard-codes the CP2 Part-D exemption that 07 R13 explicitly holds open | wip-curriculum-en-early-a2.md §13d | Tag the field "[held — owner decision R13]" so the pipeline doesn't author it by default |
| D18 | MINOR | `accent_sensitivity` naming is language-specific for a general mechanism | 08 §9.1/§9.2/§10.3 V9 | Rename `orthography_sensitivity` (values unchanged) |
| D19 | MINOR | Two spellings of the L1-contrast template slot inside Direction A (`{{l1_contrast:}}` map vs `{{l1_contrast_note:}}` band sample) | 07 §8.2a; wip-curriculum-en-early-a1.md §13a | Standardize `{{l1_contrast:<target_id>}}` |
| D20 | MINOR | Threshold/config constants (mastery 0.65 vs 0.60, caps, floors) presented as absolutes in both maps; platform needs them declared as per-course config | 07 §3.2 gating, 08 §2 R9 | One sentence each: "values are course_config data under the shared schema" |
| D21 | MINOR | Checkpoint certification coverage differs: 07's CP2 certifies U6–U8; 08's CP2 certifies only U7–U8, leaving U6 and U9 certified by no checkpoint until graduation | 08 §8.3 (or owner sign-off) | Either extend CP2's certifies-set or add an explicit note that U6/U9 evidence rides on unit reviews + missions + graduation sampling [proposed — owner call] |
| D22 | MINOR | Audio speed configuration split: ×-rates (07) vs wpm ladder (08) | 07 §7.3/§8.2b | Adopt wpm + `support_rate` per §2 (08's R13 rationale applies course-wide) |

No CRITICAL defects beyond D1 (which is the report's raison d'être and fully resolvable with §2);
nothing found that invalidates either course's pedagogy, totals, or gate design.

---

## 9. Machine-readable validation summary (YAML)

```yaml
consistency_report:
  id: wip-07-08-consistency
  date: 2026-07-30
  inputs: [07-esl-curriculum-map.md, 08-spanish-curriculum-map.md]
  band_files_spot_checked: [wip-curriculum-en-early-a1.md, wip-curriculum-en-late-a1.md,
    wip-curriculum-en-early-a2.md, wip-curriculum-en-late-a2.md, wip-curriculum-es-early-a1.md,
    wip-curriculum-es-late-a1.md, wip-curriculum-es-early-a2.md, wip-curriculum-es-late-a2.md]
  verdict:
    shared_schema_today: false
    unified_schema_defined: true          # this report §2, [proposed]
    totals_within_owner_ranges: true      # with D3 counting-policy caveat and D8 wording fix
    progressive_release_compliant: {esl: true, spanish: true}
    recycling_guaranteed: {vocab_esl: true, vocab_spanish: true,
                           grammar_esl: partial, grammar_spanish: true}
    platform_content_separation: mostly_clean   # leaks: D10, D18, D19, D20, D16
  recomputed_totals:
    esl:     {core_lessons: 220, a1: 90, a2: 130, vocab: 1800, words: 1197, chunks: 603,
              grammar: 66, pron: 18, missions: 12, minutes: 6943, hours: 115.7,
              claimed_hours_median: 117, claimed_range: [95, 150], range_low_below_owner_floor: true}
    spanish: {core_lessons: 228, a1: 93, a2: 135, vocab: 1825, chunks_stated: 457, chunks_actual: 459,
              grammar: 83, pron: 18, missions: 10, minutes: 7308, hours: 121.8,
              claimed_range: [100, 145]}
    owner:   {lessons_target: 240, lessons_scope: [200, 300], vocab: [1800, 2200], hours: [100, 165]}
  interaction_contract:
    owner_field_count: 16
    esl_declares: 16
    spanish_declares: 15        # defect D4 — all 16 keys present, count text + lint V11 wrong
  sample_audit:
    esl:
      lessons:  [{id: EN-A1E-U1-L05, owner16: n/a, missing: [band, can_do_refs, grammar_refs,
                   pron_refs, mastery_effects, saved_error_categories, structured_vocab_map],
                   review_slot_share: 0.11, rule: 0.20},
                 {id: EN-A2-U9-L04, missing: [can_do_refs, pron_refs, canonical_grammar_key],
                   review_slot_share: 0.08, rule: 0.20}]
      missions: [{id: EN-A1E-U3-M01, owner16: complete,
                   missing_structured: [difficulty_tiers, rubric_cells, variants, retry_policy_field]},
                 {id: MISSION-U8-L19, owner16: complete,
                   missing_structured: [difficulty_tiers, variants], flag: cp2_partD_exemption_vs_R13}]
    spanish:
      lessons:  [{id: ES-A1E-U1-L06, missing: [one_line_objective, grammar_targets, pron_targets,
                   can_do_refs, warmup]},
                 {id: es-10.6, missing: [ipa_on_vocab, cognate_status_column, can_do_refs,
                   micro_interaction_u7plus_rule, canonical_grammar_key]}]
      missions: [{id: ES-A1E-U3-M01, owner16: complete,
                   missing_structured: [scenes_array, tier, outcome_enum_correct, rubric_cells]},
                 {id: es-12.19, owner16: complete,
                   missing_structured: [difficulty_tiers, rubric_cells, variant_templates]}]
  defects:   # severity: C critical, J major, M moderate, N minor
    - {id: D1,  sev: C, files: [07, 08], fix: adopt_unified_schema_section_2}
    - {id: D2,  sev: J, files: [08], fix: reconcile_R12_ceilings_vs_unit_budgets_8_of_12_units}
    - {id: D3,  sev: J, files: [07, 08], fix: single_vocab_counting_policy_owner_decision}
    - {id: D4,  sev: J, files: [08], fix: contract_field_count_15_to_16_and_lint_V11}
    - {id: D5,  sev: J, files: [07], fix: passage_known_vocab_floor_70_vs_95}
    - {id: D6,  sev: M, files: [07, 08], fix: one_mission_outcome_enum}
    - {id: D7,  sev: M, files: [07, 08], fix: one_checkpoint_outcome_enum}
    - {id: D8,  sev: M, files: [07], fix: hours_range_claim_vs_owner_floor}
    - {id: D9,  sev: M, files: [08, 07], fix: dotted_keys_plus_aliases}
    - {id: D10, sev: M, files: [08], fix: cognate_status_to_translations_table}
    - {id: D11, sev: M, files: [07], fix: grammar_recycling_enforcement}
    - {id: D12, sev: N, files: [en_band_a1e, en_band_a2e], fix: sample_review_slot_share}
    - {id: D13, sev: N, files: [08], fix: ai_column_caption}
    - {id: D14, sev: N, files: [08], fix: review_lesson_count_and_chunk_sum}
    - {id: D15, sev: N, files: [07], fix: graduation_minutes_reconcile}
    - {id: D16, sev: N, files: [07, 08], fix: one_graduation_runtime_note}
    - {id: D17, sev: N, files: [en_band_a2e], fix: flag_held_R13_decision}
    - {id: D18, sev: N, files: [08], fix: rename_orthography_sensitivity}
    - {id: D19, sev: N, files: [07, en_band_a1e], fix: one_l1_contrast_slot_name}
    - {id: D20, sev: N, files: [07, 08], fix: thresholds_are_course_config}
    - {id: D21, sev: N, files: [08], fix: cp_coverage_u6_u9_owner_call}
    - {id: D22, sev: N, files: [07], fix: wpm_canonical_audio_speed}
```

---

*End of report. The unified schema in §2 is the single deliverable the platform should build
against; every defect above lists the file that must change and how. Nothing here requires
re-designing either course's pedagogy.*
