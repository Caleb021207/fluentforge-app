/**
 * FSRS scheduling for vocabulary cards, backed by the maintained `ts-fsrs`
 * port of the FSRS-5 algorithm. Scheduling always happens server-side so the
 * browser cannot fabricate review history.
 */
import {
  createEmptyCard,
  fsrs,
  generatorParameters,
  Rating,
  State,
  type Card,
  type Grade,
} from "npm:ts-fsrs@5.4.1";

/** Target probability of recall at review time. */
export const DESIRED_RETENTION = 0.88;

const scheduler = fsrs(
  generatorParameters({ request_retention: DESIRED_RETENTION, enable_fuzz: true }),
);

export interface CardStateRow {
  vocabulary_id: string;
  stability: number;
  difficulty: number;
  due: string;
  state: number;
  reps: number;
  lapses: number;
  elapsed_days: number;
  scheduled_days: number;
  learning_steps?: number;
  last_review: string | null;
}

export function emptyCardFor(now = new Date()): Card {
  return createEmptyCard(now);
}

export function rowToCard(row: CardStateRow | null, now = new Date()): Card {
  if (!row) return createEmptyCard(now);
  return {
    due: new Date(row.due),
    stability: Number(row.stability) || 0,
    difficulty: Number(row.difficulty) || 0,
    elapsed_days: Number(row.elapsed_days) || 0,
    scheduled_days: Number(row.scheduled_days) || 0,
    learning_steps: Number(row.learning_steps) || 0,
    reps: row.reps ?? 0,
    lapses: row.lapses ?? 0,
    state: (row.state ?? 0) as State,
    last_review: row.last_review ? new Date(row.last_review) : undefined,
  } as Card;
}

/** Map a 1-4 client rating onto an FSRS grade, defaulting to "Good". */
export function toGrade(rating: number): Grade {
  switch (rating) {
    case 1:
      return Rating.Again;
    case 2:
      return Rating.Hard;
    case 4:
      return Rating.Easy;
    default:
      return Rating.Good;
  }
}

export interface ScheduleResult {
  card: Card;
  log: {
    rating: number;
    state: number;
    due: string;
    stability: number;
    difficulty: number;
    elapsed_days: number;
    last_elapsed_days: number;
    scheduled_days: number;
    review: string;
  };
}

export function schedule(card: Card, rating: number, now = new Date()): ScheduleResult {
  const grade = toGrade(rating);
  const result = scheduler.next(card, now, grade);
  const next = result.card;
  const log = result.log;
  return {
    card: next,
    log: {
      rating: Number(grade),
      state: Number(log.state),
      due: new Date(log.due).toISOString(),
      stability: Number(log.stability) || 0,
      difficulty: Number(log.difficulty) || 0,
      elapsed_days: Number(log.elapsed_days) || 0,
      last_elapsed_days: Number(log.last_elapsed_days) || 0,
      scheduled_days: Number(log.scheduled_days) || 0,
      review: new Date(log.review).toISOString(),
    },
  };
}

export function cardToRow(userId: string, vocabularyId: string, card: Card) {
  return {
    user_id: userId,
    vocabulary_id: vocabularyId,
    stability: Number(card.stability) || 0,
    difficulty: Number(card.difficulty) || 0,
    due: new Date(card.due).toISOString(),
    state: Number(card.state) || 0,
    reps: card.reps ?? 0,
    lapses: card.lapses ?? 0,
    elapsed_days: Number(card.elapsed_days) || 0,
    scheduled_days: Number(card.scheduled_days) || 0,
    learning_steps: Number((card as unknown as { learning_steps?: number }).learning_steps) || 0,
    last_review: card.last_review ? new Date(card.last_review).toISOString() : null,
  };
}

export { State, Rating };
