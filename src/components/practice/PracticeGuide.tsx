
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
  const learningLanguage = currentLanguage === "english" 
    ? getLanguageDisplayName(targetLanguage) 
    : "English";
  
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={staggeredContainer(0.1, 0.2)}
    >
      <Card className="p-8 border border-border">
        <motion.h2 
          className="text-2xl md:text-3xl font-semibold mb-6 text-foreground"
          variants={slideInRight}
        >
          {t("practiceGuide", { language: learningLanguage })}
        </motion.h2>
        
        <motion.p 
          className="mb-6 text-lg md:text-xl text-foreground"
          variants={slideInRight}
        >
          {t("practiceGuideDescription", { language: learningLanguage })}
        </motion.p>
        
        <motion.ul 
          className="space-y-4"
          variants={staggeredContainer(0.05)}
        >
          {[
            t("practiceTip1"),
            t("practiceTip2"),
            t("practiceTip3"),
            t("practiceTip4"),
            t("practiceTip5")
          ].map((tip, index) => (
            <motion.li 
              key={index} 
              className="flex items-start"
              variants={slideInRight}
            >
              <span className="text-accent mr-3 text-xl">•</span>
              <span className="text-foreground text-lg md:text-xl">{tip}</span>
            </motion.li>
          ))}
        </motion.ul>
      </Card>
    </motion.div>
  );
};

export default PracticeGuide;
