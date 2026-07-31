/**
 * Pure re-queue logic for the lesson player (plan 02 finding F2-2).
 *
 * The server (`submit-exercise`) is the only judge of lesson completion: a
 * lesson is complete once every published exercise has a correct attempt.
 * The old player showed "Lesson complete" after a single pass regardless,
 * so UI truth diverged from server truth. The client now tracks which
 * exercises got a correct answer *this session* and, at the end of a pass,
 * re-queues exactly the missed ones until the server reports complete or
 * the learner exits.
 */

/**
 * Update the list of exercise ids that still lack a correct answer this
 * session. A correct answer removes the id; a wrong answer adds it once.
 * Pure: inputs are never mutated.
 */
export function applyGrade(
  wrongIds: readonly string[],
  exerciseId: string,
  correct: boolean,
): string[] {
  if (correct) return wrongIds.filter((id) => id !== exerciseId);
  return wrongIds.includes(exerciseId) ? [...wrongIds] : [...wrongIds, exerciseId];
}

/**
 * The next pass: the current pass order filtered to ids still missing a
 * correct answer, preserving the original presentation order.
 */
export function buildRequeue(
  passOrder: readonly string[],
  wrongIds: readonly string[],
): string[] {
  const wrong = new Set(wrongIds);
  return passOrder.filter((id) => wrong.has(id));
}

export type PassOutcome =
  /** Server confirmed every published exercise is solved. */
  | { kind: "complete" }
  /** Practice these ids again, in order. */
  | { kind: "requeue"; queue: string[] }
  /**
   * Server says the lesson is incomplete but nothing shown this session can
   * be retried (e.g. the lesson has published exercises the client filtered
   * out as unanswerable). The player must NOT claim completion here.
   */
  | { kind: "blocked" };

/** Decide what happens after the last item of a pass. */
export function endOfPassOutcome(args: {
  serverComplete: boolean;
  passOrder: readonly string[];
  wrongIds: readonly string[];
}): PassOutcome {
  if (args.serverComplete) return { kind: "complete" };
  const queue = buildRequeue(args.passOrder, args.wrongIds);
  if (queue.length === 0) return { kind: "blocked" };
  return { kind: "requeue", queue };
}
