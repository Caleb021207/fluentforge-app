
import React from 'react';
import { motion } from 'framer-motion';

interface FeedbackDisplayProps {
  feedbackType: 'correct' | 'incorrect' | null;
}

const FeedbackDisplay: React.FC<FeedbackDisplayProps> = ({ feedbackType }) => {
  if (!feedbackType) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`text-center p-4 rounded-lg ${
        feedbackType === 'correct' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
      }`}
    >
      {feedbackType === 'correct' ? "¡Correcto! 🎉" : "¡Inténtalo de nuevo! 💪"}
    </motion.div>
  );
};

export default FeedbackDisplay;
