import { describe, expect, it } from "vitest";
import {
  FUNCTION_WORDS,
  gateKeys,
  gateVocabBoundary,
  lemmaCandidates,
  loadLessonSchema,
  loadUnitSchema,
  stripNonLearnerText,
  validateAgainstSchema,
  validateUnit,
} from "../../tools/content-pipeline/validate.mjs";
import { generateSeedSql, sqlString, uuidFromKey } from "../../tools/content-pipeline/seed-gen.mjs";

/**
 * Golden vectors for the Phase 0 authoring pipeline (workstream 0.7a).
 *
 * The primary fixture is the band-file sample lesson EN-A1E-U1-L05
 * "Where Are You From?" (wip-curriculum-en-early-a1.md §13a) re-expressed
 * minimally in authoring schema v0.1, preceded by a compact L01 that teaches
 * the vocabulary L05 recycles (name/nice/meet/hello — the §13a lesson recycles
 * U1-L01/L03 chunks, so the cumulative-boundary gate needs a prior lesson).
 *
 * These pin the DETERMINISTIC gates only. The AI-judged gates
 * (solver/pedagogy/bias/level classifier in contentGauntlet.ts) are not
 * exercised here — they are [requires validation] for this slice.
 */

const L01 = {
  id: "EN-U01-L01",
  title: "Hello! What's Your Name?",
  skill_type: "vocab",
  position: 1,
  objective: "Greet someone and ask/answer What's your name?",
  est_minutes: 10,
  intro_md:
    "[L1: In this lesson you learn to greet people and ask for a name.]\n{{l1_contrast:copula_be}}",
  status: "draft",
  vocabulary_refs: [],
  new_vocabulary: [
    { lemma: "hello", pos: "interjection", cefr_level: "A1", example_sentence: "Hello! I'm Ana.", ipa: "/həˈloʊ/", translations: { es: "hola" } },
    { lemma: "hi", pos: "interjection", cefr_level: "A1", example_sentence: "Hi! Nice to meet you.", translations: { es: "hola (informal)" } },
    { lemma: "name", pos: "noun", cefr_level: "A1", example_sentence: "My name is Ana.", ipa: "/neɪm/", translations: { es: "nombre" } },
    { lemma: "nice", pos: "adjective", cefr_level: "A1", example_sentence: "Nice to meet you.", translations: { es: "agradable" } },
    { lemma: "meet", pos: "verb", cefr_level: "A1", example_sentence: "Nice to meet you.", translations: { es: "conocer" } },
    { lemma: "What's your name?", pos: "chunk", cefr_level: "A1", example_sentence: "Hello! What's your name?", translations: { es: "¿Cómo te llamas?" } },
    { lemma: "Nice to meet you.", pos: "chunk", cefr_level: "A1", example_sentence: "Nice to meet you, too.", translations: { es: "Mucho gusto." } },
  ],
  exercises: [
    {
      seq: 1,
      type: "flashcard",
      prompt: "hello · hi · name · nice · meet · What's your name? · Nice to meet you.",
      difficulty: 0.1,
      receptive_productive: "receptive_to_productive",
      timing_s: 150,
      rationale: "Establish form-meaning link with audio before any production.",
    },
    {
      seq: 2,
      type: "listening_mc",
      prompt: "[audio] 'Hello! What's your name?' — [L1: What is the speaker asking?]",
      difficulty: 0.2,
      receptive_productive: "receptive",
      timing_s: 40,
      rationale: "Discriminate the two chunks of this lesson by meaning, not by first word.",
      options: [
        { label: "What's your name?", is_correct: true, rationale: "The question asks for a name." },
        { label: "Nice to meet you.", is_correct: false, rationale: "Also taught this lesson; forces listening for the question form." },
      ],
    },
    {
      seq: 3,
      type: "cloze",
      prompt: "A: Hello! What's your ___?  B: I'm Ana.",
      keys: ["name"],
      distractor_bank: ["meet", "nice"],
      difficulty: 0.3,
      receptive_productive: "productive",
      timing_s: 45,
      rationale: "First productive retrieval of 'name' inside the taught chunk.",
    },
    {
      seq: 4,
      type: "ordering",
      prompt: "[L1: Put the words in order.]",
      tokens: ["name", "your", "what's", "?"],
      key: "What's your name?",
      difficulty: 0.4,
      receptive_productive: "productive",
      timing_s: 40,
      rationale: "Question word order; catches L1 transfer of no-inversion patterns.",
    },
    {
      seq: 5,
      type: "dictation",
      prompt: "[audio, 2 plays: 0.75x then 1.0x] 'Nice to meet you.'",
      key: "Nice to meet you.",
      scoring: "case-insensitive; final period optional",
      difficulty: 0.4,
      receptive_productive: "productive",
      timing_s: 55,
      rationale: "Sound-to-spelling for the politeness chunk before it is needed in dialogue.",
    },
    {
      seq: 6,
      type: "speaking",
      prompt: "[audio] 'What's your name?' → [L1: Answer with your real name.]",
      expected_pattern: "I'm {name}.",
      asr_focus: ["presence of 'm in I'm (copula)"],
      difficulty: 0.5,
      receptive_productive: "productive",
      timing_s: 55,
      rationale: "Personalized production; ASR checks the copula contraction.",
    },
  ],
};

