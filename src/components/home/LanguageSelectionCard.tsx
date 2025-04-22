
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

  const availableTargetLanguages = getAvailableTargetLanguages(nativeLanguage);

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
      // Don't auto-select if first available is disabled
      const valid = availableTargetLanguages.find(lang =>
        !(nativeLanguage.toLowerCase() === "english" && lang === "french")
      );
      if (!availableTargetLanguages.includes(targetLanguage) || (nativeLanguage.toLowerCase() === "english" && targetLanguage === "french")) {
        setTargetLanguage(valid || "");
      }
    }
  }, [nativeLanguage, targetLanguage, availableTargetLanguages, setTargetLanguage]);

  // Build select options: as array for supporting "disabled"
  let targetLanguageOptions: { value: string; label: string; disabled?: boolean }[] = [];
  if (nativeLanguage.toLowerCase() === "english") {
    targetLanguageOptions = [
      {
        value: "spanish",
        label: TARGET_LANGUAGE_NAMES["spanish"]
      },
      {
        value: "french",
        label: "🇫🇷 French (under development)",
        disabled: true
      }
    ];
  } else {
    targetLanguageOptions = availableTargetLanguages.map(lang => ({
      value: lang,
      label: TARGET_LANGUAGE_NAMES[lang] || lang
    }));
  }

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
            <LanguageSelectField
              id="targetLanguage"
              value={targetLanguage}
              onChange={setTargetLanguage}
              label={t("iWantToLearn")}
              placeholder={t("selectLanguageToLearn")}
              options={targetLanguageOptions}
              disabled={availableTargetLanguages.length === 0}
            />
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
            (nativeLanguage.toLowerCase() === "english" && targetLanguage === "french")
          }
        >
          {t("saveLanguagePreferences")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;
