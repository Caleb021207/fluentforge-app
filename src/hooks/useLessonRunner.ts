import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Runs one lesson against the server.
 *
 * The client never sees an answer key: `learn-lesson` returns content without
 * keys, and `submit-exercise` grades the submitted response server-side
 * (through the Tier-0 grader registry) and returns the verdict plus
 * mastery/XP/streak deltas. Wave-1 primitives (cloze / word + chunk retrieval /
 * sentence construction / meaning recognition / error-spot) and Wave-2
 * listening primitives (listening selection / dictation, whose transcripts stay
 * server-side until graded) are dispatched by primitive server-side; this hook
 * just renders and submits their responses.
 */

export interface LearnOption {
  id: string;
  label: string;
}

export interface ContentToken {
  id: string;
  text: string;
}

export interface ClozeBlank {
  id: string;
  mode?: "typed" | "choice";
  options?: { id: string; text: string }[];
}

/** Client-safe render payload (06 §5 `content`); never contains key material. */
export interface ExerciseContent {
  text_tl?: string;
  tokens?: ContentToken[];
  sentence_tl?: ContentToken[];
  blanks?: ClozeBlank[];
  [key: string]: unknown;
}

export interface LearnExercise {
  id: string;
  type: string;
  /** Grader primitive (06 §5) when the serve path provides it; optional. */
  primitive?: string | null;
  prompt: string;
  difficulty: number | null;
  receptive_productive: string | null;
  options: LearnOption[];
  content?: ExerciseContent | null;
}

export interface LearnLesson {
  id: string;
  title: string;
  intro_md: string | null;
  skill: { id: string; title: string; type: string };
  unit: {
    id: string;
    title: string;
    cefr_level: string | null;
    can_do_statement: string | null;
    content_objective: string | null;
    language_objective: string | null;
  };
}

/** The response envelope the client submits (06 §2.1); primitive-specific. */
export interface AttemptResponse {
  selected_option?: string | null;
  text?: string;
  tokens?: string[];
  ordered_tokens?: string[];
  ordered_texts?: string[];
  blanks?: Record<string, string>;
  selected_tokens?: string[];
  corrections?: Record<string, string>;
}

export interface GradeResult {
  correct: boolean;
  /** Continuous grade in [0,1] (06 §E9). */
  score?: number;
  passed?: boolean;
  correct_option_id: string | null;
  /** Revealed answer, post-grade only. */
  expected?: string | string[] | null;
  feedback?: string | null;
  partials?: { part: string; score: number }[] | null;
  explanation: string | null;
  mastery: { mastery: number; ability: number; mastered: boolean; newly_mastered: boolean } | null;
  lesson: { complete: boolean; solved: number; total: number };
  xp_awarded: number;
  xp_reasons: string[];
  streak: { current_streak: number; freeze_used?: boolean } | null;
}

export type RenderKind =
  | "mcq"
  | "text"
  | "cloze"
  | "order"
  | "error_spot"
  | "listening_mcq"
  | "dictation"
  | "unsupported";

const KIND_BY_PRIMITIVE: Record<string, RenderKind> = {
  meaning_recognition: "mcq",
  word_retrieval: "text",
  chunk_retrieval: "text",
  sentence_construction: "order",
  cloze: "cloze",
  error_correction: "error_spot",
  listening_selection: "listening_mcq",
  dictation: "dictation",
};

const KIND_BY_TYPE: Record<string, RenderKind> = {
  flashcard: "mcq",
  listening_mc: "mcq",
  dialogue: "mcq",
  matching: "mcq",
  ordering: "order",
};

/**
 * The renderer to use for an exercise: the served `primitive` wins; otherwise
 * the legacy `type`. Returns "unsupported" when the item lacks the data its
 * renderer needs (so the runner can filter it out rather than show a prompt
 * with no way to answer).
 */
export function renderKind(ex: LearnExercise): RenderKind {
  const hasOptions = Array.isArray(ex.options) && ex.options.length > 0;
  const resolved =
    (ex.primitive && KIND_BY_PRIMITIVE[ex.primitive]) ||
    KIND_BY_TYPE[ex.type] ||
    (hasOptions ? "mcq" : "unsupported");

  switch (resolved) {
    case "mcq":
      return hasOptions ? "mcq" : "unsupported";
    case "listening_mcq":
      return hasOptions ? "listening_mcq" : "unsupported";
    case "order":
      return ex.content?.tokens?.length || hasOptions ? "order" : "unsupported";
    case "cloze":
      return ex.content?.blanks?.length ? "cloze" : "unsupported";
    case "text":
    case "error_spot":
    case "dictation":
      // Text input / prompt-derived tokens are always renderable; dictation
      // needs only the exercise id (audio is fetched server-side by id).
      return resolved;
    default:
      return "unsupported";
  }
}

/** An exercise the player can render AND submit. */
export function isAnswerable(ex: LearnExercise): boolean {
  return renderKind(ex) !== "unsupported";
}

export function useLessonRunner(lessonId?: string) {
  const [lesson, setLesson] = useState<LearnLesson | null>(null);
  const [exercises, setExercises] = useState<LearnExercise[]>([]);
  const [passage, setPassage] = useState<{ title: string | null; body: string } | null>(null);
  const [mastery, setMastery] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!lessonId) return;
    setLoading(true);
    const { data, error: fnError } = await supabase.functions.invoke("learn-lesson", {
      body: { lesson_id: lessonId },
    });
    if (fnError || data?.error) {
      setError(data?.error ?? fnError?.message ?? "Could not load this lesson");
      setLesson(null);
      setExercises([]);
    } else {
      setLesson(data.lesson);
      // Keep every item the player can actually render and submit. MCQ and
      // ordering render from their options; Wave-1 text/cloze/error-spot
      // primitives render when the serve path provides their content. Anything
      // unrenderable is filtered so students never see an unanswerable prompt.
      const answerable = (data.exercises ?? []).filter((ex: LearnExercise) => isAnswerable(ex));
      setExercises(answerable);
      setPassage(data.passage ?? null);
      setMastery(Number(data.mastery ?? 0));
      setError(null);
    }
    setLoading(false);
  }, [lessonId]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = useCallback(
    async (
      exerciseId: string,
      response: AttemptResponse,
      responseMs?: number,
      hintLevel = 0,
    ): Promise<GradeResult | null> => {
      const { data, error: fnError } = await supabase.functions.invoke("submit-exercise", {
        body: {
          exercise_id: exerciseId,
          // Legacy field kept for byte-compatibility with the MCQ grade path.
          option_id: response?.selected_option ?? null,
          response,
          response_ms: responseMs,
          hint_level: hintLevel,
        },
      });
      if (fnError || data?.error) {
        setError(data?.error ?? fnError?.message ?? "Could not submit your answer");
        return null;
      }
      if (data?.mastery) setMastery(Number(data.mastery.mastery));
      return data as GradeResult;
    },
    [],
  );

  return { lesson, exercises, passage, mastery, loading, error, reload: load, submit };
}
