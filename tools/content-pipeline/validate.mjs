#!/usr/bin/env node
/**
 * Palavox content pipeline — deterministic validator (workstream 0.7a).
 *
 * Validates every lesson file in a unit directory against
 * content/schema/authoring-v0.1.schema.json + unit.schema.json, then runs the
 * DETERMINISTIC subset of the content gauntlet locally:
 *
 *   G-schema          shape (hand-rolled JSON Schema subset interpreter, no deps)
 *   G-schema-strict   every exercise.type is in the DB CHECK list, pinned here
 *                     independently of the authoring-schema enum (drift backstop)
 *   G-keys            per-type answer-key integrity (exactly one correct option
 *                     + rationale on it; tokens for ordering; pairs for matching;
 *                     keys for cloze; exercise-level rationale everywhere)
 *   G-key-coverage    coverage axis (complements G-keys' structural axis): every
 *                     machine-gradable item exposes >=1 accepted key / correct
 *                     option so it is answerable at all. Net-new catch vs G-keys:
 *                     translation items (which G-keys does not inspect)
 *   G-vocab-boundary  every content word in learner-visible text must be in the
 *                     unit's cumulative allowed-lemma set (new_vocabulary of
 *                     this + prior lessons + the function-word allowlist below)
 *   G-counts          6-14 exercises per lesson; unit vocab within budget
 *   G-difficulty      difficulty in [0,1]; first exercise <= last (warm-up ramp)
 *   G-l10n            l10n-completeness (slice policy): every new_vocabulary item
 *                     has a non-blank translation for each enabled L1 (es)
 *   G-a11y            every audio-bearing item (listening_mc/dictation/speaking or
 *                     any [audio ...] prompt) carries a written stand-in so it is
 *                     answerable without audio; a TODO_audio note is the accepted
 *                     0.7 fallback when the text cannot live inline
 *
 * The AI-/pipeline-judged gates are DECLARED but NOT run here (they need model or
 * voice-pipeline access and are [requires validation] for this slice): the seven
 * plan-06 §9 gates that are non-deterministic — G-audio (audio round-trip),
 * G-phoneme (phoneme-distance; deterministic in principle but needs a pronouncing
 * dictionary + a minimal_pair primitive that schema v0.1 lacks) and
 * G-rubric-stability — plus the existing contentGauntlet.ts gates (solver,
 * pedagogy, bias, level classifier, duplicate). The runner emits the full gate
 * matrix under summary.gate_declaration; see tools/content-pipeline/README.md.
 *
 * Usage: node tools/content-pipeline/validate.mjs <unit-dir> [--out report.json]
 * Exit codes: 0 all lessons pass · 1 failures · 2 usage/IO error.
 * Output (stdout): deterministic JSON report (no timestamps).
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";

/* ------------------------------------------------------------------ schemas */

const SCHEMA_DIR = new URL("../../content/schema/", import.meta.url);

export function loadLessonSchema() {
  return JSON.parse(readFileSync(new URL("authoring-v0.1.schema.json", SCHEMA_DIR), "utf8"));
}
export function loadUnitSchema() {
  return JSON.parse(readFileSync(new URL("unit.schema.json", SCHEMA_DIR), "utf8"));
}

/* ---------------------------------------------- JSON Schema subset checker */
/**
 * Hand-rolled interpreter for the subset of JSON Schema draft 2020-12 the two
 * authoring schemas actually use: type, enum, const, pattern, required,
 * properties, additionalProperties (boolean or schema), items, minItems,
 * maxItems, minimum, maximum, minLength, maxLength, $ref (local #/$defs only).
 * Anything else present in a schema is deliberately a hard error, so the
 * schema files cannot silently promise validation this interpreter skips.
 */
const SUPPORTED_KEYWORDS = new Set([
  "$schema", "$id", "$defs", "$ref", "title", "description",
  "type", "enum", "const", "pattern", "required", "properties",
  "additionalProperties", "items", "minItems", "maxItems",
  "minimum", "maximum", "minLength", "maxLength",
]);

function typeOf(v) {
  if (v === null) return "null";
  if (Array.isArray(v)) return "array";
  if (typeof v === "number") return Number.isInteger(v) ? "integer" : "number";
  return typeof v;
}

