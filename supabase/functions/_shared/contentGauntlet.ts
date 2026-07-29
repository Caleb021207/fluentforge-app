import { chat, chatJson, embed, cosine } from "./aiGateway.ts";

/**
 * The AI content-authoring gauntlet.
 *
 * Every generated item must survive a chain of independent gates before it can
 * be promoted out of 'draft'. LLMs consistently over-shoot the target CEFR/WIDA
 * band and invent ambiguous distractors, so nothing here trusts the author
 * prompt: each property is re-measured by a different model or by code.
 */

export const AUTHOR_MODEL = "google/gemini-3.6-flash";
/** Deliberately a different vendor/family from the author model. */
export const SOLVER_MODEL = "openai/gpt-5.4-mini";
export const JUDGE_MODEL = "google/gemini-2.5-flash";

export interface GeneratedOption {
  label: string;
  is_correct: boolean;
  rationale?: string;
}

export interface GeneratedItem {
  type: string;
  prompt: string;
  options: GeneratedOption[];
  difficulty?: number;
  receptive_productive?: "receptive" | "productive";
  learning_point?: string;
  target_vocab?: string[];
}

export interface GateOutcome {
  pass: boolean;
  score?: number;
  detail: string;
}

export type GateResults = Record<string, GateOutcome> & { passed_all?: boolean };

export interface ScopeContext {
  cefr_level: string;
  wida_level?: number | null;
  can_do_statement?: string | null;
  content_objective?: string | null;
  language_objective?: string | null;
  key_language_use?: string | null;
  unit_title?: string;
  skill_title?: string;
  skill_type?: string;
  grammar_point?: string | null;
  known_vocab: string[];
}

/* ------------------------------------------------------------- readability */

function countSyllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (!w) return 0;
  if (w.length <= 3) return 1;
  const groups = w.replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "").match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups ? groups.length : 1);
}

/** Flesch–Kincaid grade level. */
export function readabilityGrade(text: string): number {
  const sentences = Math.max(1, (text.match(/[.!?]+/g) || []).length);
  const words = text.trim().split(/\s+/).filter(Boolean);
  if (!words.length) return 0;
  const syllables = words.reduce((sum, w) => sum + countSyllables(w), 0);
  return Number((0.39 * (words.length / sentences) + 11.8 * (syllables / words.length) - 15.59).toFixed(2));
}

export function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

/** Max acceptable Flesch–Kincaid grade per CEFR band (grades 6–8 ESL). */
const MAX_GRADE: Record<string, number> = { A1: 3.5, A2: 5.5, B1: 8.0, B2: 10.5 };
const ORDER = ["A1", "A2", "B1", "B2", "C1", "C2"];

function bandDistance(a: string, b: string): number {
  const ia = ORDER.indexOf(a.toUpperCase());
  const ib = ORDER.indexOf(b.toUpperCase());
  if (ia < 0 || ib < 0) return 0;
  return Math.abs(ia - ib);
}

/* ------------------------------------------------------------------ gates */

/** (b) readability formula + an independent LLM level classifier. */
export async function levelGate(text: string, target: string): Promise<GateOutcome> {
  const grade = readabilityGrade(text);
  const ceiling = MAX_GRADE[target.toUpperCase()] ?? 8;
  // Flesch-Kincaid is unstable on very short strings (a single 12-word prompt
  // can score grade 7), so the formula only binds on passage-length text.
  const formulaApplies = wordCount(text) >= 30;
  const formulaPass = !formulaApplies || grade <= ceiling + 0.5;

  const verdict = await chatJson<{ cefr: string; reason: string }>({
    model: JUDGE_MODEL,
    system:
      "You are a CEFR level classifier for English learner materials. Reply with JSON only: " +
      '{"cefr":"A1|A2|B1|B2|C1|C2","reason":"short"}. Judge the hardest language present, not the topic.',
    prompt: `Classify the CEFR level of this English learner text:\n\n${text}`,
  });

  const classified = (verdict?.cefr ?? "").toUpperCase();
  const targetIdx = ORDER.indexOf(target.toUpperCase());
  const classIdx = ORDER.indexOf(classified);
  // Easier than target is acceptable; one band harder is the reject line.
  const llmPass = classIdx >= 0 && targetIdx >= 0 ? classIdx <= targetIdx : true;

  return {
    pass: formulaPass && llmPass,
    score: grade,
    detail: `FK grade ${grade} (ceiling ${ceiling}, ${formulaApplies ? (formulaPass ? "ok" : "too hard") : "not applied to short text"}); classifier said ${classified || "unknown"} vs target ${target}${verdict?.reason ? ` — ${verdict.reason}` : ""}`,
  };
}


