
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";

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
      <h1 className="text-3xl font-bold mb-2 text-foreground">
        {learningLanguage} {t("practice")}
      </h1>
      <p className="text-muted-foreground">
        {currentLanguage === "tagalog" 
          ? "Simulan ang pakikipag-usap sa iyong AI na guro sa wika!" // Tagalog text for practice description
          : t("startChatting")}
      </p>
    </div>
  );
};

export default PracticeHeader;
