
import React, { useState } from 'react';
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
  
  // Split vocabulary into groups of 6 pairs for each card
  const vocabGroups = vocabulary.reduce((acc, curr, i) => {
    const groupIndex = Math.floor(i / 6);
    if (!acc[groupIndex]) acc[groupIndex] = [];
    acc[groupIndex].push(curr);
    return acc;
  }, [] as string[][]);

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
      
      const isMatch = vocabulary.some(pair => {
        const [w, t] = pair.split(' - ');
        return (w === word && t === translation);
      });

      if (isMatch) {
        setMatchedPairs(prev => new Set([...prev, word]));
        setScore(prev => prev + 10);
        setShowFeedback('correct');
        if (matchedPairs.size + 1 === vocabulary.length) {
          onComplete();
        }
      } else {
        setScore(prev => Math.max(0, prev - 5));
        setShowFeedback('incorrect');
      }

      setAttempts(prev => prev + 1);
      
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
