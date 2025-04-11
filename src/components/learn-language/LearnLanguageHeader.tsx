
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

interface LearnLanguageHeaderProps {
  language: string;
}

const LearnLanguageHeader: React.FC<LearnLanguageHeaderProps> = ({ language }) => {
  const { t } = useLocalization();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        {t("practiceYourLanguage", { language })}
      </h1>
      <p className="text-gray-600 mb-4">
        Practice speaking {language} with our AI tutor. Speak directly into your microphone and 
        receive responses in {language}. Perfect for building your conversational skills!
      </p>
      <p className="text-sm text-gray-500 mb-2">
        <strong>Practice Level:</strong> B1 (Intermediate) - Can handle most situations while traveling 
        in an area where the language is spoken.
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-amber-800 text-sm">
          {t("browserBasedTTS")}
        </p>
      </div>
    </div>
  );
};

export default LearnLanguageHeader;
