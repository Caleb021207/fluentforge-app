
import React from "react";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";
import { motion } from "framer-motion";
import { staggeredContainer, slideInRight } from "@/lib/animations";

interface PracticeGuideProps {
  targetLanguage: string;
}

const PracticeGuide: React.FC<PracticeGuideProps> = ({ targetLanguage }) => {
  const { currentLanguage, t } = useLocalization();
  
  // Get localized target language name
  const learningLanguage = getLanguageDisplayName(targetLanguage);
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggeredContainer(0.1, 0.2)}
    >
      <Card className="p-6 border border-border">
        <motion.h2 
          className="text-xl font-semibold mb-4 text-foreground"
          variants={slideInRight}
        >
          {t("practiceGuide") || "Practice Guide"}
        </motion.h2>
        
        <motion.p 
          className="mb-4 text-foreground"
          variants={slideInRight}
        >
          {t("practiceGuideDescription", { language: learningLanguage }) || 
           `Tips for practicing your ${learningLanguage} effectively:`}
        </motion.p>
        
        <motion.ul 
          className="space-y-3"
          variants={staggeredContainer(0.05)}
        >
          {[
            t("practiceTip1") || "Try to form complete sentences, even if they're simple.",
            t("practiceTip2") || "Don't worry about mistakes — they're part of learning!",
            t("practiceTip3") || "Ask for explanations if there's something you don't understand.",
            t("practiceTip4") || "Use words you've recently learned.",
            t("practiceTip5") || "Our AI will adapt to your skill level and gradually help you improve."
          ].map((tip, index) => (
            <motion.li 
              key={index} 
              className="flex items-start"
              variants={slideInRight}
            >
              <span className="text-accent mr-2">•</span>
              <span className="text-foreground">{tip}</span>
            </motion.li>
          ))}
        </motion.ul>
      </Card>
    </motion.div>
  );
};

export default PracticeGuide;
