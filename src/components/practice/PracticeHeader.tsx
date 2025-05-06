
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";
import { FoxLogo } from "@/components/ui/fox-components";
import { motion } from "framer-motion";

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
    <div className="mb-8 text-center">
      <div className="flex items-center justify-center gap-3 mb-4">
        <FoxLogo size="md" />
        <motion.h1 
          className="text-3xl font-bold text-foreground"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {learningLanguage} {t("practice")}
        </motion.h1>
      </div>
      <p className="text-muted-foreground">
        {currentLanguage === "tagalog" 
          ? "Simulan ang pakikipag-usap sa iyong AI na guro sa wika!" // Tagalog text for practice description
          : t("startChatting")}
      </p>
    </div>
  );
};

export default PracticeHeader;