/** §13a EN-A1E-U1-L05 re-expressed minimally in authoring schema v0.1. */
const L05 = {
  id: "EN-U01-L05",
  title: "Where Are You From?",
  skill_type: "speaking",
  position: 2,
  objective: "Ask and answer Where are you from? with I'm from + country.",
  est_minutes: 13,
  intro_md:
    "[L1: In this lesson you learn to ask and answer \"Where are you from?\" You will learn country names and the pattern \"I'm from ___.\"]\n{{l1_contrast:copula_be}}",
  status: "draft",
  prerequisites: ["EN-U01-L01"],
  vocabulary_refs: ["name", "nice", "meet", "What's your name?", "Nice to meet you."],
  new_vocabulary: [
    { lemma: "country", pos: "noun", cefr_level: "A1", example_sentence: "Mexico is a country.", ipa: "/ˈkʌntri/", translations: { es: "país" } },
    { lemma: "Where are you from?", pos: "chunk", cefr_level: "A1", example_sentence: "Where are you from? I'm from Brazil.", translations: { es: "¿De dónde eres?" } },
    { lemma: "I'm from…", pos: "chunk", cefr_level: "A1", example_sentence: "I'm from China.", translations: { es: "Soy de…" } },
    { lemma: "Mexico", pos: "noun", cefr_level: "A1", example_sentence: "She's from Mexico.", translations: { es: "México" } },
    { lemma: "Brazil", pos: "noun", cefr_level: "A1", example_sentence: "I'm from Brazil.", translations: { es: "Brasil" } },
    { lemma: "China", pos: "noun", cefr_level: "A1", example_sentence: "I'm from China.", translations: { es: "China" } },
    { lemma: "Vietnam", pos: "noun", cefr_level: "A1", example_sentence: "He's from Vietnam.", translations: { es: "Vietnam" } },
    { lemma: "Haiti", pos: "noun", cefr_level: "A1", example_sentence: "She's from Haiti.", translations: { es: "Haití" } },
    { lemma: "Ukraine", pos: "noun", cefr_level: "A1", example_sentence: "I'm from Ukraine.", translations: { es: "Ucrania" } },
  ],
  exercises: [
    {
      seq: 1,
      type: "flashcard",
      prompt: "country · Where are you from? · I'm from… · Mexico · Brazil · China · Vietnam · Haiti · Ukraine",
      difficulty: 0.2,
      receptive_productive: "receptive_to_productive",
      timing_s: 180,
      rationale: "Establish form-meaning link with audio before any production.",
    },
    {
      seq: 2,
      type: "listening_mc",
      prompt: "[audio, 0.75x] 'She's from Mexico.' — [L1: Where is she from?]",
      difficulty: 0.2,
      receptive_productive: "receptive",
      timing_s: 40,
      rationale: "Comprehension of 'from + country' in connected speech.",
      options: [
        { label: "Mexico", is_correct: true, rationale: "Heard after 'from'." },
        { label: "Brazil", is_correct: false, rationale: "Distractor: also taught this lesson; forces listening, not guessing." },
        { label: "She's", is_correct: false, rationale: "Catches learners matching first word heard, not meaning." },
      ],
    },
    {
      seq: 3,
      type: "matching",
      prompt: "[L1: Match the question to the answer.]",
      difficulty: 0.2,
      receptive_productive: "receptive",
      timing_s: 60,
      pairs: [
        { left: "What's your name?", right: "I'm Ana." },
        { left: "Where are you from?", right: "I'm from Brazil." },
        { left: "Nice to meet you.", right: "Nice to meet you, too." },
      ],
      rationale: "Discriminates the two U1 question chunks; recycles L01 (N-2 rule).",
    },
    {
      seq: 4,
      type: "cloze",
      prompt: "A: Where ___ you from?  B: I'm ___ Brazil.",
      keys: ["are", "from"],
      distractor_bank: ["is", "am", "in", "of"],
      difficulty: 0.4,
      receptive_productive: "productive",
      timing_s: 60,
      rationale: "Targets copula agreement (are) and the preposition; 'in/of' catch L1 preposition transfer (es: 'de', zh: '从').",
    },
    {
      seq: 5,
      type: "ordering",
      prompt: "[L1: Put the words in order.]",
      tokens: ["from", "where", "you", "are", "?"],
      key: "Where are you from?",
      difficulty: 0.4,
      receptive_productive: "productive",
      timing_s: 45,
      rationale: "Inversion practice; predicted error for zh/vi L1s is SVO order 'Where you are from?' — order feedback names the moved word.",
    },
    {
      seq: 6,
      type: "dictation",
      prompt: "[audio, 2 plays: 0.75x then 1.0x] 'I'm from China.'",
      key: "I'm from China.",
      scoring: "case-insensitive; apostrophe required; 'Im' → targeted feedback on contraction",
      difficulty: 0.4,
      receptive_productive: "productive",
      timing_s: 60,
      rationale: "Sound→spelling for the contraction I'm; weak-form 'from' /frəm/ exposure.",
    },
    {
      seq: 7,
      type: "listening_mc",
      prompt: "[audio, natural speed] 'Where're you from?' — [L1: What did you hear?]",
      difficulty: 0.6,
      receptive_productive: "receptive",
      timing_s: 40,
      rationale: "First planned exposure to reduction; receptive only per band file §6 P6.",
      options: [
        { label: "Where are you from?", is_correct: true, rationale: "'Where're' is the reduced form of 'Where are'." },
        { label: "Where you from?", is_correct: false, rationale: "The 're is quiet but present — trains hearing reductions (P6 preview)." },
      ],
    },
    {
      seq: 8,
      type: "speaking",
      prompt: "[audio] 'Where are you from?' → [L1: Answer with your real country.]",
      expected_pattern: "I'm from {country}.",
      asr_focus: ["presence of 'm in I'm (copula, ar/zh/vi contrast)", "from produced (weak form accepted)"],
      difficulty: 0.4,
      receptive_productive: "productive",
      timing_s: 60,
      rationale: "Personalized production; ASR checks copula presence — the #1 predicted error for zero-copula L1s.",
    },
    {
      seq: 9,
      type: "dialogue",
      prompt: "[L1: Have a short conversation: say hello, give your name, and say where you are from.]",
      difficulty: 0.6,
      receptive_productive: "productive",
      timing_s: 120,
      rationale: "Integrates L01+L05 chunks in real time; counts toward guided-interaction minutes.",
      ai_interaction_ref: "EN-U01-L05-DLG",
    },
  ],
};

