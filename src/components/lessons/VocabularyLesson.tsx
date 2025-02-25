
import React, { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import VocabularySet from './vocabulary/VocabularySet';
import FeedbackDisplay from './vocabulary/FeedbackDisplay';
import VocabularyProgress from './vocabulary/VocabularyProgress';
import { playAudio } from './vocabulary/audioUtils';

interface VocabularyLessonProps {
  vocabulary: string[];
  onComplete: () => void;
}

const VocabularyLesson = ({ vocabulary, onComplete }: VocabularyLessonProps) => {
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set());
  const [attempts, setAttempts] = useState(0);
  const [score, setScore] = useState(0);
  const [showFeedback, setShowFeedback] = useState<'correct' | 'incorrect' | null>(null);
  
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
          // Use setTimeout to ensure state updates complete before calling onComplete
          setTimeout(() => onComplete(), 1200);
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

  return (
    <ScrollArea className="h-[calc(100vh-12rem)] px-4">
      <div className="space-y-8 max-w-4xl mx-auto">
        <VocabularyProgress 
          score={score}
          progress={progress}
          matchedCount={matchedPairs.size}
          totalCount={vocabulary.length}
          attempts={attempts}
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
