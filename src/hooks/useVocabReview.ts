import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * FSRS-scheduled vocabulary review.
 *
 * The queue and every scheduling decision come from the `vocab-review` edge
 * function; the browser only reports how well the learner recalled the word.
 */

export interface ReviewVocab {
  id: string;
  lemma: string;
  translation_l1: string | null;
  part_of_speech: string | null;
  cefr_level: string | null;
  example_sentence: string | null;
  ipa: string | null;
}

export interface ReviewCard {
  vocabulary: ReviewVocab;
  state: number;
  due: string | null;
  reps: number;
  lapses: number;
  is_new: boolean;
}

export type ReviewRating = 1 | 2 | 3 | 4;

export function useVocabReview() {
  const [cards, setCards] = useState<ReviewCard[]>([]);
  const [dueCount, setDueCount] = useState(0);
  const [newCount, setNewCount] = useState(0);
  const [retention, setRetention] = useState(0.88);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    const { data, error: fnError } = await supabase.functions.invoke("vocab-review", {
      body: { action: "queue" },
    });
    if (fnError || data?.error) {
      setError(data?.error ?? fnError?.message ?? "Could not load your review queue");
      setCards([]);
    } else {
      setCards(data.cards ?? []);
      setDueCount(data.due ?? 0);
      setNewCount(data.new ?? 0);
      setRetention(data.retention ?? 0.88);
      setError(null);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const grade = useCallback(async (vocabularyId: string, rating: ReviewRating) => {
    const { data, error: fnError } = await supabase.functions.invoke("vocab-review", {
      body: { action: "grade", vocabulary_id: vocabularyId, rating },
    });
    if (fnError || data?.error) {
      setError(data?.error ?? fnError?.message ?? "Could not save your review");
      return null;
    }
    return data as {
      due: string;
      scheduled_days: number;
      xp_awarded: number;
      streak: { current_streak: number } | null;
    };
  }, []);

  return { cards, dueCount, newCount, retention, loading, error, reload: load, grade };
}