const MANIFEST = {
  id: "EN-U01",
  title: "Introducing Yourself",
  theme: "identity and introductions",
  position: 1,
  cefr_level: "A1",
  can_do_statement: "Greet, introduce self, spell name, exchange basic personal information.",
  band_ratios: { structured: 0.78, guided: 0.22, open: 0.0 },
  vocab_budget: 110,
  course: {
    course_key: "en-esl-a0-a2",
    language: "en",
    target_framework: "CEFR",
    level_band: "A0-A2",
    title: "English for Multilingual Learners (A0 → strong A2)",
  },
  lessons: ["EN-U01-L01.json", "EN-U01-L05.json"],
};

const LESSONS = { "EN-U01-L01.json": L01, "EN-U01-L05.json": L05 };

const clone = <T,>(v: T): T => structuredClone(v);

describe("G-schema: authoring schema v0.1 accepts the §13a exemplar", () => {
  it("unit manifest conforms to unit.schema.json", () => {
    expect(validateAgainstSchema(loadUnitSchema(), MANIFEST)).toEqual([]);
  });

  it("the re-expressed band-file sample lesson conforms losslessly", () => {
    expect(validateAgainstSchema(loadLessonSchema(), L05)).toEqual([]);
    expect(validateAgainstSchema(loadLessonSchema(), L01)).toEqual([]);
  });

  it("full unit run passes every deterministic gate", () => {
    const report = validateUnit(MANIFEST, LESSONS);
    expect(report.unit_manifest_errors).toEqual([]);
    expect(report.unit_pass).toBe(true);
    expect(report.summary.pass_rate).toBe(1);
    for (const lesson of report.lessons) {
      for (const [name, g] of Object.entries(lesson.gates)) {
        expect(g.pass, `${lesson.id} ${name}: ${(g as { detail: string }).detail}`).toBe(true);
      }
    }
    expect(report.summary.total_new_vocabulary).toBe(16);
  });

  it("rejects an invalid skill_type", () => {
    const bad = clone(L05);
    (bad as { skill_type: string }).skill_type = "pronunciation";
    expect(validateAgainstSchema(loadLessonSchema(), bad).join(";")).toContain("skill_type");
  });

  it("rejects difficulty outside 0-1", () => {
    const bad = clone(L05);
    bad.exercises[0].difficulty = 1.5;
    expect(validateAgainstSchema(loadLessonSchema(), bad).join(";")).toContain("maximum 1");
  });

  it("rejects a missing Spanish translation", () => {
    const bad = clone(L05);
    delete (bad.new_vocabulary[0].translations as { es?: string }).es;
    expect(validateAgainstSchema(loadLessonSchema(), bad).join(";")).toContain('"es"');
  });
});

