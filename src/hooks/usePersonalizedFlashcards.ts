import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface PersonalizedFlashcard {
  id: string;
  student_id: string;
  term: string;
  definition: string;
  example: string | null;
  category: string;
  source_type: string;
  cefr_level: string | null;
  mastery_level: number;
  next_due: string;
  last_reviewed: string | null;
  review_count: number;
  created_at: string;
}

export const usePersonalizedFlashcards = () => {
  const [flashcards, setFlashcards] = useState<PersonalizedFlashcard[]>([]);
  const [dueCards, setDueCards] = useState<PersonalizedFlashcard[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUserId(user?.id || null);
    };
    getUser();
  }, []);

  const fetchFlashcards = useCallback(async () => {
    if (!userId) return;

    try {
      const { data, error } = await supabase
        .from('personalized_flashcards')
        .select('*')
        .eq('student_id', userId)
        .order('next_due', { ascending: true });

      if (error) throw error;

      const cards = (data || []) as PersonalizedFlashcard[];
      setFlashcards(cards);

      // Filter cards that are due for review
      const now = new Date();
      const due = cards.filter(card => new Date(card.next_due) <= now);
      setDueCards(due);
    } catch (error) {
      console.error('Error fetching flashcards:', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchFlashcards();
    }
  }, [userId, fetchFlashcards]);

  const generateFlashcards = async () => {
    if (!userId) return;

    setGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-personalized-flashcards', {
        body: { studentId: userId, maxCards: 10 }
      });

      if (error) throw error;

      if (data.success && data.count > 0) {
        toast.success(`Generated ${data.count} new flashcards!`);
        await fetchFlashcards();
      } else if (data.message) {
        toast.info(data.message);
      }
    } catch (error) {
      console.error('Error generating flashcards:', error);
      toast.error('Failed to generate flashcards');
    } finally {
      setGenerating(false);
    }
  };

  const updateMastery = async (flashcardId: string, quality: number) => {
    try {
      const { error } = await supabase.rpc('update_flashcard_mastery', {
        p_flashcard_id: flashcardId,
        p_quality: quality
      });

      if (error) throw error;

      await fetchFlashcards();
    } catch (error) {
      console.error('Error updating mastery:', error);
      toast.error('Failed to update card progress');
    }
  };

  const deleteFlashcard = async (flashcardId: string) => {
    try {
      const { error } = await supabase
        .from('personalized_flashcards')
        .delete()
        .eq('id', flashcardId);

      if (error) throw error;

      setFlashcards(prev => prev.filter(c => c.id !== flashcardId));
      setDueCards(prev => prev.filter(c => c.id !== flashcardId));
      toast.success('Flashcard deleted');
    } catch (error) {
      console.error('Error deleting flashcard:', error);
      toast.error('Failed to delete flashcard');
    }
  };

  const stats = {
    total: flashcards.length,
    due: dueCards.length,
    mastered: flashcards.filter(c => c.mastery_level >= 4).length,
    learning: flashcards.filter(c => c.mastery_level > 0 && c.mastery_level < 4).length,
    new: flashcards.filter(c => c.mastery_level === 0).length,
  };

  return {
    flashcards,
    dueCards,
    loading,
    generating,
    stats,
    fetchFlashcards,
    generateFlashcards,
    updateMastery,
    deleteFlashcard,
  };
};
