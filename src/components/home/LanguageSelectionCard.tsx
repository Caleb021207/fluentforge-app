
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
    cantonese: "🇭🇰 廣東話",
    vietnamese: "🇻🇳 Tiếng Việt",
    french: "🇫🇷 Français",
    japanese: "🇯🇵 日本語",
    russian: "🇷🇺 Русский",
    ukrainian: "🇺🇦 Українська",
    hindi: "🇮🇳 हिन्दी",
    indonesian: "🇮🇩 Bahasa Indonesia",
    farsi: "🇮🇷 فارسی",
    urdu: "🇵🇰 اردو",
    pashto: "🇦🇫 پښتو",
    swahili: "🇰🇪 Kiswahili",
    bengali: "🇧🇩 বাংলা",
    somali: "🇸🇴 Soomaali",
    yoruba: "🇳🇬 Yorùbá",
    amharic: "🇪🇹 አማርኛ",
    malayalam: "🇮🇳 മലയാളം",
    polish: "🇵🇱 Polski",
    turkish: "🇹🇷 Türkçe",
    romanian: "🇷🇴 Română",
    haitian: "🇭🇹 Kreyòl Ayisyen",
    igbo: "🇳🇬 Igbo",
    tagalog: "🇵🇭 Tagalog",
    german: "🇩🇪 Deutsch",
    italian: "🇮🇹 Italiano",
    thai: "🇹🇭 ภาษาไทย",
    // Re-adding the previously removed languages
    gujarati: "🇮🇳 ગુજરાતી",
    punjabi: "🇮🇳 ਪੰਜਾਬੀ",
    nepali: "🇳🇵 नेपाली",
  };

  // Available target languages based on native language
  const availableTargetLanguages = getAvailableTargetLanguages(nativeLanguage);
  
  // Target language flags and names mapping
  const TARGET_LANGUAGE_NAMES = {
    english: "🇺🇸 English",
    spanish: "🇪🇸 Spanish",
    portuguese: "🇧🇷 Portuguese",
    korean: "🇰🇷 Korean",
    arabic: "🇸🇦 Arabic",
    mandarin: "🇨🇳 Mandarin Chinese",
    vietnamese: "🇻🇳 Vietnamese",
    french: "🇫🇷 French",
    japanese: "🇯🇵 Japanese",
    russian: "🇷🇺 Russian",
    ukrainian: "🇺🇦 Ukrainian",
    hindi: "🇮🇳 Hindi",
    indonesian: "🇮🇩 Indonesian",
    farsi: "🇮🇷 Farsi/Dari",
    urdu: "🇵🇰 Urdu",
    pashto: "🇦🇫 Pashto",
    swahili: "🇰🇪 Swahili",
    bengali: "🇧🇩 Bengali",
    somali: "🇸🇴 Somali",
    yoruba: "🇳🇬 Yoruba",
    amharic: "🇪🇹 Amharic",
    malayalam: "🇮🇳 Malayalam",
    polish: "🇵🇱 Polish",
    turkish: "🇹🇷 Turkish",
    romanian: "🇷🇴 Romanian",
    haitian: "🇭🇹 Haitian Creole",
    igbo: "🇳🇬 Igbo",
    tagalog: "🇵🇭 Filipino/Tagalog",
    german: "🇩🇪 German",
    italian: "🇮🇹 Italian",
    thai: "🇹🇭 Thai",
    // Re-adding the previously removed languages
    gujarati: "🇮🇳 Gujarati",
    punjabi: "🇮🇳 Punjabi",
    nepali: "🇳🇵 Nepali",
  };
  
  // Determine disabled options based on native language
  const disabledTargetLanguages = nativeLanguage === 'english' 
    ? ['french'] 
    : [];
  
  // Effect to auto-select first available target language when native language changes
  useEffect(() => {
    if (nativeLanguage && availableTargetLanguages.length > 0) {
      if (!availableTargetLanguages.includes(targetLanguage)) {
        setTargetLanguage(availableTargetLanguages[0]);
      }
    }
  }, [nativeLanguage, targetLanguage, availableTargetLanguages, setTargetLanguage]);

  // Create target language options based on available languages
  const targetLanguageOptions = Object.fromEntries(
    availableTargetLanguages.map(lang => [lang, TARGET_LANGUAGE_NAMES[lang] || lang])
  );

  return (
    <Card className="backdrop-blur shadow-lg mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4 text-foreground">{t("selectYourLanguagePreferences")}</h2>
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
              disabledOptions={disabledTargetLanguages}
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
          disabled={!nativeLanguage || !targetLanguage}
        >
          {t("saveLanguagePreferences")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;