describe("G-keys: answer-key integrity", () => {
  it("rejects an exercise with two correct options", () => {
    const bad = clone(L05);
    bad.exercises[1].options![1].is_correct = true;
    const g = gateKeys(bad);
    expect(g.pass).toBe(false);
    expect(g.detail).toContain("2 correct options");
  });

  it("rejects a correct option without a rationale", () => {
    const bad = clone(L05);
    delete bad.exercises[1].options![0].rationale;
    const g = gateKeys(bad);
    expect(g.pass).toBe(false);
    expect(g.detail).toContain("no rationale");
  });

  it("rejects ordering whose tokens cannot rebuild the key", () => {
    const bad = clone(L05);
    bad.exercises[4].tokens = ["from", "where", "you"];
    const g = gateKeys(bad);
    expect(g.pass).toBe(false);
    expect(g.detail).toContain("re-assemble");
  });

  it("rejects cloze with mismatched blank/key counts", () => {
    const bad = clone(L05);
    bad.exercises[3].keys = ["are"];
    const g = gateKeys(bad);
    expect(g.pass).toBe(false);
    expect(g.detail).toContain("2 blank(s)");
  });

  it("rejects a filler exercise with no pedagogical rationale", () => {
    const bad = clone(L05);
    delete bad.exercises[0].rationale;
    const g = gateKeys(bad);
    expect(g.pass).toBe(false);
    expect(g.detail).toContain("exercise-level rationale");
  });
});

