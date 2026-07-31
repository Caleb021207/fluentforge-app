#!/usr/bin/env node
/**
 * Palavox content pipeline — deterministic validator (workstream 0.7a).
 *
 * Validates every lesson file in a unit directory against
 * content/schema/authoring-v0.1.schema.json + unit.schema.json, then runs the
 * DETERMINISTIC subset of the content gauntlet locally:
 *
 *   G-schema          shape (hand-rolled JSON Schema subset interpreter, no deps)
 *   G-keys            per-type answer-key integrity (exactly one correct option
 *                     + rationale on it; tokens for ordering; pairs for matching;
 *                     keys for cloze; exercise-level rationale everywhere)
 *   G-vocab-boundary  every content word in learner-visible text must be in the
 *                     unit's cumulative allowed-lemma set (new_vocabulary of
 *                     this + prior lessons + the function-word allowlist below)
 *   G-counts          6-14 exercises per lesson; unit vocab within budget
 *   G-difficulty      difficulty in [0,1]; first exercise <= last (warm-up ramp)
 *
 * The AI-judged gates in supabase/functions/_shared/contentGauntlet.ts
 * (solver, pedagogy judge, bias screen, level classifier) are NOT run here —
 * they require model calls and are [requires validation] for this slice.
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
      gates["G-vocab-boundary"] = gateVocabBoundary(lesson, allowedLemmas);
      gates["G-counts"] = gateCounts(lesson);
      gates["G-difficulty"] = gateDifficulty(lesson);
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
      ai_judged_gates: "solver/pedagogy/bias/level-classifier NOT run here — requires validation via contentGauntlet.ts",
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
