
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
      className="mb-8 text-center"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <motion.h1 
        className="text-3xl font-bold mb-2 text-foreground"
        variants={fadeIn}
      >
        {learningLanguage} {t("textPractice")}
      </motion.h1>
      <motion.p 
        className="text-muted-foreground"
        variants={fadeIn}
      >
        {t("startChatting")}
      </motion.p>
    </motion.div>
  );
};

export default PracticeHeader;
