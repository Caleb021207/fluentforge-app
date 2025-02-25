
import React from 'react';
import { Button } from '@/components/ui/button';
import { Check, Puzzle } from 'lucide-react';
import { motion } from 'framer-motion';

interface VocabularyTranslationProps {
  translation: string;
  isSelected: boolean;
  isMatched: boolean;
  onSelect: () => void;
}

const VocabularyTranslation: React.FC<VocabularyTranslationProps> = ({
  translation,
  isSelected,
  isMatched,
  onSelect,
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
        {translation}
      </Button>
    </motion.div>
  );
};

export default VocabularyTranslation;
