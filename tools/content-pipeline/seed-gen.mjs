#!/usr/bin/env node
/**
 * Palavox content pipeline — seed SQL generator (workstream 0.7a).
 *
 * Converts one validated unit directory into ONE idempotent SQL file.
 * PREPARED FILES ONLY — this tool never touches a database.
 *
 * Determinism: every row id is an md5-based UUID (uuid_generate_v5-style,
 * version nibble forced to 3, RFC 4122 variant) computed from a stable
 * natural key, so re-running on the same input yields byte-identical SQL and
 * applying twice inserts nothing new (ON CONFLICT DO NOTHING).
 *
 * Safety: every row is status='draft'. RLS on the content tables exposes only
 * status='operational' to learners/teachers, so even if this file were
 * applied, nothing becomes learner-visible.
 *
 * Usage: node tools/content-pipeline/seed-gen.mjs <unit-dir> [--out file.sql]
 *   default out: content/seed/<unit-lowercase>-seed.sql (e.g. u01-seed.sql)
 */

import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { loadUnitDir } from "./validate.mjs";

/* -------------------------------------------------------- deterministic ids */

const NAMESPACE = "palavox-content-v0.1";

/** md5(namespace:key) formatted as a version-3, RFC-4122-variant UUID. */
export function uuidFromKey(key) {
  const h = createHash("md5").update(`${NAMESPACE}:${key}`).digest("hex");
  const timeHi = ((parseInt(h.slice(12, 16), 16) & 0x0fff) | 0x3000).toString(16).padStart(4, "0");
  const clockSeq = ((parseInt(h.slice(16, 20), 16) & 0x3fff) | 0x8000).toString(16).padStart(4, "0");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${timeHi}-${clockSeq}-${h.slice(20, 32)}`;
}

/* ------------------------------------------------------------ SQL helpers */

export function sqlString(v) {
  if (v === null || v === undefined) return "NULL";
  return `'${String(v).replace(/'/g, "''")}'`;
}

const sqlNum = (v) => (v === null || v === undefined ? "NULL" : String(v));

function insert(table, columns, rows) {
  if (!rows.length) return "";
  const lines = rows.map((r) => `  (${columns.map((c) => r[c]).join(", ")})`);
  return (
    `INSERT INTO public.${table} (${columns.join(", ")}) VALUES\n` +
    lines.join(",\n") +
    "\nON CONFLICT DO NOTHING;\n"
  );
}

/* -------------------------------------------------------------- generation */

const SKILL_ORDER = ["vocab", "grammar", "reading", "listening", "speaking", "writing"];

/**
 * Build the full seed SQL from a parsed manifest + lessons map.
 * Pure function of its inputs — same input, same string.
 */
