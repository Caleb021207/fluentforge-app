
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

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

  // Limited language options
  const LIMITED_LANGUAGES = {
    english: "English",
    spanish: "Spanish",
    portuguese: "Portuguese",
  };

  return (
    <Card className="bg-white/90 backdrop-blur shadow-lg mb-8">
      <CardContent className="pt-6">
        <h2 className="text-xl font-semibold mb-4">{t("selectYourLanguagePreference")}</h2>
        <div className="mb-4">
          <div className="space-y-2">
            <Label htmlFor="nativeLanguage">{t("iSpeak")}</Label>
            <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
              <SelectTrigger id="nativeLanguage" className="w-full">
                <SelectValue placeholder={t("selectYourNativeLanguage")} />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(LIMITED_LANGUAGES).map(([value, label]) => (
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
        
        <Alert variant="info" className="mt-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {t("englishLearningFocus")}
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;
