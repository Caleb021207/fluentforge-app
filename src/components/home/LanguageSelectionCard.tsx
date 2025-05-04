
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AVAILABLE_LANGUAGES } from "@/translations/constants";
import { useLocalization } from "@/context/LocalizationContext";
import { getNativeLanguageDisplayName } from "@/utils/languageUtils";

interface LanguageSelectionCardProps {
  nativeLanguage: string;
  targetLanguage: string;
  setNativeLanguage: (language: string) => void;
  setTargetLanguage: (language: string) => void;
  hasStudyMaterials: boolean;
  handleLanguageSelection: () => void;
}

const LanguageSelectionCard: React.FC<LanguageSelectionCardProps> = ({
  nativeLanguage,
  targetLanguage,
  setNativeLanguage,
  setTargetLanguage,
  hasStudyMaterials,
  handleLanguageSelection
}) => {
  const { t } = useLocalization();
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle>{t("selectYourLanguages")}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">{t("nativeLanguage")}</label>
            <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectYourNativeLanguage")} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AVAILABLE_LANGUAGES).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {getNativeLanguageDisplayName(code)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-1">{t("languageToLearn")}</label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectLanguageToLearn")} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AVAILABLE_LANGUAGES).map(([code, name]) => (
                  <SelectItem key={code} value={code}>
                    {getNativeLanguageDisplayName(code)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {nativeLanguage && targetLanguage && !hasStudyMaterials && (
            <div className="text-sm text-amber-500 p-2 bg-amber-50 rounded-md">
              {t("languagePairNotFullySupported")}
            </div>
          )}
          
          <button
            onClick={handleLanguageSelection}
            className="w-full bg-lingua-primary hover:bg-lingua-primary-dark text-white py-2 px-4 rounded transition-colors"
          >
            {t("saveLanguagePreferences")}
          </button>
        </div>
        
        <p className="mt-4 text-sm text-muted-foreground">
          {t("languagePreferenceNote")}
        </p>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;
