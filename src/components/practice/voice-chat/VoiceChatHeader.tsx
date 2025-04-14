
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";

const VoiceChatHeader = () => {
  const { t, currentLanguage } = useLocalization();
  const { practice } = getLanguagePair(currentLanguage);

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        {t("unlimitedVoicePractice")}
      </h1>
      <p className="text-gray-600 mb-4">
        {t("practiceWithVoiceChat")}
      </p>
      <p className="text-sm text-gray-500 mb-2">
        <strong>{t("aiModel")}</strong> {t("aiModelDescription")}
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-amber-800 text-sm">
          {t("browserBasedTTS")}
        </p>
      </div>
    </div>
  );
};

export default VoiceChatHeader;