/** (c) a separate model solves the item cold and must land on the authored key. */
export async function solverGate(item: GeneratedItem): Promise<GateOutcome> {
  const options = item.options.filter((o) => o.label?.trim());
  if (!options.length) return { pass: true, detail: "No answer key to verify (open-ended item)." };

  const keyIndex = options.findIndex((o) => o.is_correct);
  if (keyIndex < 0) return { pass: false, detail: "Authored item has no correct option marked." };

  const rendered = options.map((o, i) => `${i + 1}. ${o.label}`).join("\n");
  const solved = await chatJson<{ answer: number; second_defensible: number | null; note: string }>({
    model: SOLVER_MODEL,
    system:
      "You are an expert ESL test solver. You are shown an exercise with numbered options and no answer key. " +
      'Reply JSON only: {"answer": <1-based index>, "second_defensible": <1-based index or null>, "note": "short"}. ' +
      "Set second_defensible when another option could also be argued correct.",
    prompt: `Exercise (${item.type}):\n${item.prompt}\n\nOptions:\n${rendered}`,
  });

  if (!solved || typeof solved.answer !== "number") {
    return { pass: false, detail: "Solver model returned no usable answer." };
  }
  const matched = solved.answer - 1 === keyIndex;
  const ambiguous = solved.second_defensible != null;
  return {
    pass: matched && !ambiguous,
    detail: `Solver (${SOLVER_MODEL}) chose #${solved.answer}, key is #${keyIndex + 1}${ambiguous ? `; flagged #${solved.second_defensible} as also defensible` : ""}${solved.note ? ` — ${solved.note}` : ""}`,
  };
}

/** (d) rubric-scored pedagogy judge. */
export async function pedagogyGate(item: GeneratedItem, ctx: ScopeContext): Promise<GateOutcome> {
  const rendered = item.options.map((o, i) => `${i + 1}. ${o.label}`).join("\n");
  const judged = await chatJson<{
    coherence: number; alignment: number; distractors: number; single_point: number; notes: string;
  }>({
    model: JUDGE_MODEL,
    system:
      "You grade ESL exercises for middle-school (grades 6-8) learners against a rubric. " +
      'Reply JSON only: {"coherence":0-5,"alignment":0-5,"distractors":0-5,"single_point":0-5,"notes":"short"}. ' +
      "coherence = the item makes sense and is answerable; alignment = it serves the can-do statement and objectives; " +
      "distractors = wrong options are plausible but clearly wrong; single_point = it teaches exactly one clear learning point.",
    prompt:
      `Target CEFR: ${ctx.cefr_level}${ctx.wida_level ? ` / WIDA ${ctx.wida_level}` : ""}\n` +
      `Can-do: ${ctx.can_do_statement ?? "n/a"}\nContent objective: ${ctx.content_objective ?? "n/a"}\n` +
      `Language objective: ${ctx.language_objective ?? "n/a"}\nGrammar point: ${ctx.grammar_point ?? "n/a"}\n\n` +
      `Exercise (${item.type}): ${item.prompt}\nOptions:\n${rendered || "(none)"}`,
  });

  if (!judged) return { pass: false, detail: "Pedagogy judge returned no usable rubric." };
  const scores = [judged.coherence, judged.alignment, judged.distractors, judged.single_point].map(
    (n) => (typeof n === "number" ? n : 0),
  );
  const total = scores.reduce((a, b) => a + b, 0);
  const min = Math.min(...scores);
  return {
    pass: total >= 15 && min >= 3,
    score: total,
    detail: `rubric ${total}/20 (coherence ${scores[0]}, alignment ${scores[1]}, distractors ${scores[2]}, single point ${scores[3]})${judged.notes ? ` — ${judged.notes}` : ""}`,
  };
}

/** (e) cultural sensitivity / bias screen. */
export async function biasGate(text: string): Promise<GateOutcome> {
  const screened = await chatJson<{ safe: boolean; concerns: string[] }>({
    model: JUDGE_MODEL,
    system:
      "You screen classroom material for US public middle schools (grades 6-8) with multilingual learners. " +
      'Reply JSON only: {"safe":true|false,"concerns":["..."]}. Flag stereotyping, culturally exclusive assumptions, ' +
      "religion/politics advocacy, violence, adult themes, or content requiring US-only background knowledge.",
    prompt: text,
  });
  if (!screened) return { pass: false, detail: "Bias screen returned no usable verdict." };
  return {
    pass: screened.safe === true && (screened.concerns?.length ?? 0) === 0,
    detail: screened.safe ? "No cultural or bias concerns raised." : `Concerns: ${(screened.concerns || []).join("; ")}`,
  };
}

