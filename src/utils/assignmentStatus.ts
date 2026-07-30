/**
 * Single source of truth for assignment_submissions.status semantics.
 *
 * Lifecycle: pending -> in_progress -> completed|incomplete -> graded
 *
 * Historically each dashboard surface filtered on the literal 'completed',
 * so the moment a teacher graded a submission (status -> 'graded') the work
 * vanished from every completion metric and average. Use these helpers
 * everywhere instead of comparing against a single literal.
 */

export type SubmissionStatus =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'incomplete'
  | 'graded';

/** Statuses meaning the student finished the work (gradable or graded). */
export const FINISHED_STATUSES: readonly string[] = ['completed', 'graded'];

/** Statuses meaning the submission reached a terminal state. */
export const TERMINAL_STATUSES: readonly string[] = ['completed', 'graded', 'incomplete'];

/** The student finished the assignment (counts toward completion metrics). */
export const isFinished = (status: string | null | undefined): boolean =>
  !!status && FINISHED_STATUSES.includes(status);

/** The submission is done moving (finished or marked incomplete). */
export const isTerminal = (status: string | null | undefined): boolean =>
  !!status && TERMINAL_STATUSES.includes(status);

/** The student is actively working on it. */
export const isInProgress = (status: string | null | undefined): boolean =>
  status === 'in_progress';

/** Finished but not yet reviewed by the teacher — the grading queue. */
export const needsGrading = (status: string | null | undefined): boolean =>
  status === 'completed';

/** Human label for a status, for badges and summaries. */
export const statusLabel = (status: string | null | undefined): string => {
  switch (status) {
    case 'pending':
      return 'Not started';
    case 'in_progress':
      return 'In progress';
    case 'completed':
      return 'Completed';
    case 'graded':
      return 'Graded';
    case 'incomplete':
      return 'Incomplete';
    default:
      return 'Unknown';
  }
};