function resolveRef(ref, root) {
  if (!ref.startsWith("#/")) throw new Error(`unsupported $ref: ${ref}`);
  let node = root;
  for (const part of ref.slice(2).split("/")) {
    node = node?.[part];
    if (node === undefined) throw new Error(`unresolvable $ref: ${ref}`);
  }
  return node;
}

export function validateAgainstSchema(schema, data, root = schema, path = "$", errors = []) {
  for (const kw of Object.keys(schema)) {
    if (!SUPPORTED_KEYWORDS.has(kw)) {
      throw new Error(`schema keyword "${kw}" at ${path} is not supported by the hand-rolled validator`);
    }
  }
  if (schema.$ref) {
    return validateAgainstSchema(resolveRef(schema.$ref, root), data, root, path, errors);
  }
  const t = typeOf(data);
  if (schema.type) {
    const wanted = Array.isArray(schema.type) ? schema.type : [schema.type];
    const ok = wanted.some((w) => w === t || (w === "number" && t === "integer"));
    if (!ok) {
      errors.push(`${path}: expected ${wanted.join("|")}, got ${t}`);
      return errors; // nested keywords are meaningless on the wrong type
    }
  }
  if (schema.enum && !schema.enum.some((v) => v === data)) {
    errors.push(`${path}: value ${JSON.stringify(data)} not in enum [${schema.enum.join(", ")}]`);
  }
  if ("const" in schema && data !== schema.const) {
    errors.push(`${path}: must be ${JSON.stringify(schema.const)}`);
  }
  if (t === "string") {
    if (schema.minLength !== undefined && data.length < schema.minLength) {
      errors.push(`${path}: string shorter than minLength ${schema.minLength}`);
    }
    if (schema.maxLength !== undefined && data.length > schema.maxLength) {
      errors.push(`${path}: string longer than maxLength ${schema.maxLength}`);
    }
    if (schema.pattern && !new RegExp(schema.pattern).test(data)) {
      errors.push(`${path}: "${data}" does not match pattern ${schema.pattern}`);
    }
  }
  if (t === "integer" || t === "number") {
    if (schema.minimum !== undefined && data < schema.minimum) {
      errors.push(`${path}: ${data} < minimum ${schema.minimum}`);
    }
    if (schema.maximum !== undefined && data > schema.maximum) {
      errors.push(`${path}: ${data} > maximum ${schema.maximum}`);
    }
  }
  if (t === "array") {
    if (schema.minItems !== undefined && data.length < schema.minItems) {
      errors.push(`${path}: fewer than minItems ${schema.minItems}`);
    }
    if (schema.maxItems !== undefined && data.length > schema.maxItems) {
      errors.push(`${path}: more than maxItems ${schema.maxItems}`);
    }
    if (schema.items) {
      data.forEach((item, i) => validateAgainstSchema(schema.items, item, root, `${path}[${i}]`, errors));
    }
  }
  if (t === "object") {
    for (const req of schema.required ?? []) {
      if (!(req in data)) errors.push(`${path}: missing required property "${req}"`);
    }
    const props = schema.properties ?? {};
    for (const [k, v] of Object.entries(data)) {
      if (k in props) {
        validateAgainstSchema(props[k], v, root, `${path}.${k}`, errors);
      } else if (schema.additionalProperties === false) {
        errors.push(`${path}: unexpected property "${k}"`);
      } else if (schema.additionalProperties && typeof schema.additionalProperties === "object") {
        validateAgainstSchema(schema.additionalProperties, v, root, `${path}.${k}`, errors);
      }
    }
  }
  return errors;
}

/* -------------------------------------------------- function-word allowlist */
/**
 * Grammatical/function words only, curated honestly (~200): determiners,
 * pronouns, be/aux/modals, prepositions, conjunctions, question words,
 * negation, degree adverbs, and common contractions. Deliberately EXCLUDED
 * because they are taught content in this course: greetings (hello/hi/bye),
 * politeness items (please/thanks/sorry/okay), numbers, day/month names,
 * and all content nouns/verbs/adjectives.
 */