describe("G-vocab-boundary: cumulative taught-set enforcement", () => {
  const allowed = new Set<string>();
  for (const lesson of [L01, L05]) {
    for (const v of lesson.new_vocabulary) {
      allowed.add(v.lemma.toLowerCase());
      for (const t of v.lemma.toLowerCase().match(/[a-z][a-z']*/g) ?? []) allowed.add(t);
    }
  }

  it("passes the exemplar against its own cumulative set", () => {
    expect(gateVocabBoundary(L05, allowed).pass).toBe(true);
  });

  it("catches an out-of-list content word in a prompt", () => {
    const bad = clone(L05);
    bad.exercises[7].prompt = "[audio] 'Where are you from?' → [L1: Answer.] Describe the weather.";
    const g = gateVocabBoundary(bad, allowed);
    expect(g.pass).toBe(false);
    const words = (g.violations as Array<{ word: string }>).map((v) => v.word);
    expect(words).toContain("describe");
    expect(words).toContain("weather");
  });

  it("catches an out-of-list word hidden in an option label", () => {
    const bad = clone(L05);
    bad.exercises[1].options![1].label = "elephant";
    const g = gateVocabBoundary(bad, allowed);
    expect(g.pass).toBe(false);
    expect((g.violations as Array<{ word: string }>).map((v) => v.word)).toContain("elephant");
  });

  it("does not scan L1-bracketed instruction text", () => {
    expect(stripNonLearnerText("[L1: Match the question to the answer.] hi")).not.toContain("Match");
  });

  it("exempts mid-sentence proper nouns but reports them", () => {
    const g = gateVocabBoundary(L05, allowed);
    expect(g.pass).toBe(true);
    expect((g.warnings as string[]).join(" ")).toContain("Ana");
  });

  it("keeps the function-word allowlist honestly small and grammatical", () => {
    expect(FUNCTION_WORDS.size).toBeGreaterThan(150);
    expect(FUNCTION_WORDS.size).toBeLessThan(230);
    // taught content must NOT be in the allowlist
    for (const taught of ["hello", "name", "country", "please", "one", "monday"]) {
      expect(FUNCTION_WORDS.has(taught), taught).toBe(false);
    }
  });

  it("resolves inflected forms to known lemmas", () => {
    expect(lemmaCandidates("countries")).toContain("country");
    expect(lemmaCandidates("meets")).toContain("meet");
  });
});

describe("G-counts and G-difficulty", () => {
  it("fails a lesson with fewer than 6 exercises", () => {
    const bad = clone(L05);
    bad.exercises = bad.exercises.slice(0, 3);
    const report = validateUnit(MANIFEST, { ...LESSONS, "EN-U01-L05.json": bad });
    const l05 = report.lessons[1];
    expect(l05.gates["G-counts"].pass).toBe(false);
    expect(report.unit_pass).toBe(false);
  });

  it("fails when the warm-up starts harder than it ends", () => {
    const bad = clone(L05);
    bad.exercises[0].difficulty = 0.9;
    bad.exercises[bad.exercises.length - 1].difficulty = 0.2;
    const report = validateUnit(MANIFEST, { ...LESSONS, "EN-U01-L05.json": bad });
    expect(report.lessons[1].gates["G-difficulty"].pass).toBe(false);
  });

  it("fails the unit when the vocab budget is exceeded", () => {
    const tightManifest = { ...clone(MANIFEST), vocab_budget: 5 };
    const report = validateUnit(tightManifest, LESSONS);
    expect(report.unit_manifest_errors.join(";")).toContain("budget");
    expect(report.unit_pass).toBe(false);
  });

  it("reports a missing lesson file as a hard failure", () => {
    const report = validateUnit(MANIFEST, { "EN-U01-L01.json": L01 });
    expect(report.lessons[1].pass).toBe(false);
    expect(report.summary.pass_rate).toBe(0.5);
  });
});

describe("seed-gen: deterministic prepared SQL", () => {
  it("md5 UUIDs are stable, well-formed v3/RFC4122, and key-sensitive", () => {
    const a = uuidFromKey("lesson:EN-U01-L05");
    expect(a).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-3[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    expect(uuidFromKey("lesson:EN-U01-L05")).toBe(a);
    expect(uuidFromKey("lesson:EN-U01-L06")).not.toBe(a);
  });

  it("same input produces byte-identical SQL", () => {
    const one = generateSeedSql(MANIFEST, LESSONS);
    const two = generateSeedSql(clone(MANIFEST), clone(LESSONS));
    expect(one).toBe(two);
  });

  it("is prepared-only, idempotent, and draft-everywhere", () => {
    const sql = generateSeedSql(MANIFEST, LESSONS);
    expect(sql).toContain("PREPARED, NOT APPLIED");
    // one per INSERT statement: courses, units, skills, lessons, exercises,
    // exercise_options, vocabulary, vocab_lesson_map (header mention excluded)
    expect((sql.match(/\nON CONFLICT DO NOTHING;/g) ?? []).length).toBe(8);
    expect(sql).toContain("'draft'");
    expect(sql).not.toContain("'operational'");
    expect(sql).not.toContain("'gated'");
  });

  it("targets the real column names and maps translations.es -> translation_l1", () => {
    const sql = generateSeedSql(MANIFEST, LESSONS);
    expect(sql).toContain("INSERT INTO public.exercise_options (id, exercise_id, label, is_correct, position, rationale)");
    expect(sql).toContain("translation_l1");
    expect(sql).toContain("'¿De dónde eres?'");
    expect(sql).toContain("TODO(plan 13");
    // authoring-only three-state value never reaches the DB CHECK
    expect(sql).not.toContain("'receptive_to_productive'");
    expect(sql).toContain("'productive'");
  });

  it("escapes single quotes SQL-style", () => {
    const sql = generateSeedSql(MANIFEST, LESSONS);
    expect(sql).toContain("'What''s your name?'");
    expect(sqlString("I'm Ana.")).toBe("'I''m Ana.'");
  });

  it("refuses to generate from an incomplete unit", () => {
    expect(() => generateSeedSql(MANIFEST, { "EN-U01-L01.json": L01 })).toThrow(/validate/);
  });
});
