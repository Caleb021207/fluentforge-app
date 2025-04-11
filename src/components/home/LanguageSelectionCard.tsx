
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalization } from "@/context/LocalizationContext";
import { getAvailableLanguagePairs, extractLanguagesFromPair, hasStudyMaterialsForPair } from "@/utils/languageUtils";

interface LanguageSelectionCardProps {
  selectedLanguagePair: string;
  setSelectedLanguagePair: (pair: string) => void;
  handleLanguageSelection: () => void;
}

const LanguageSelectionCard = ({
  selectedLanguagePair,
  setSelectedLanguagePair,
  handleLanguageSelection
}: LanguageSelectionCardProps) => {
  const { t } = useLocalization();
  
  // Get all available language pairs
  const LANGUAGE_PAIRS = getAvailableLanguagePairs();
  
  // Check if study materials are available for the selected pair
  const materialsAvailable = hasStudyMaterialsForPair(selectedLanguagePair);
  
  // Extract languages from the pair for display messages
  const { nativeLanguage, targetLanguage } = 
    extractLanguagesFromPair(selectedLanguagePair);

  return (
    <Card className="bg-white/90 backdrop-blur shadow-lg mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{t("selectYourLanguagePreferences")}</h2>
        <div className="grid grid-cols-1 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="languagePair">{t("selectLanguagePair")}</Label>
            <Select value={selectedLanguagePair} onValueChange={setSelectedLanguagePair}>
              <SelectTrigger id="languagePair" className="w-full">
                <SelectValue placeholder={t("selectLanguagePair")} />
              </SelectTrigger>
              <SelectContent>
                {LANGUAGE_PAIRS.map((pair) => (
                  <SelectItem key={pair.id} value={pair.id}>
                    {pair.flag} {pair.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        {selectedLanguagePair && (
          <div className="mb-4">
            {!materialsAvailable && (
              <p className="text-amber-600 text-sm mb-2">
                {t("studyMaterialsComingSoon", {
                  targetLanguage: t(`languages.${targetLanguage}`) || targetLanguage,
                  nativeLanguage: t(`languages.${nativeLanguage}`) || nativeLanguage
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
          disabled={!selectedLanguagePair}
        >
          {t("saveLanguagePreferences")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;
