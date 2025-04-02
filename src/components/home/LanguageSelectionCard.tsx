
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalization } from "@/context/LocalizationContext";

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
  hasStudyMaterials,
  handleLanguageSelection
}: LanguageSelectionCardProps) => {
  const { t } = useLocalization();

  // Languages in their native names
  const NATIVE_LANGUAGE_NAMES = {
    english: "English",
    spanish: "Español",
    portuguese: "Português",
    korean: "한국어",
    arabic: "العربية",
    mandarin: "中文",
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
        </div>
        
        <Button 
          onClick={handleLanguageSelection} 
          className="w-full"
          disabled={!nativeLanguage}
        >
          {t("saveLanguagePreferences")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;