/** (f) embedding similarity against existing content in the same scope. */
export async function duplicateGate(
  text: string,
  existing: Array<{ text: string; vector?: number[] }>,
  threshold = 0.92,
): Promise<{ outcome: GateOutcome; vector: number[] | null }> {
  const vector = await embed(text);
  if (!vector) {
    return { outcome: { pass: true, detail: "Embedding unavailable; duplicate check skipped." }, vector: null };
  }
  let worst = 0;
  let match = "";
  for (const e of existing) {
    if (!e.vector) continue;
    const sim = cosine(vector, e.vector);
    if (sim > worst) {
      worst = sim;
      match = e.text;
    }
  }
  return {
    outcome: {
      pass: worst < threshold,
      score: Number(worst.toFixed(3)),
      detail: worst
        ? `max similarity ${worst.toFixed(3)} vs "${match.slice(0, 60)}" (threshold ${threshold})`
        : "No comparable existing content.",
    },
    vector,
  };
}

/** Comprehensible-input budget: ~5-10% of tokens may be outside the known set. */
/** Common function words that carry no new lexical load for the learner. */
const STOP_WORDS = new Set(
  "a an the i you he she it we they me him them us is am are was were be been do does did to of in on at and or but so because my your his her its our their this that these those with for from have has had not no yes what when where who how why can could will would there here also very too then next after before again some any all one two three four five".split(" "),
);

/**
 * Words that appear only in the instruction wrapper of an item ("Match the
 * sentence to ..."). They are teacher-facing scaffolding, not new vocabulary
 * the learner has to decode, so they are excluded from the input budget.
 */
const INSTRUCTION_WORDS = new Set(
  "match choose select pick complete fill blank blanks gap gaps sentence sentences word words phrase phrases correct incorrect answer answers option options question questions listen read write say repeat order reorder put right wrong true false example examples missing best line lines text passage dialogue conversation picture card cards pair pairs number letter part translate translation meaning column".split(" "),
);

/** Cheap morphology so "books"/"walking" count as the known lemma. */
function lemmaCandidates(word: string): string[] {
  const forms = [word];
  for (const [suffix, stripped] of [["ies", "y"], ["es", ""], ["s", ""], ["ing", ""], ["ed", ""], ["ed", "e"], ["ing", "e"]] as const) {
    if (word.length > suffix.length + 2 && word.endsWith(suffix)) {
      forms.push(word.slice(0, -suffix.length) + stripped);
    }
  }
  return forms;
}

/**
 * Everyday A1 words that any grade 6-8 newcomer meets in week one. They are
 * not part of the unit's taught set but do not add lexical load either.
 */
const CORE_A1 = new Set(
  ("hello hi bye goodbye please thanks thank yes no ok okay mr mrs miss " +
   "big small good bad new old nice happy sad hot cold long short young little " +
   "day days week month year years time today tomorrow yesterday morning afternoon evening night " +
   "boy girl man woman people friend friends kid kids child children person " +
   "go goes going come comes get gets like likes want wants need needs make makes take takes see sees know knows think thinks live lives work works play plays help helps start starts finish finishes " +
   "school home house room class classes teacher student students book books thing things name names " +
   "zero one two three four five six seven eight nine ten eleven twelve thirteen fourteen fifteen sixteen seventeen eighteen nineteen twenty thirty forty fifty hundred " +
   "monday tuesday wednesday thursday friday saturday sunday").split(/\s+/),
);

