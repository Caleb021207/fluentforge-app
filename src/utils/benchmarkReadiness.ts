/**
 * Learning-to-benchmark loop.
 *
 * Everything here is pure computation over data the caller already fetched
 * (RLS decides what a teacher/student may read). The shared spine is
 * `can_do_statements` + `content_can_do_map`: curriculum content is mapped to
 * can-do statements, learner evidence is mapped to the same statements, and
 * readiness is *projected* from that overlap.
 *
 * Nothing here produces a benchmark score. It produces a band plus a
 * confidence level, and every consumer must label it a projection.
 */

export const CANDO_MASTERY_THRESHOLD = 0.8;
export const CANDO_MIN_ATTEMPTS = 5;

export interface CanDoStatement {
  id: string;
  framework: string;
  skill_or_mode: string | null;
  level: string | null;
  statement: string;
}

/** content_can_do_map row. */
export interface CanDoLink {
  can_do_id: string;
  content_type: string; // 'unit' | 'skill' | 'lesson'
  content_id: string;
}

export interface CurriculumIndex {
  /** unit id -> skill ids */
  unitSkills: Record<string, string[]>;
  /** lesson id -> skill id */
  lessonSkill: Record<string, string>;
  /** skill id -> unit id */
  skillUnit: Record<string, string>;
}

export interface LearnerEvidence {
  studentId: string;
  studentName: string;
  /** skill_mastery rows */
  mastery: { skill_id: string; mastery: number; attempts: number }[];
  /** vocab_card_state rows */
  cards: { reps: number; lapses: number; state: number; due: string }[];
  /** assessment evidence: certification attempts / graded submissions */
  assessments: { level: string | null; score: number | null }[];
}

export interface CanDoCell {
  canDoId: string;
  /** Average mastery across the skills mapped to this can-do (0..1). */
  mastery: number;
  attempts: number;
  mastered: boolean;
  practiced: boolean;
  tested: boolean;
  /** No curriculum content is mapped to this can-do yet. */
  unmapped: boolean;
}

export interface StudentReadiness {
  studentId: string;
  studentName: string;
  cells: Record<string, CanDoCell>;
  masteredCount: number;
  practicedCount: number;
  testedCount: number;
  totalMapped: number;
  vocabRetention: number | null;
  readiness: ReadinessProjection;
}

export interface ReadinessProjection {
  /** 0..1 blended evidence index — internal, not a score to display raw. */
  index: number;
  band: string;
  widaBand: number;
  actflBand: string;
  confidence: "low" | "moderate" | "high";
  rationale: string;
}

/** Build fast lookup maps from the curriculum tree. */
export function buildCurriculumIndex(
  units: { id: string; skills?: { id: string; lessons?: { id: string }[] }[] }[],
): CurriculumIndex {
  const unitSkills: Record<string, string[]> = {};
  const lessonSkill: Record<string, string> = {};
  const skillUnit: Record<string, string> = {};

  for (const unit of units) {
    unitSkills[unit.id] = (unit.skills ?? []).map((s) => s.id);
    for (const skill of unit.skills ?? []) {
      skillUnit[skill.id] = unit.id;
      for (const lesson of skill.lessons ?? []) lessonSkill[lesson.id] = skill.id;
    }
  }
  return { unitSkills, lessonSkill, skillUnit };
}

/** Resolve a can-do statement to the set of skills that teach it. */
export function skillsForCanDo(
  canDoId: string,
  links: CanDoLink[],
  index: CurriculumIndex,
): string[] {
  const skills = new Set<string>();
  for (const link of links) {
    if (link.can_do_id !== canDoId) continue;
    if (link.content_type === "unit") {
      for (const s of index.unitSkills[link.content_id] ?? []) skills.add(s);
    } else if (link.content_type === "skill") {
      skills.add(link.content_id);
    } else if (link.content_type === "lesson") {
      const s = index.lessonSkill[link.content_id];
      if (s) skills.add(s);
    }
  }
  return [...skills];
}

function levelMatches(canDoLevel: string | null, assessmentLevel: string | null): boolean {
  if (!canDoLevel || !assessmentLevel) return false;
  const a = canDoLevel.trim().toLowerCase();
  const b = assessmentLevel.trim().toLowerCase();
  return a === b || b.includes(a) || a.includes(b);
}

export function vocabRetention(cards: LearnerEvidence["cards"]): number | null {
  const reviewed = cards.filter((c) => c.reps > 0);
  if (!reviewed.length) return null;
  const reps = reviewed.reduce((n, c) => n + c.reps, 0);
  const lapses = reviewed.reduce((n, c) => n + c.lapses, 0);
  if (reps === 0) return null;
  return Math.max(0, Math.min(1, (reps - lapses) / reps));
}

const WIDA_BANDS: { max: number; band: string; wida: number; actfl: string }[] = [
  { max: 0.2, band: "Entering", wida: 1, actfl: "Novice Low" },
  { max: 0.4, band: "Emerging", wida: 2, actfl: "Novice Mid" },
  { max: 0.6, band: "Developing", wida: 3, actfl: "Novice High" },
  { max: 0.8, band: "Expanding", wida: 4, actfl: "Intermediate Low" },
  { max: 1.01, band: "Bridging", wida: 5, actfl: "Intermediate Mid" },
];