export const FUNCTION_WORDS = new Set((
  "a an the this that these those some any no every each all both few little many much more most other another same such " +
  "i you he she it we they me him her us them my your his its our their mine yours hers ours theirs " +
  "myself yourself himself herself itself ourselves yourselves themselves " +
  "who whom whose which what someone anyone everyone something anything everything nothing " +
  "am is are was were be been being do does did done have has had having " +
  "can could will would shall should may might must " +
  "not never yes " +
  "about above across after against along around at before behind below beside between by down during " +
  "for from in inside into near next of off on out outside over past since through to under until up with without " +
  "and but or so because if when while than as though although unless " +
  "how why where here there now then very too also just only again still yet even really " +
  "i'm you're he's she's it's we're they're what's where's who's that's there's how's where're let's " +
  "don't doesn't didn't isn't aren't wasn't weren't can't couldn't won't wouldn't shouldn't mustn't"
).split(/\s+/).filter(Boolean));

/* ------------------------------------------------------------ tokenization */

/** Strip [L1: ...] / [audio ...] stage directions and {slot} placeholders. */
export function stripNonLearnerText(text) {
  return String(text).replace(/\[[^\]]*\]/g, " ").replace(/\{[^}]*\}/g, " ");
}

/** Cheap morphology so "books"/"walking"/"cities" resolve to a known lemma. */
export function lemmaCandidates(word) {
  const forms = [word];
  const rules = [["ies", "y"], ["es", ""], ["s", ""], ["ing", ""], ["ed", ""], ["ed", "e"], ["ing", "e"]];
  for (const [suffix, stripped] of rules) {
    if (word.length > suffix.length + 2 && word.endsWith(suffix)) {
      forms.push(word.slice(0, -suffix.length) + stripped);
    }
  }
  return forms;
}

/**
 * Tokenize learner-visible text, keeping original-case tokens so proper nouns
 * can be detected. Returns [{ raw, lower, sentenceStart }].
 */
