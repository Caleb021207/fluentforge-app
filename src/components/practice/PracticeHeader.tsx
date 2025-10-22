
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";

interface PracticeHeaderProps {
  targetLanguage: string;
}

const PracticeHeader: React.FC<PracticeHeaderProps> = ({ targetLanguage }) => {
  const { currentLanguage, t } = useLocalization();
  
  // Get display name for target language
  const learningLanguage = currentLanguage === "english" 
    ? getLanguageDisplayName(targetLanguage)
    : "English";
  
  return (
    <motion.div 
      className="mb-10 text-center"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.h1 
        className="text-4xl md:text-5xl font-bold mb-4 gradient-text"
        variants={fadeIn}
      >
        {learningLanguage} {t("textPractice")}
      </motion.h1>
      <motion.p 
        className="text-xl md:text-2xl text-muted-foreground"
        variants={fadeIn}
      >
        {t("startChatting")}
      </motion.p>
    </motion.div>
  );
};

export default PracticeHeader;
