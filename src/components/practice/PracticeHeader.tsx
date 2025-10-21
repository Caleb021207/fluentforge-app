
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import { MessageSquare } from "lucide-react";

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
      <motion.div
        className="inline-flex items-center justify-center gap-3 mb-4"
        variants={fadeIn}
      >
        <div className="p-3 bg-accent/10 rounded-xl">
          <MessageSquare className="w-8 h-8 text-accent" />
        </div>
      </motion.div>
      
      <motion.h1 
        className="text-4xl md:text-5xl font-bold mb-3 text-foreground"
        variants={fadeIn}
      >
        {learningLanguage} {t("textPractice")}
      </motion.h1>
      <motion.p 
        className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
        variants={fadeIn}
      >
        {t("startChatting")}
      </motion.p>
    </motion.div>
  );
};

export default PracticeHeader;
