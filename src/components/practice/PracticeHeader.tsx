
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";
import { motion } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import { MessageSquare, Sparkles } from "lucide-react";

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
      className="mb-8 text-center relative"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      {/* Decorative elements */}
      <motion.div
        className="absolute -top-4 left-1/2 transform -translate-x-1/2"
        animate={{ rotate: 360 }}
        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
      >
        <Sparkles className="w-8 h-8 text-accent opacity-50" />
      </motion.div>
      
      <motion.h1 
        className="text-4xl md:text-5xl font-bold mb-3 gradient-text flex items-center justify-center gap-3"
        variants={fadeIn}
      >
        <MessageSquare className="w-10 h-10" />
        {learningLanguage} {t("textPractice")}
      </motion.h1>
      <motion.p 
        className="text-xl md:text-2xl text-muted-foreground"
        variants={fadeIn}
      >
        {t("startChatting")} 🚀
      </motion.p>
    </motion.div>
  );
};

export default PracticeHeader;