/** Proper nouns (names, cities, countries) carry no lexical load in ESL items. */
function properNouns(originalText: string): Set<string> {
  const found = new Set<string>();
  const tokens = originalText.match(/[A-Za-z']+/g) ?? [];
  tokens.forEach((tok, i) => {
    const prev = tokens[i - 1];
    const sentenceStart = i === 0 || /[.!?:]\s*["']?$/.test(originalText.split(tok)[0]?.slice(-3) ?? "");
    if (/^[A-Z][a-z]+$/.test(tok) && !(i === 0) && !(prev === undefined) && !sentenceStart) {
      found.add(tok.toLowerCase());
    }
  });
  return found;
}

export function inputBudgetGate(text: string, known: string[]): GateOutcome {
  if (!known.length) return { pass: true, detail: "No known-vocabulary baseline for this scope." };
  const knownSet = new Set(known.map((w) => w.toLowerCase()));
  const names = properNouns(text);
  const words = (text.toLowerCase().match(/[a-z']+/g) || [])
    .map((w) => w.replace(/^'+|'+$/g, ""))
    .filter((w) => w.length > 1);
  const content = words.filter(
    (w) => !STOP_WORDS.has(w) && !INSTRUCTION_WORDS.has(w) && !CORE_A1.has(w) && !names.has(w),
  );
  if (!content.length) return { pass: true, detail: "No content words to measure." };
  const unknown = content.filter((w) => !lemmaCandidates(w).some((f) => knownSet.has(f)));
  const ratio = unknown.length / content.length;
  return {
    // ~5-10% new vocabulary is the target; 30% is the hard reject line once
    // instruction scaffolding, names and inflected known words are discounted.
    pass: ratio <= 0.3,
    score: Number(ratio.toFixed(3)),
    detail: `${(ratio * 100).toFixed(0)}% of content words outside the known set (${unknown.slice(0, 6).join(", ") || "none"})`,
  };
}



export function allPassed(results: GateResults): boolean {
  return Object.entries(results)
    .filter(([k]) => k !== "passed_all")
    .every(([, v]) => (v as GateOutcome)?.pass === true);
}

/** (a) Generate items constrained to the structure + comprehensible-input budget. */
export async function generateItems(
  ctx: ScopeContext,
  type: string,
  count: number,
): Promise<GeneratedItem[]> {
  const raw = await chatJson<{ items: GeneratedItem[] }>({
    model: AUTHOR_MODEL,
    system:
      "You author English/ESL exercises for US middle school (grades 6-8) multilingual learners. " +
      "You write STRICTLY at the requested CEFR/WIDA level and stay inside a comprehensible-input budget: " +
      "at least 90% of content words must come from the learner's known vocabulary list, and at most 5-10% may be new. " +
      'Reply JSON only: {"items":[{"type":"...","prompt":"...","options":[{"label":"...","is_correct":true|false,' +
      '"rationale":"why this option is right or wrong"}],"difficulty":0-1,"receptive_productive":"receptive|productive",' +
      '"learning_point":"one sentence","target_vocab":["..."]}]}. ' +
      "Exactly one option must have is_correct true. Distractors must be plausible but unambiguously wrong. " +
      "Never use culturally exclusive or US-only background knowledge.",
    prompt:
      `Author ${count} exercises of type "${type}".\n` +
      `Unit: ${ctx.unit_title ?? "n/a"} — Skill: ${ctx.skill_title ?? "n/a"} (${ctx.skill_type ?? "n/a"})\n` +
      `Target level: CEFR ${ctx.cefr_level}${ctx.wida_level ? `, WIDA ${ctx.wida_level}` : ""}\n` +
      `Can-do statement: ${ctx.can_do_statement ?? "n/a"}\n` +
      `Key language use: ${ctx.key_language_use ?? "n/a"}\n` +
      `Content objective: ${ctx.content_objective ?? "n/a"}\n` +
      `Language objective: ${ctx.language_objective ?? "n/a"}\n` +
      `Target grammar point: ${ctx.grammar_point ?? "n/a"}\n` +
      `Known vocabulary (stay inside this): ${ctx.known_vocab.slice(0, 80).join(", ") || "basic A1 English"}`,
  });
  const items = raw?.items;
  return Array.isArray(items) ? items.slice(0, count) : [];
}

/** Run every gate for one item and return the stored gate_results blob. */
export async function runGauntlet(
  item: GeneratedItem,
  ctx: ScopeContext,
  existing: Array<{ text: string; vector?: number[] }>,
): Promise<{ results: GateResults; vector: number[] | null }> {
  const surface = [item.prompt, ...item.options.map((o) => o.label)].join(" ");
  const results: GateResults = {};

  results.input_budget = inputBudgetGate(surface, ctx.known_vocab);

  const [level, solver, pedagogy, bias] = await Promise.all([
    levelGate(surface, ctx.cefr_level).catch((e) => ({ pass: false, detail: `level gate error: ${e.message}` })),
    solverGate(item).catch((e) => ({ pass: false, detail: `solver gate error: ${e.message}` })),
    pedagogyGate(item, ctx).catch((e) => ({ pass: false, detail: `pedagogy gate error: ${e.message}` })),
    biasGate(surface).catch((e) => ({ pass: false, detail: `bias gate error: ${e.message}` })),
  ]);
  results.level = level;
  results.solver = solver;
  results.pedagogy = pedagogy;
  results.bias = bias;

  const dup = await duplicateGate(surface, existing).catch((e) => ({
    outcome: { pass: false, detail: `duplicate gate error: ${e.message}` },
    vector: null as number[] | null,
  }));
  results.duplicate = dup.outcome;
  results.passed_all = allPassed(results) as unknown as GateOutcome;

  return { results, vector: dup.vector };
}

export function failureReasons(results: GateResults): string[] {
  return Object.entries(results)
    .filter(([k, v]) => k !== "passed_all" && (v as GateOutcome)?.pass === false)
    .map(([k, v]) => `${k}: ${(v as GateOutcome).detail}`);
}