export function tokenizeWithCase(text) {
  const cleaned = stripNonLearnerText(text);
  const out = [];
  const re = /[A-Za-z][A-Za-z']*/g;
  let m;
  let prevEnd = -1;
  while ((m = re.exec(cleaned)) !== null) {
    const before = cleaned.slice(prevEnd < 0 ? 0 : prevEnd, m.index);
    // Any sentence/segment punctuation in the inter-token gap starts a new
    // segment (·, → and newline separate list items/option labels), so a
    // capitalized token there is NOT treated as a proper noun.
    const sentenceStart = prevEnd < 0 || /[.!?:…→·\n]/.test(before);
    const raw = m[0].replace(/^'+|'+$/g, "");
    if (raw.length > 1) out.push({ raw, lower: raw.toLowerCase(), sentenceStart });
    prevEnd = m.index + m[0].length;
  }
  return out;
}

/** All lemma tokens contributed by a vocab lemma (chunks contribute each word). */
export function lemmaTokens(lemma) {
  return (String(lemma).toLowerCase().match(/[a-z][a-z']*/g) ?? []).map((w) => w.replace(/^'+|'+$/g, ""));
}

/* ------------------------------------------------------------------- gates */

const gate = (pass, detail, extra = {}) => ({ pass, detail, ...extra });

/** Learner-visible strings of one exercise (what G-vocab-boundary scans). */
export function learnerVisibleText(ex) {
  const parts = [ex.prompt];
  for (const o of ex.options ?? []) parts.push(o.label);
  for (const t of ex.tokens ?? []) parts.push(t);
  if (ex.key) parts.push(ex.key);
  for (const k of ex.keys ?? []) parts.push(k);
  for (const p of ex.pairs ?? []) { parts.push(p.left, p.right); }
  for (const d of ex.distractor_bank ?? []) parts.push(d);
  if (ex.expected_pattern) parts.push(ex.expected_pattern);
  return parts.filter(Boolean).join("\n");
}

const CHOICE_TYPES = new Set(["listening_mc"]);

/**
 * Canonical exercise types, pinned to the public.exercises.type CHECK constraint
 * (supabase/migrations/20260729164446_*.sql). G-schema-strict fails any type not
 * in this set. It is deliberately a SEPARATE source of truth from the authoring
 * schema's `type` enum: if the schema enum is ever loosened, a value the DB would
 * reject at INSERT time is still caught here before it reaches seed generation.
 * tests/server-pure/contentPipeline.test.ts pins this set to the migration text.
 */
export const DB_EXERCISE_TYPES = new Set([
  "flashcard", "cloze", "matching", "ordering", "dictation",
  "listening_mc", "speaking", "translation", "dialogue",
]);

/** Types graded without a static accept-list (reveal / ASR / AI) — G-key-coverage exempts them. */
const KEY_EXEMPT_TYPES = new Set(["flashcard", "speaking", "dialogue"]);

/** Enabled L1 locales for the slice (doc 13 registry is future work). */
export const ENABLED_L1_LOCALES = ["es"];

export function gateKeys(lesson) {
  const errors = [];
  const warnings = [];
  (lesson.exercises ?? []).forEach((ex, i) => {
    const at = `exercise[${i}] (${ex.type})`;
    if (ex.seq !== undefined && ex.seq !== i + 1) {
      errors.push(`${at}: seq ${ex.seq} != position ${i + 1}`);
    }
    if (!ex.rationale) {
      errors.push(`${at}: missing exercise-level rationale (no filler items — every exercise must state its pedagogical purpose)`);
    }
    if (CHOICE_TYPES.has(ex.type) && !(ex.options?.length >= 2)) {
      errors.push(`${at}: choice type requires options[] (>=2)`);
    }
    if (ex.options?.length) {
      const correct = ex.options.filter((o) => o.is_correct === true);
      if (correct.length !== 1) {
        errors.push(`${at}: has ${correct.length} correct options, expected exactly 1`);
      }
      if (correct.length === 1 && !correct[0].rationale) {
        errors.push(`${at}: correct option "${correct[0].label}" has no rationale`);
      }
      ex.options.filter((o) => !o.is_correct && !o.rationale).forEach((o) => {
        warnings.push(`${at}: distractor "${o.label}" has no rationale (recommended by schema v0.1 lint)`);
      });
    }
    if (ex.type === "ordering") {
      if (!(ex.tokens?.length >= 2)) errors.push(`${at}: ordering requires tokens[] (>=2)`);
      if (!ex.key) errors.push(`${at}: ordering requires key (the correct sentence)`);
      if (ex.tokens?.length >= 2 && ex.key) {
        const keyWords = (ex.key.toLowerCase().match(/[a-z'’]+/g) ?? []).sort().join(" ");
        const tokWords = ex.tokens.flatMap((t) => t.toLowerCase().match(/[a-z'’]+/g) ?? []).sort().join(" ");
        if (keyWords !== tokWords) errors.push(`${at}: tokens do not re-assemble into key`);
      }
    }
    if (ex.type === "matching" && !(ex.pairs?.length >= 2)) {
      errors.push(`${at}: matching requires pairs[] (>=2)`);
    }
    if (ex.type === "cloze") {
      if (!(ex.keys?.length >= 1)) errors.push(`${at}: cloze requires keys[]`);
      const blanks = (ex.prompt.match(/_{2,}/g) ?? []).length;
      if (ex.keys?.length && blanks !== ex.keys.length) {
        errors.push(`${at}: ${blanks} blank(s) in prompt but ${ex.keys.length} key(s)`);
      }
    }
    if (ex.type === "dictation" && !ex.key) {
      errors.push(`${at}: dictation requires key (the transcript)`);
    }
  });
  return gate(errors.length === 0, errors.length ? errors.join("; ") : "all answer keys structurally sound", { errors, warnings });
}

export function gateVocabBoundary(lesson, allowedLemmas) {
  const violations = [];
  const properNounsSeen = new Set();
  const known = (w) => FUNCTION_WORDS.has(w) || lemmaCandidates(w).some((f) => allowedLemmas.has(f));
  (lesson.exercises ?? []).forEach((ex, i) => {
    for (const tok of tokenizeWithCase(learnerVisibleText(ex))) {
      if (known(tok.lower)) continue;
      if (/^[A-Z][a-z]+$/.test(tok.raw) && !tok.sentenceStart) {
        properNounsSeen.add(tok.raw); // proper-noun exemption (names) — reported, not failed
        continue;
      }
      violations.push({ exercise: i, type: ex.type, word: tok.lower });
    }
  });
  const unresolvedRefs = (lesson.vocabulary_refs ?? []).filter(
    (ref) => !lemmaTokens(ref).every((t) => FUNCTION_WORDS.has(t) || allowedLemmas.has(t)),
  );
  const warnings = [];
  if (properNounsSeen.size) warnings.push(`assumed proper nouns (exempt): ${[...properNounsSeen].sort().join(", ")}`);
  if (unresolvedRefs.length) warnings.push(`vocabulary_refs not taught earlier in unit: ${unresolvedRefs.join(", ")}`);
  return gate(
    violations.length === 0,
    violations.length
      ? `${violations.length} out-of-boundary word(s): ${violations.map((v) => `"${v.word}"@ex${v.exercise}`).join(", ")}`
      : "all content words inside cumulative taught set",
    { violations, warnings },
  );
}

export function gateCounts(lesson) {
  const n = lesson.exercises?.length ?? 0;
  const errors = [];
  if (n < 6 || n > 14) errors.push(`${n} exercises (must be 6-14)`);
  const warnings = [];
  if (lesson.est_minutes !== undefined && (lesson.est_minutes < 8 || lesson.est_minutes > 18)) {
    warnings.push(`est_minutes ${lesson.est_minutes} outside band target 8-18`);
  }
  return gate(errors.length === 0, errors.length ? errors.join("; ") : `${n} exercises in range`, { errors, warnings });
}

export function gateDifficulty(lesson) {
  const ds = (lesson.exercises ?? []).map((e) => e.difficulty);
  const errors = [];
  ds.forEach((d, i) => {
    if (typeof d !== "number" || d < 0 || d > 1) errors.push(`exercise[${i}]: difficulty ${d} outside [0,1]`);
  });
  if (ds.length >= 2 && typeof ds[0] === "number" && typeof ds[ds.length - 1] === "number" && ds[0] > ds[ds.length - 1]) {
    errors.push(`first difficulty ${ds[0]} > last ${ds[ds.length - 1]} (warm-up must not start harder than it ends)`);
  }
  return gate(errors.length === 0, errors.length ? errors.join("; ") : "difficulties in range, warm-up ramp ok", { errors });
}

/**
 * G-schema-strict — every exercise.type is one the DB CHECK will accept. Runs as
 * a backstop independent of the authoring-schema enum (see DB_EXERCISE_TYPES).
 */
export function gateSchemaStrict(lesson) {
  const errors = [];
  (lesson.exercises ?? []).forEach((ex, i) => {
    if (!DB_EXERCISE_TYPES.has(ex.type)) {
      errors.push(`exercise[${i}]: type ${JSON.stringify(ex.type)} not in DB CHECK list [${[...DB_EXERCISE_TYPES].join(", ")}]`);
    }
  });
  return gate(errors.length === 0, errors.length ? errors.join("; ") : "all exercise types are DB-CHECK-valid", { errors });
}

/**
 * G-key-coverage — the COVERAGE axis (G-keys owns the structural axis: exactly-one
 * correct, rationale, token re-assembly, blank/key parity). This gate asks only
 * "is the answer space covered so the item is gradable at all?": choice items need
 * >=1 correct option; constructed items (cloze/ordering/dictation/translation) and
 * matching need >=1 accepted key/pair. Its net-new catch over G-keys is the
 * translation type, which G-keys never inspects — an under-specified translation
 * accept-list (plan 06 R2) would otherwise ship silently. Reveal/ASR/AI-graded
 * types (flashcard/speaking/dialogue) are declared exempt, not silently skipped.
 */
export function gateKeyCoverage(lesson) {
  const errors = [];
  const exempt = [];
  (lesson.exercises ?? []).forEach((ex, i) => {
    const at = `exercise[${i}] (${ex.type})`;
    if (KEY_EXEMPT_TYPES.has(ex.type)) { exempt.push(i); return; }
    const hasKeyString = typeof ex.key === "string" && ex.key.trim().length > 0;
    const hasKeyList = Array.isArray(ex.keys) && ex.keys.length >= 1;
    switch (ex.type) {
      case "listening_mc": {
        const correct = (ex.options ?? []).filter((o) => o.is_correct === true).length;
        if (correct < 1) errors.push(`${at}: 0 correct options — answer space uncovered, choice item ungradable`);
        break;
      }
      case "matching":
        if (!(ex.pairs?.length >= 1)) errors.push(`${at}: no pairs — matching key uncovered`);
        break;
      case "cloze":
        if (!hasKeyList) errors.push(`${at}: no accepted answer key (keys[] empty) — cloze ungradable`);
        break;
      case "translation":
        if (!hasKeyString && !hasKeyList) errors.push(`${at}: no accepted answer key (key/keys) — translation ungradable`);
        break;
      case "ordering":
      case "dictation":
        if (!hasKeyString) errors.push(`${at}: no accepted answer key (key) — ${ex.type} ungradable`);
        break;
      default:
        break; // unknown/other types are G-schema-strict's job, not coverage's
    }
  });
  return gate(
    errors.length === 0,
    errors.length ? errors.join("; ") : "every gradable item exposes >=1 accepted key / correct option",
    { errors, exempt_exercises: exempt },
  );
}

/**
 * G-l10n — l10n-completeness for the slice's enabled L1s. Slice policy (task 2.4):
 * every new_vocabulary item carries a non-blank translation for each enabled
 * locale (es today). Stronger than the schema's `required: ["es"]` + minLength 1,
 * which a single whitespace char would satisfy; here the value is trimmed. The
 * full plan-06 §9 G-l10n (instruction keys + every l1_dependent_field across every
 * enabled locale) is broader and lands with the doc-13 locale registry.
 */
export function gateL10n(lesson, enabledLocales = ENABLED_L1_LOCALES) {
  const items = lesson.new_vocabulary ?? [];
  const missing = [];
  items.forEach((v, i) => {
    for (const loc of enabledLocales) {
      const t = v?.translations?.[loc];
      if (typeof t !== "string" || t.trim().length === 0) missing.push({ index: i, lemma: v?.lemma ?? null, locale: loc });
    }
  });
  const missingIdx = new Set(missing.map((m) => m.index));
  return gate(
    missing.length === 0,
    missing.length
      ? `${missing.length} missing/blank L1 translation(s): ${missing.map((m) => `"${m.lemma}"(${m.locale})`).join(", ")}`
      : `all ${items.length} new_vocabulary item(s) translated for [${enabledLocales.join(", ")}]`,
    { missing, locales: enabledLocales, items_total: items.length, items_covered: items.length - missingIdx.size },
  );
}

/**
 * True when a learner-readable character survives [..] / {..} stripping. Uses a raw
 * alnum test (not tokenizeWithCase, which drops 1-char tokens) so a spelled/letter
 * transcript like 'E' or 'H-E-L-L-O' correctly counts as a written stand-in.
 */
function hasReadableStandIn(text) {
  return /[A-Za-z0-9]/.test(stripNonLearnerText(text ?? ""));
}

/** Whether a TODO_audio note documents the audio need for a given exercise seq. */
export function todoAudioCoversSeq(notes, seq) {
  const n = String(notes ?? "");
  if (!/TODO_audio/i.test(n)) return false;
  if (/every exercise/i.test(n)) return true;
  if (seq == null) return false;
  // "ex5" / "ex 5" / "exercise 5" / "exercises 5" (glued or spaced single reference)
  if (new RegExp(`\\bex(?:ercise)?s?\\s*${seq}\\b`, "i").test(n)) return true;
  // "exercises 2, 3, 5, 7" (enumerated list, up to the sentence end)
  return new RegExp(`\\bexercises?\\b[^.]*?\\b${seq}\\b`, "i").test(n);
}

/**
 * G-a11y — every item that presents audio is answerable without hearing it. An
 * item is audio-bearing when its prompt carries an [audio ...] marker (the authored
 * signal that a recording plays); a listening/speaking item with no marker presents
 * no stimulus audio and is answerable from its readable prompt/options by construction.
 * It passes when a written stand-in exists inline — a readable char left in the prompt
 * after stage directions are stripped (the quoted transcript, per the 0.7 convention)
 * or in a readable expected_pattern. When no inline stand-in exists, a TODO_audio note
 * that names the exercise is the accepted 0.7 fallback (asset pending) and downgrades
 * the miss to a warning; an audio item with neither is a hard fail. (Plan-06 §9
 * image-alt-text is N/A: the v0.1 schema has no image field — see README.)
 */
export function gateA11y(lesson) {
  const errors = [];
  const deferred = [];
  const notes = lesson.notes;
  (lesson.exercises ?? []).forEach((ex, i) => {
    const isAudio = /\[audio/i.test(String(ex.prompt ?? ""));
    if (!isAudio) return;
    const standIn = hasReadableStandIn(ex.prompt) ||
      (typeof ex.expected_pattern === "string" && hasReadableStandIn(ex.expected_pattern));
    if (standIn) return;
    if (todoAudioCoversSeq(notes, ex.seq ?? i + 1)) { deferred.push(i); return; }
    errors.push(`exercise[${i}] (${ex.type}): audio item has no written stand-in (no readable prompt/pattern text) and no TODO_audio note — unanswerable without audio`);
  });
  const warnings = deferred.length
    ? [`${deferred.length} audio item(s) rely on a TODO_audio note for their stand-in (assets not yet produced): ex ${deferred.map((i) => i + 1).join(", ")}`]
    : [];
  return gate(errors.length === 0, errors.length ? errors.join("; ") : "every audio item is answerable without audio", { errors, warnings, audio_deferred: deferred });
}

/* ------------------------------------------------------- gate declaration */
/**
 * The full gate matrix (plan 06 §9 / E7). `deterministic` gates run in this file;
 * `declared` gates are DECLARED here but need model / voice-pipeline / DB access
 * and carry state [requires validation] until staging exists (see README).
 */
export const GATE_DECLARATION = {
  deterministic: [
    "G-schema", "G-schema-strict", "G-keys", "G-key-coverage",
    "G-vocab-boundary", "G-counts", "G-difficulty", "G-l10n", "G-a11y",
  ],
  declared: {
    "G-audio": "audio round-trip: TTS render -> STT -> normalized match >=0.9 + asset transcript present. Needs the doc-11 voice pipeline. [requires validation]",
    "G-phoneme": "phoneme-distance: minimal pairs differ by exactly one phoneme via a pronouncing dictionary. Deterministic in principle but has no runnable items (schema v0.1 has no minimal_pair primitive) and no bundled dictionary (no new deps). [requires validation]",
    "G-rubric-stability": "Tier-2 judge ranks 6 seeded answers (2 good/2 borderline/2 bad) monotonically, 3x, variance-banded. Needs model access. [requires validation]",
    "solver": "contentGauntlet.ts: blind LLM solver must reach the keyed answer. [requires validation]",
    "pedagogy": "contentGauntlet.ts: rubric /20 judge. [requires validation]",
    "bias": "contentGauntlet.ts: cultural-sensitivity screen. [requires validation]",
    "level": "contentGauntlet.ts: CEFR classifier vs target band. [requires validation]",
    "duplicate": "contentGauntlet.ts: embedding cosine <0.92; needs DB/embeddings. [requires validation]",
  },
};

/* -------------------------------------------------------------- unit runner */

export function validateUnit(manifest, lessonsByFile) {
  const unitErrors = validateAgainstSchema(loadUnitSchema(), manifest);
  const ratioSum = manifest.band_ratios
    ? manifest.band_ratios.structured + manifest.band_ratios.guided + manifest.band_ratios.open
    : NaN;
  if (Number.isFinite(ratioSum) && Math.abs(ratioSum - 1) > 0.01) {
    unitErrors.push(`$.band_ratios: sum ${ratioSum.toFixed(2)} != 1.0`);
  }

  const lessonSchema = loadLessonSchema();
  const allowedLemmas = new Set();
  const seenLemmas = new Map(); // lemma -> lesson id (duplicate detection)
  const lessons = [];
  let totalVocab = 0;

  (manifest.lessons ?? []).forEach((file, idx) => {
    const lesson = lessonsByFile[file];
    if (!lesson) {
      lessons.push({ file, id: null, pass: false, gates: { "G-schema": gate(false, "lesson file missing or unparseable") } });
      return;
    }
    const schemaErrors = validateAgainstSchema(lessonSchema, lesson);
    if (lesson.position !== undefined && lesson.position !== idx + 1) {
      schemaErrors.push(`$.position: ${lesson.position} != manifest order ${idx + 1}`);
    }
    if (typeof lesson.id === "string" && !lesson.id.startsWith(manifest.id + "-")) {
      schemaErrors.push(`$.id: ${lesson.id} does not belong to unit ${manifest.id}`);
    }
    const gates = {
      "G-schema": gate(schemaErrors.length === 0, schemaErrors.length ? schemaErrors.join("; ") : "conforms to authoring-v0.1", { errors: schemaErrors }),
      // Runs even when G-schema fails: a true drift backstop against the DB CHECK.
      "G-schema-strict": gateSchemaStrict(lesson),
    };
    if (schemaErrors.length === 0) {
      // current lesson's own new vocabulary is allowed within the lesson
      for (const v of lesson.new_vocabulary ?? []) {
        const lemmaKey = v.lemma.toLowerCase();
        if (seenLemmas.has(lemmaKey) && seenLemmas.get(lemmaKey) !== lesson.id) {
          (gates["G-schema"].warnings ??= []).push(`lemma "${v.lemma}" already introduced in ${seenLemmas.get(lemmaKey)}`);
        } else {
          seenLemmas.set(lemmaKey, lesson.id);
        }
        allowedLemmas.add(lemmaKey);
        for (const t of lemmaTokens(v.lemma)) allowedLemmas.add(t);
        totalVocab += 1;
      }
      gates["G-keys"] = gateKeys(lesson);
      gates["G-key-coverage"] = gateKeyCoverage(lesson);
      gates["G-vocab-boundary"] = gateVocabBoundary(lesson, allowedLemmas);
      gates["G-counts"] = gateCounts(lesson);
      gates["G-difficulty"] = gateDifficulty(lesson);
      gates["G-l10n"] = gateL10n(lesson);
      gates["G-a11y"] = gateA11y(lesson);
    }
    lessons.push({
      file,
      id: lesson.id ?? null,
      pass: Object.values(gates).every((g) => g.pass),
      gates,
    });
  });

  if (typeof manifest.vocab_budget === "number" && totalVocab > manifest.vocab_budget) {
    unitErrors.push(`$.vocab_budget: unit introduces ${totalVocab} items, budget is ${manifest.vocab_budget}`);
  }

  const passed = lessons.filter((l) => l.pass).length;
  const gateStats = {};
  for (const l of lessons) {
    for (const [name, g] of Object.entries(l.gates)) {
      gateStats[name] ??= { passed: 0, failed: 0 };
      gateStats[name][g.pass ? "passed" : "failed"] += 1;
    }
  }
  return {
    schema_version: "authoring-v0.1",
    unit: manifest.id ?? null,
    unit_manifest_errors: unitErrors,
    unit_pass: unitErrors.length === 0 && passed === lessons.length && lessons.length > 0,
    lessons,
    summary: {
      lessons_total: lessons.length,
      lessons_passed: passed,
      pass_rate: lessons.length ? Number((passed / lessons.length).toFixed(3)) : 0,
      total_new_vocabulary: totalVocab,
      vocab_budget: manifest.vocab_budget ?? null,
      gates: gateStats,
      gate_declaration: GATE_DECLARATION,
    },
  };
}

export function loadUnitDir(unitDir) {
  const manifestPath = join(unitDir, "unit.json");
  if (!existsSync(manifestPath)) throw new Error(`no unit.json in ${unitDir}`);
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const lessonsByFile = {};
  for (const file of manifest.lessons ?? []) {
    const p = join(unitDir, file);
    if (existsSync(p)) {
      try {
        lessonsByFile[file] = JSON.parse(readFileSync(p, "utf8"));
      } catch {
        /* unparseable file -> reported as missing by validateUnit */
      }
    }
  }
  return { manifest, lessonsByFile };
}

/* --------------------------------------------------------------------- CLI */

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf("--out");
  const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
  const unitDir = args.filter((a, i) => a !== "--out" && (outIdx < 0 || i !== outIdx + 1))[0];
  if (!unitDir) {
    console.error("usage: node tools/content-pipeline/validate.mjs <unit-dir> [--out report.json]");
    process.exit(2);
  }
  let report;
  try {
    const { manifest, lessonsByFile } = loadUnitDir(unitDir);
    report = validateUnit(manifest, lessonsByFile);
  } catch (e) {
    console.error(`error: ${e.message}`);
    process.exit(2);
  }
  const json = JSON.stringify(report, null, 2);
  console.log(json);
  if (outFile) writeFileSync(outFile, json + "\n");
  process.exit(report.unit_pass ? 0 : 1);
}