export function generateSeedSql(manifest, lessonsByFile) {
  const unitKey = manifest.id; // e.g. EN-U01
  const courseKey = manifest.course.course_key;
  const courseId = uuidFromKey(`course:${courseKey}`);
  const unitId = uuidFromKey(`unit:${unitKey}`);

  const lessonsInOrder = manifest.lessons
    .map((file) => lessonsByFile[file])
    .filter(Boolean);
  if (lessonsInOrder.length !== manifest.lessons.length) {
    throw new Error("seed-gen refuses to run with missing/unparseable lesson files — run validate.mjs first");
  }

  // one skill row per skill_type actually used, in canonical order
  const usedSkillTypes = SKILL_ORDER.filter((t) => lessonsInOrder.some((l) => l.skill_type === t));
  const skillIdFor = (t) => uuidFromKey(`skill:${unitKey}:${t}`);

  const skillRows = usedSkillTypes.map((t, i) => ({
    id: sqlString(skillIdFor(t)),
    unit_id: sqlString(unitId),
    position: sqlNum(i + 1),
    title: sqlString(`${manifest.title} — ${t}`),
    type: sqlString(t),
    status: sqlString("draft"),
  }));

  const lessonRows = [];
  const exerciseRows = [];
  const optionRows = [];
  const vocabRows = [];
  const vocabSeen = new Map(); // lemma(lower) -> uuid
  const vocabMapRows = [];
  let mappedRPCount = 0;

  lessonsInOrder.forEach((lesson, li) => {
    const lessonId = uuidFromKey(`lesson:${lesson.id}`);
    lessonRows.push({
      id: sqlString(lessonId),
      skill_id: sqlString(skillIdFor(lesson.skill_type)),
      position: sqlNum(li + 1),
      title: sqlString(lesson.title),
      intro_md: sqlString(lesson.intro_md),
      status: sqlString("draft"),
    });

    (lesson.new_vocabulary ?? []).forEach((v) => {
      const lemmaKey = v.lemma.toLowerCase();
      let vocabId = vocabSeen.get(lemmaKey);
      if (!vocabId) {
        vocabId = uuidFromKey(`vocab:en:${lemmaKey}`);
        vocabSeen.set(lemmaKey, vocabId);
        vocabRows.push({
          id: sqlString(vocabId),
          language: sqlString("en"),
          lemma: sqlString(v.lemma),
          // TODO(plan 13): translation_l1 holds ONLY translations.es today.
          // Full per-L1 coverage needs the proposed vocabulary_translations
          // table (wip-07-08-consistency-report.md §2); other L1 translations
          // in the authoring files are intentionally NOT seeded here.
          translation_l1: sqlString(v.translations?.es ?? null),
          part_of_speech: sqlString(v.pos),
          frequency_rank: sqlNum(v.frequency_rank ?? null),
          cefr_level: sqlString(v.cefr_level),
          example_sentence: sqlString(v.example_sentence),
          ipa: sqlString(v.ipa ?? null),
        });
      }
      vocabMapRows.push({ vocabulary_id: sqlString(vocabId), lesson_id: sqlString(lessonId) });
    });

    (lesson.exercises ?? []).forEach((ex, ei) => {
      const exKey = `exercise:${lesson.id}:${ei + 1}`;
      const exId = uuidFromKey(exKey);
      // DB CHECK allows only receptive|productive; authoring-level
      // receptive_to_productive collapses to 'productive' (the terminal card
      // direction). TODO(plan 06/13): extend the DB CHECK to carry the
      // three-state value losslessly.
      const rp = ex.receptive_productive === "receptive_to_productive" ? "productive" : ex.receptive_productive;
      if (rp !== ex.receptive_productive) mappedRPCount += 1;
      exerciseRows.push({
        id: sqlString(exId),
        lesson_id: sqlString(lessonId),
        position: sqlNum(ei + 1),
        type: sqlString(ex.type),
        prompt: sqlString(ex.prompt),
        difficulty: sqlNum(ex.difficulty),
        receptive_productive: sqlString(rp),
        source_model: sqlString("human-authored/phase0-slice"),
        status: sqlString("draft"),
      });
      (ex.options ?? []).forEach((opt, oi) => {
        optionRows.push({
          id: sqlString(uuidFromKey(`option:${lesson.id}:${ei + 1}:${oi + 1}`)),
          exercise_id: sqlString(exId),
          label: sqlString(opt.label),
          is_correct: opt.is_correct ? "true" : "false",
          position: sqlNum(oi + 1),
          rationale: sqlString(opt.rationale ?? null),
        });
      });
    });

    // vocabulary_refs that resolve to unit vocab also join the lesson map
    (lesson.vocabulary_refs ?? []).forEach((ref) => {
      const vocabId = vocabSeen.get(ref.toLowerCase());
      if (vocabId) vocabMapRows.push({ vocabulary_id: sqlString(vocabId), lesson_id: sqlString(lessonId) });
    });
  });

  const header = `-- ============================================================
-- PREPARED, NOT APPLIED — do not run without owner approval.
-- Palavox Phase 0 content slice seed for unit ${unitKey}
-- Generated by tools/content-pipeline/seed-gen.mjs (schema authoring-v0.1)
-- from the authoring files under content/units/en/${unitKey.slice(3).toLowerCase()}/.
--
-- Idempotent: all ids are deterministic md5-based UUIDs (uuid v3 style,
-- namespace "${NAMESPACE}") + ON CONFLICT DO NOTHING.
-- Safe-by-status: every row is status='draft'; content RLS exposes only
-- rows whose status is operational, so applying this file publishes nothing.
--
-- TODO(plan 13 / consistency report §2): vocabulary.translation_l1 receives
-- ONLY the Spanish ('es') translation; the multi-L1 translations authored in
-- new_vocabulary[].translations await the vocabulary_translations table.
${mappedRPCount ? `-- NOTE: ${mappedRPCount} exercise(s) authored as receptive_to_productive were\n-- collapsed to 'productive' to satisfy the exercises CHECK constraint.\n` : ""}-- ============================================================

BEGIN;

`;

  const parts = [
    insert("courses", ["id", "language", "target_framework", "level_band", "title", "description", "status"], [{
      id: sqlString(courseId),
      language: sqlString(manifest.course.language),
      target_framework: sqlString(manifest.course.target_framework),
      level_band: sqlString(manifest.course.level_band),
      title: sqlString(manifest.course.title),
      description: sqlString(manifest.course.description ?? null),
      status: sqlString("draft"),
    }]),
    insert("units", ["id", "course_id", "position", "title", "theme", "can_do_statement", "cefr_level", "status"], [{
      id: sqlString(unitId),
      course_id: sqlString(courseId),
      position: sqlNum(manifest.position),
      title: sqlString(manifest.title),
      theme: sqlString(manifest.theme ?? null),
      can_do_statement: sqlString(manifest.can_do_statement),
      cefr_level: sqlString(manifest.cefr_level),
      status: sqlString("draft"),
    }]),
    insert("skills", ["id", "unit_id", "position", "title", "type", "status"], skillRows),
    insert("lessons", ["id", "skill_id", "position", "title", "intro_md", "status"], lessonRows),
    insert("exercises", ["id", "lesson_id", "position", "type", "prompt", "difficulty", "receptive_productive", "source_model", "status"], exerciseRows),
    insert("exercise_options", ["id", "exercise_id", "label", "is_correct", "position", "rationale"], optionRows),
    insert("vocabulary", ["id", "language", "lemma", "translation_l1", "part_of_speech", "frequency_rank", "cefr_level", "example_sentence", "ipa"], vocabRows),
    insert("vocab_lesson_map", ["vocabulary_id", "lesson_id"], dedupeRows(vocabMapRows)),
  ].filter(Boolean);

  return header + parts.join("\n") + "\nCOMMIT;\n";
}

