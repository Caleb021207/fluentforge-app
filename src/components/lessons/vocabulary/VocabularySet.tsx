
import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import VocabularyWord from './VocabularyWord';
import VocabularyTranslation from './VocabularyTranslation';

interface VocabularySetProps {
  groupIndex: number;
  words: string[];
  translations: string[];
  vocabulary: string[];
  matchedPairs: Set<string>;
  selectedWord: { word: string; groupIndex: number } | null;
  selectedTranslation: { translation: string; groupIndex: number } | null;
  handleSelection: (type: 'word' | 'translation', value: string, groupIndex: number) => void;
  playAudio: (text: string) => void;
}

const VocabularySet: React.FC<VocabularySetProps> = ({
  groupIndex,
  words,
  translations,
  vocabulary,
  matchedPairs,
  selectedWord,
  selectedTranslation,
  handleSelection,
  playAudio,
}) => {
  // Create a translation lookup map for quick matching checks
  const translationMatchMap = useMemo(() => {
    const map = new Map<string, string>();
    vocabulary.forEach(pair => {
      const [word, translation] = pair.split(' - ');
      map.set(translation, word);
    });
    return map;
  }, [vocabulary]);

  // Check if a translation is matched using the lookup map
  const isTranslationMatched = (translation: string) => {
    const word = translationMatchMap.get(translation);
    return word ? matchedPairs.has(word) : false;
  };

  return (
    <Card key={groupIndex} className="p-4">
      <CardHeader>
        <CardTitle className="text-lg">Set {groupIndex + 1}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="font-medium mb-2">Spanish Words</h4>
            {words.map((word) => (
              <VocabularyWord
                key={word}
                word={word}
                isSelected={selectedWord?.word === word}
                isMatched={matchedPairs.has(word)}
                onSelect={() => handleSelection('word', word, groupIndex)}
                onPlayAudio={playAudio}
              />
            ))}
          </div>

          <div className="space-y-2">
            <h4 className="font-medium mb-2">English Translations</h4>
            {translations.map((translation) => (
              <VocabularyTranslation
                key={translation}
                translation={translation}
                isSelected={selectedTranslation?.translation === translation}
                isMatched={isTranslationMatched(translation)}
                onSelect={() => handleSelection('translation', translation, groupIndex)}
              />
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default React.memo(VocabularySet);
