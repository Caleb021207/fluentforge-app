
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { AVAILABLE_LANGUAGES } from "@/context/LocalizationContext";

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

  return (
    <Card className="bg-white/90 backdrop-blur shadow-lg mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{t("selectYourLanguagePreferences")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="nativeLanguage">{t("iSpeak")}</Label>
            <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
              <SelectTrigger id="nativeLanguage" className="w-full">
                <SelectValue placeholder={t("selectYourNativeLanguage")} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AVAILABLE_LANGUAGES).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="targetLanguage">{t("iWantToLearn")}</Label>
            <Select value={targetLanguage} onValueChange={setTargetLanguage}>
              <SelectTrigger id="targetLanguage" className="w-full">
                <SelectValue placeholder={t("selectLanguageToLearn")} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(AVAILABLE_LANGUAGES).map(([value, label]) => (
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
          disabled={!nativeLanguage || !targetLanguage}
        >
          {t("saveLanguagePreferences")}
        </Button>
        
        {nativeLanguage && targetLanguage && !hasStudyMaterials && (
          <Alert variant="warning" className="mt-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {t("studyMaterialsComingSoon", { 
                nativeLanguage: nativeLanguage, 
                targetLanguage: targetLanguage 
              })}
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;