function dedupeRows(rows) {
  const seen = new Set();
  return rows.filter((r) => {
    const k = `${r.vocabulary_id}|${r.lesson_id}`;
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/* --------------------------------------------------------------------- CLI */

const isMain = process.argv[1] && import.meta.url === new URL(`file://${process.argv[1]}`).href;
if (isMain) {
  const args = process.argv.slice(2);
  const outIdx = args.indexOf("--out");
  const outFile = outIdx >= 0 ? args[outIdx + 1] : null;
  const unitDir = args.filter((a, i) => a !== "--out" && (outIdx < 0 || i !== outIdx + 1))[0];
  if (!unitDir) {
    console.error("usage: node tools/content-pipeline/seed-gen.mjs <unit-dir> [--out file.sql]");
    process.exit(2);
  }
  try {
    const { manifest, lessonsByFile } = loadUnitDir(unitDir);
    const sql = generateSeedSql(manifest, lessonsByFile);
    const dest = outFile ?? join(dirname(dirname(new URL(import.meta.url).pathname)), "..", "content", "seed", `${manifest.id.slice(3).toLowerCase()}-seed.sql`);
    mkdirSync(dirname(dest), { recursive: true });
    writeFileSync(dest, sql);
    console.log(`prepared (NOT applied): ${dest}`);
  } catch (e) {
    console.error(`error: ${e.message}`);
    process.exit(2);
  }
}
