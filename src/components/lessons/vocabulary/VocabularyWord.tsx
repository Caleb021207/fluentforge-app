
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Puzzle, Volume2 } from 'lucide-react';
import { motion } from 'framer-motion';

interface VocabularyWordProps {
  word: string;
  isSelected: boolean;
  isMatched: boolean;
  onSelect: () => void;
  onPlayAudio: (word: string) => void;
}

const VocabularyWord: React.FC<VocabularyWordProps> = ({
  word,
  isSelected,
  isMatched,
  onSelect,
  onPlayAudio,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Button
        variant={isSelected ? "default" : "outline"}
        className={`w-full justify-start ${
          isMatched ? "bg-green-100 text-green-800" : ""
        }`}
        onClick={() => !isMatched && onSelect()}
        disabled={isMatched}
      >
        {isMatched ? <Check className="h-4 w-4 mr-2" /> : <Puzzle className="h-4 w-4 mr-2" />}
        {word}
        <Volume2 
          className="ml-auto h-4 w-4 cursor-pointer hover:text-blue-500"
          onClick={(e) => {
            e.stopPropagation();
            onPlayAudio(word);
          }}
        />
      </Button>
    </motion.div>
  );
};

export default VocabularyWord;
