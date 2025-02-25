
import React, { useState, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import VocabularySet from './vocabulary/VocabularySet';
import FeedbackDisplay from './vocabulary/FeedbackDisplay';
import VocabularyProgress from './vocabulary/VocabularyProgress';
import { playAudio } from './vocabulary/audioUtils';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface VocabularyLessonProps {
  vocabulary: string[];
  onComplete: () => void;
  unitId?: number;
  lessonId?: number;
}

const VocabularyLesson = ({ 
  vocabulary, 
  onComplete, 
  unitId = 0, 
  lessonId = 0 
}: VocabularyLessonProps) => {
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const { toast } = useToast();
  
  // Create a lookup map for quick vocabulary matching
  const vocabMap = useMemo(() => {
    const map = new Map<string, string>();
    vocabulary.forEach(pair => {
      const [word, translation] = pair.split(' - ');
      map.set(word, translation);
    });
    return map;
  }, [vocabulary]);
  
  // Split vocabulary into groups of 6 pairs for each card - memoize this computation
  const vocabGroups = useMemo(() => {
    return vocabulary.reduce((acc, curr, i) => {
      const groupIndex = Math.floor(i / 6);
      if (!acc[groupIndex]) acc[groupIndex] = [];
      acc[groupIndex].push(curr);
      return acc;
    }, [] as string[][]);
  }, [vocabulary]);

  const [selectedWord, setSelectedWord] = useState<{ word: string; groupIndex: number } | null>(null);
  const [selectedTranslation, setSelectedTranslation] = useState<{ translation: string; groupIndex: number } | null>(null);

  // Get current user and load progress on mount
  useEffect(() => {
    const loadUserAndProgress = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        setUserId(user.id);
        
        // Load progress for this lesson
        const { data, error } = await supabase
          .from('vocabulary_progress')
          .select('*')
          .eq('user_id', user.id)
          .eq('unit_id', unitId)
          .eq('lesson_id', lessonId)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          // PGRST116 is "no rows returned" which is expected for new lessons
          console.error('Error loading progress:', error);
          toast({
            title: 'Error loading progress',
            description: 'There was a problem loading your progress.',
            variant: 'destructive',
          });
        }
        
        // If we have saved progress, restore it
        if (data) {
          setScore(data.score);
          setAttempts(data.attempts);
          
          const newMatchedPairs = new Set<string>(data.matched_pairs);
          setMatchedPairs(newMatchedPairs);
          
          toast({
            title: 'Progress Loaded',
            description: 'Your previous progress has been loaded.',
          });
        }
      } catch (error) {
        console.error('Error in loadUserAndProgress:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadUserAndProgress();
  }, [unitId, lessonId, toast]);

  // Save progress whenever it changes
  const saveProgress = async () => {
    if (!userId || matchedPairs.size === 0) return;
    
    setIsSaving(true);
    
    try {
      const matchedPairsArray = Array.from(matchedPairs);
      
      const { error } = await supabase
        .from('vocabulary_progress')
        .upsert({
          user_id: userId,
          unit_id: unitId,
          lesson_id: lessonId,
          matched_pairs: matchedPairsArray,
          score,
          attempts,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id,unit_id,lesson_id'
        });
        
      if (error) {
        console.error('Error saving progress:', error);
        toast({
          title: 'Error Saving Progress',
          description: 'There was a problem saving your progress.',
          variant: 'destructive',
        });
        return;
      }
      
      toast({
        title: 'Progress Saved',
        description: 'Your progress has been saved.',
      });
    } catch (error) {
      console.error('Error in saveProgress:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Debounced save progress when score or attempts change
  useEffect(() => {
    if (userId && matchedPairs.size > 0) {
      const timer = setTimeout(() => {
        saveProgress();
      }, 2000); // Save after 2 seconds of inactivity
      
      return () => clearTimeout(timer);
    }
  }, [score, attempts, matchedPairs.size, userId]);

  const handleSelection = (
    type: 'word' | 'translation',
    value: string,
    groupIndex: number
  ) => {
    if (type === 'word') {
      setSelectedWord({ word: value, groupIndex });
    } else {
      setSelectedTranslation({ translation: value, groupIndex });
    }

    if (
      (type === 'word' && selectedTranslation?.groupIndex === groupIndex) ||
      (type === 'translation' && selectedWord?.groupIndex === groupIndex)
    ) {
      const word = type === 'word' ? value : selectedWord!.word;
      const translation = type === 'translation' ? value : selectedTranslation!.translation;
      
      // Use the map for O(1) lookup instead of iterating through vocabulary
      const isMatch = vocabMap.get(word) === translation;

      if (isMatch) {
        setMatchedPairs(prev => {
          const newSet = new Set(prev);
          newSet.add(word);
          return newSet;
        });
        setScore(prev => prev + 10);
        setShowFeedback('correct');
        
        // Check completion with the updated matchedPairs size
        if (matchedPairs.size + 1 === vocabulary.length) {
          // Force a save before completing
          const saveAndComplete = async () => {
            await saveProgress();
            setTimeout(() => onComplete(), 1200);
          };
          saveAndComplete();
        }
      } else {
        setScore(prev => Math.max(0, prev - 5));
        setShowFeedback('incorrect');
      }

      setAttempts(prev => prev + 1);
      
      // Reset selection after delay
      setTimeout(() => {
        setSelectedWord(null);
        setSelectedTranslation(null);
        setShowFeedback(null);
      }, 1000);
    }
  };

  const progress = (matchedPairs.size / vocabulary.length) * 100;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-12rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-12rem)] px-4">
      <div className="space-y-8 max-w-4xl mx-auto">
        <VocabularyProgress 
          score={score}
          progress={progress}
          matchedCount={matchedPairs.size}
          totalCount={vocabulary.length}
          attempts={attempts}
          isSaving={isSaving}
        />

        <FeedbackDisplay feedbackType={showFeedback} />

        <div className="grid gap-6">
          {vocabGroups.map((group, groupIndex) => {
            // Memoize word and translation arrays at render time
            const words = group.map(pair => pair.split(' - ')[0]);
            const translations = group.map(pair => pair.split(' - ')[1]);
            
            return (
              <VocabularySet
                key={groupIndex}
                groupIndex={groupIndex}
                words={words}
                translations={translations}
                vocabulary={vocabulary}
                matchedPairs={matchedPairs}
                selectedWord={selectedWord}
                selectedTranslation={selectedTranslation}
                handleSelection={handleSelection}
                playAudio={playAudio}
              />
            );
          })}
        </div>
      </div>
    </ScrollArea>
  );
};

export default VocabularyLesson;