export function projectReadiness(args: {
  masteredCount: number;
  totalMapped: number;
  avgMastery: number;
  totalAttempts: number;
  testedCount: number;
  retention: number | null;
}): ReadinessProjection {
  const { masteredCount, totalMapped, avgMastery, totalAttempts, testedCount, retention } = args;
  const masteredFraction = totalMapped ? masteredCount / totalMapped : 0;
  const index =
    0.6 * masteredFraction + 0.25 * avgMastery + 0.15 * (retention ?? avgMastery);

  const bucket = WIDA_BANDS.find((b) => index < b.max) ?? WIDA_BANDS[WIDA_BANDS.length - 1];

  // Confidence is about *evidence volume and breadth*, never about the band.
  let confidence: ReadinessProjection["confidence"] = "low";
  if (totalAttempts >= 40 && testedCount >= 1 && totalMapped >= 3) confidence = "moderate";
  if (totalAttempts >= 100 && testedCount >= 2 && totalMapped >= 5) confidence = "high";

  const rationale =
    `${masteredCount}/${totalMapped} mapped can-dos mastered · ` +
    `${Math.round(avgMastery * 100)}% average skill mastery · ` +
    `${totalAttempts} scored attempts · ` +
    (retention === null ? "no vocabulary review history" : `${Math.round(retention * 100)}% vocabulary retention`);

  return { index, band: bucket.band, widaBand: bucket.wida, actflBand: bucket.actfl, confidence, rationale };
}

/** Compute the full can-do heatmap + readiness projection for one learner. */
export function computeStudentReadiness(
  evidence: LearnerEvidence,
  statements: CanDoStatement[],
  links: CanDoLink[],
  index: CurriculumIndex,
): StudentReadiness {
  const masteryBySkill = new Map(evidence.mastery.map((m) => [m.skill_id, m]));
  const cells: Record<string, CanDoCell> = {};

  let masteredCount = 0;
  let practicedCount = 0;
  let testedCount = 0;
  let totalMapped = 0;
  let masterySum = 0;
  let totalAttempts = 0;

  for (const statement of statements) {
    const skills = skillsForCanDo(statement.id, links, index);
    const rows = skills.map((id) => masteryBySkill.get(id)).filter(Boolean) as {
      skill_id: string;
      mastery: number;
      attempts: number;
    }[];

    const attempts = rows.reduce((n, r) => n + (r.attempts ?? 0), 0);
    const mastery = rows.length ? rows.reduce((n, r) => n + (r.mastery ?? 0), 0) / rows.length : 0;
    const tested = evidence.assessments.some(
      (a) => a.score !== null && levelMatches(statement.level, a.level),
    );
    const mastered = mastery >= CANDO_MASTERY_THRESHOLD && attempts >= CANDO_MIN_ATTEMPTS;

    cells[statement.id] = {
      canDoId: statement.id,
      mastery,
      attempts,
      mastered,
      practiced: attempts > 0,
      tested,
      unmapped: skills.length === 0,
    };

    if (skills.length === 0) continue;
    totalMapped += 1;
    masterySum += mastery;
    totalAttempts += attempts;
    if (mastered) masteredCount += 1;
    if (attempts > 0) practicedCount += 1;
    if (tested) testedCount += 1;
  }

  const retention = vocabRetention(evidence.cards);
  const avgMastery = totalMapped ? masterySum / totalMapped : 0;

  return {
    studentId: evidence.studentId,
    studentName: evidence.studentName,
    cells,
    masteredCount,
    practicedCount,
    testedCount,
    totalMapped,
    vocabRetention: retention,
    readiness: projectReadiness({
      masteredCount,
      totalMapped,
      avgMastery,
      totalAttempts,
      testedCount,
      retention,
    }),
  };
}

export interface NeedsHelpGroup {
  canDoId: string;
  statement: string;
  framework: string;
  level: string | null;
  domain: string;
  students: { id: string; name: string; mastery: number }[];
}

/** Group students by the can-dos they have *not* met — shared unmet needs. */
export function groupNeedsHelp(
  students: StudentReadiness[],
  statements: CanDoStatement[],
): NeedsHelpGroup[] {
  const groups: NeedsHelpGroup[] = [];

  for (const statement of statements) {
    const unmet = students
      .filter((s) => {
        const cell = s.cells[statement.id];
        return cell && !cell.unmapped && !cell.mastered;
      })
      .map((s) => ({
        id: s.studentId,
        name: s.studentName,
        mastery: s.cells[statement.id].mastery,
      }))
      .sort((a, b) => a.mastery - b.mastery);

    if (unmet.length < 1) continue;
    groups.push({
      canDoId: statement.id,
      statement: statement.statement,
      framework: statement.framework,
      level: statement.level,
      domain: statement.skill_or_mode || "General",
      students: unmet,
    });
  }

  return groups.sort((a, b) => b.students.length - a.students.length);
}

/** Class-level practiced-vs-tested coverage per can-do. */
export interface CoverageRow {
  canDoId: string;
  statement: string;
  framework: string;
  domain: string;
  level: string | null;
  practicedPct: number;
  testedPct: number;
  masteredPct: number;
  unmapped: boolean;
}

export function computeCoverage(
  students: StudentReadiness[],
  statements: CanDoStatement[],
): CoverageRow[] {
  const n = students.length || 1;
  return statements.map((statement) => {
    const cells = students.map((s) => s.cells[statement.id]).filter(Boolean);
    const unmapped = cells.length > 0 ? cells.every((c) => c.unmapped) : true;
    return {
      canDoId: statement.id,
      statement: statement.statement,
      framework: statement.framework,
      domain: statement.skill_or_mode || "General",
      level: statement.level,
      practicedPct: Math.round((cells.filter((c) => c.practiced).length / n) * 100),
      testedPct: Math.round((cells.filter((c) => c.tested).length / n) * 100),
      masteredPct: Math.round((cells.filter((c) => c.mastered).length / n) * 100),
      unmapped,
    };
  });
}
