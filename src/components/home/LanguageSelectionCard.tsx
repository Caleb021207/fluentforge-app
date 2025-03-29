
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { AVAILABLE_LANGUAGES } from "@/translations";

interface LanguageSelectionCardProps {
  nativeLanguage: string;
  setNativeLanguage: (lang: string) => void;
  handleLanguageSelection: () => void;
}

const LanguageSelectionCard = ({
  nativeLanguage,
  setNativeLanguage,
  handleLanguageSelection
}: LanguageSelectionCardProps) => {
  const { t } = useLocalization();

  return (
    <Card className="bg-white/90 backdrop-blur shadow-lg mb-8 max-w-md mx-auto">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{t("selectYourLanguage")}</h2>
        <div className="space-y-4 mb-4">
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
          
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-700">{t("learningEnglishOnly")}</p>
          </div>
        </div>
        
        <Button 
          onClick={handleLanguageSelection} 
          className="w-full"
          disabled={!nativeLanguage}
        >
          {t("startLearningEnglish")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;
