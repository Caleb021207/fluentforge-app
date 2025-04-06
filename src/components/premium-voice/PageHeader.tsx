
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";

interface PageHeaderProps {
  practice?: string; // Made optional to handle default from language pair
}

const PageHeader = ({ practice }: PageHeaderProps) => {
  const { t, currentLanguage } = useLocalization();
  
  // Get the language pair based on current language
  const languagePair = getLanguagePair(currentLanguage);
  
  // Use provided practice language or fall back to the one from language pair
  const practiceLanguage = practice || languagePair.practice;

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        {t("premiumVoiceTitle")}
      </h1>
      <p className="text-gray-600 mb-4">
        {t("premiumVoiceChatDescription", { practice: practiceLanguage })}
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-amber-800 text-sm font-normal">
          {t("premiumVoiceNoteWithReset")}
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
