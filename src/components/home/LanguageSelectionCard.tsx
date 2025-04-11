
import React, { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalization } from "@/context/LocalizationContext";
import { getAvailableTargetLanguages, hasStudyMaterials } from "@/utils/languageUtils";

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
  
  // Effect to auto-select first available target language when native language changes
  useEffect(() => {
    if (nativeLanguage && availableTargetLanguages.length > 0) {
      // If current target is not available for this native language, reset it
      if (!availableTargetLanguages.includes(targetLanguage)) {
        setTargetLanguage(availableTargetLanguages[0]);
      }
    }
  }, [nativeLanguage, targetLanguage, availableTargetLanguages, setTargetLanguage]);

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

  return (
    <Card className="bg-white/90 backdrop-blur shadow-lg mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{t("selectYourLanguagePreferences")}</h2>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="nativeLanguage">{t("iSpeak")}</Label>
            <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
              <SelectTrigger id="nativeLanguage" className="w-full">
                <SelectValue placeholder={t("selectYourNativeLanguage")} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(NATIVE_LANGUAGE_NAMES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {nativeLanguage && (
            <div className="space-y-2">
              <Label htmlFor="targetLanguage">{t("iWantToLearn")}</Label>
              <Select 
                value={targetLanguage} 
                onValueChange={setTargetLanguage}
                disabled={availableTargetLanguages.length === 0}
              >
                <SelectTrigger id="targetLanguage" className="w-full">
                  <SelectValue placeholder={t("selectLanguageToLearn")} />
                </SelectTrigger>
                <SelectContent>
                  {availableTargetLanguages.map((langCode) => (
                    <SelectItem key={langCode} value={langCode}>
                      {TARGET_LANGUAGE_NAMES[langCode] || langCode}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        
        {nativeLanguage && targetLanguage && (
          <div className="mb-4">
            {!materialsAvailable && (
              <p className="text-amber-600 text-sm mb-2">
                {t("studyMaterialsComingSoon", {
                  targetLanguage: TARGET_LANGUAGE_NAMES[targetLanguage]?.split(" ")[1] || targetLanguage,
                  nativeLanguage: NATIVE_LANGUAGE_NAMES[nativeLanguage]?.split(" ")[1] || nativeLanguage
                })}
                <br />
                {t("someFeaturesLimited")}
              </p>
            )}
          </div>
        )}
        
        <Button 
          onClick={handleLanguageSelection} 
          className="w-full"
          disabled={!nativeLanguage || !targetLanguage}
        >
          {t("saveLanguagePreferences")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;
