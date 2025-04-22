
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { getAvailableTargetLanguages } from "@/utils/languageUtils";
import LanguageSelectField from "./language/LanguageSelectField";
import LanguageAvailabilityWarning from "./language/LanguageAvailabilityWarning";

interface LanguageSelectionCardProps {
  nativeLanguage: string;
  targetLanguage: string;
  setNativeLanguage: (lang: string) => void;
  setTargetLanguage: (lang: string) => void;
  hasStudyMaterials: boolean;
  handleLanguageSelection: () => void;
}

const LanguageSelectionCard = ({
  nativeLanguage,
  targetLanguage,
  setNativeLanguage,
  setTargetLanguage,
  hasStudyMaterials: materialsAvailable,
  handleLanguageSelection
}: LanguageSelectionCardProps) => {
  const { t } = useLocalization();

  // Languages in their native names with flag emojis
  const NATIVE_LANGUAGE_NAMES = {
    english: "🇺🇸 English",
    spanish: "🇪🇸 Español",
    portuguese: "🇧🇷 Português",
    korean: "🇰🇷 한국어",
    arabic: "🇸🇦 العربية",
    mandarin: "🇨🇳 中文",
    vietnamese: "🇻🇳 Tiếng Việt",
    french: "🇫🇷 Français",
    japanese: "🇯🇵 日本語",
    russian: "🇷🇺 Русский",
    ukrainian: "🇺🇦 Українська",
    hindi: "🇮🇳 हिन्दी",
    indonesian: "🇮🇩 Bahasa Indonesia"
  };

  // Available target languages based on native language
  const availableTargetLanguages = getAvailableTargetLanguages(nativeLanguage);

  // Detect if we need to disable French (only for English speakers)
  const isEnglishNative = nativeLanguage === "english";
  const shouldDisableFrench =
    isEnglishNative && availableTargetLanguages.includes("french");

  // Target language flags and names mapping
  const TARGET_LANGUAGE_NAMES = {
    english: "🇺🇸 English",
    spanish: "🇪🇸 Spanish",
    portuguese: "🇧🇷 Portuguese",
    korean: "🇰🇷 Korean",
    arabic: "🇸🇦 Arabic",
    mandarin: "🇨🇳 Mandarin",
    vietnamese: "🇻🇳 Vietnamese",
    french: "🇫🇷 French",
    japanese: "🇯🇵 Japanese",
    russian: "🇷🇺 Russian",
    ukrainian: "🇺🇦 Ukrainian",
    hindi: "🇮🇳 Hindi",
    indonesian: "🇮🇩 Indonesian"
  };

  // Effect to auto-select first available target language when native language changes
  useEffect(() => {
    if (nativeLanguage && availableTargetLanguages.length > 0) {
      // If the current target language is now unavailable, pick the first enabled one
      if (!availableTargetLanguages.includes(targetLanguage)) {
        setTargetLanguage(availableTargetLanguages[0]);
      }
      // If English and target is French (disabled), pick Spanish
      if (
        isEnglishNative &&
        targetLanguage === "french"
      ) {
        setTargetLanguage("spanish");
      }
    }
  }, [nativeLanguage, targetLanguage, availableTargetLanguages, setTargetLanguage]);

  // Create target language options based on available languages,
  // mark French as disabled if user is English speaker.
  const targetLanguageOptions = availableTargetLanguages.map(lang => ({
    value: lang,
    label: TARGET_LANGUAGE_NAMES[lang] || lang,
    disabled: lang === "french" && shouldDisableFrench
  }));

  return (
    <Card className="bg-white/90 backdrop-blur shadow-lg mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{t("selectYourLanguagePreferences")}</h2>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <LanguageSelectField
            id="nativeLanguage"
            value={nativeLanguage}
            onChange={setNativeLanguage}
            label={t("iSpeak")}
            placeholder={t("selectYourNativeLanguage")}
            options={NATIVE_LANGUAGE_NAMES}
          />

          {nativeLanguage && (
            <div>
              <label htmlFor="targetLanguage" className="block text-sm font-medium text-gray-700 mb-1">
                {t("iWantToLearn")}
              </label>
              <select
                id="targetLanguage"
                value={targetLanguage}
                onChange={e => setTargetLanguage(e.target.value)}
                className="w-full appearance-none border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-primary focus:outline-none text-base bg-white"
                disabled={availableTargetLanguages.length === 0}
              >
                <option value="" disabled>{t("selectLanguageToLearn")}</option>
                {targetLanguageOptions.map(opt => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    disabled={opt.disabled}
                  >
                    {opt.label}
                    {opt.disabled ? " (Coming Soon)" : ""}
                  </option>
                ))}
              </select>
              {shouldDisableFrench && (
                <div className="text-amber-600 text-xs mt-1">
                  {t("studyMaterialsComingSoon", {
                    targetLanguage: t("languages.french") || "French",
                    nativeLanguage: t("languages.english") || "English"
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {nativeLanguage && targetLanguage && !materialsAvailable && (
          <div className="mb-4">
            <LanguageAvailabilityWarning
              targetLanguage={targetLanguage}
              nativeLanguage={nativeLanguage}
              targetLanguageNames={TARGET_LANGUAGE_NAMES}
              nativeLanguageNames={NATIVE_LANGUAGE_NAMES}
            />
          </div>
        )}

        <Button 
          onClick={handleLanguageSelection} 
          className="w-full"
          disabled={
            !nativeLanguage ||
            !targetLanguage ||
            (isEnglishNative && targetLanguage === "french")
          }
        >
          {t("saveLanguagePreferences")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;

