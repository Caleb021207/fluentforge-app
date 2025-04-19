
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { hasStudyMaterials } from "@/utils/languageUtils";
import LanguageSelectField from "./language/LanguageSelectField";
import LanguageAvailabilityWarning from "./language/LanguageAvailabilityWarning";

interface LanguageSelectionCardProps {
  selectedPair: string;
  setSelectedPair: (pair: string) => void;
  hasStudyMaterials: boolean;
  handleLanguageSelection: () => void;
}

const LanguageSelectionCard = ({
  selectedPair,
  setSelectedPair,
  hasStudyMaterials: materialsAvailable,
  handleLanguageSelection
}: LanguageSelectionCardProps) => {
  const { t } = useLocalization();

  // Languages in their native names with flag emojis and target languages
  const LANGUAGE_PAIRS = {
    "english-spanish": "🇺🇸 English (Learn Spanish)",
    "english-french": "🇺🇸 English (Learn French)",
    "spanish-english": "🇪🇸 Español (Learn English)",
    "french-english": "🇫🇷 Français (Learn English)",
    "portuguese-english": "🇧🇷 Português (Learn English)",
    "korean-english": "🇰🇷 한국어 (Learn English)",
    "arabic-english": "🇸🇦 العربية (Learn English)",
    "mandarin-english": "🇨🇳 中文 (Learn English)",
    "vietnamese-english": "🇻🇳 Tiếng Việt (Learn English)",
    "japanese-english": "🇯🇵 日本語 (Learn English)",
    "russian-english": "🇷🇺 Русский (Learn English)",
    "ukrainian-english": "🇺🇦 Українська (Learn English)",
    "hindi-english": "🇮🇳 हिन्दी (Learn English)",
    "indonesian-english": "🇮🇩 Bahasa Indonesia (Learn English)"
  };

  return (
    <Card className="bg-white/90 backdrop-blur shadow-lg mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{t("selectYourLanguagePreferences")}</h2>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <LanguageSelectField
            id="languagePair"
            value={selectedPair}
            onChange={setSelectedPair}
            label={t("iSpeak")}
            placeholder={t("selectYourLanguagePair")}
            options={LANGUAGE_PAIRS}
          />
        </div>
        
        {selectedPair && !materialsAvailable && (
          <div className="mb-4">
            <LanguageAvailabilityWarning
              selectedPair={selectedPair}
              languagePairs={LANGUAGE_PAIRS}
            />
          </div>
        )}
        
        <Button 
          onClick={handleLanguageSelection} 
          className="w-full"
          disabled={!selectedPair}
        >
          {t("saveLanguagePreferences")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;
