
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AVAILABLE_LANGUAGES } from "@/translations/constants";
import { useLocalization } from "@/context/LocalizationContext";

interface LanguageSelectionCardProps {
  currentLanguage: string;
  onLanguageChange: (language: string) => void;
  getNativeLanguageName: (language: string) => string;
}

const LanguageSelectionCard: React.FC<LanguageSelectionCardProps> = ({
  currentLanguage,
  onLanguageChange,
  getNativeLanguageName
}) => {
  const { t } = useLocalization();
  
  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle>{t("selectLanguage")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Select value={currentLanguage} onValueChange={onLanguageChange}>
          <SelectTrigger>
            <SelectValue placeholder={t("selectLanguage")} />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(AVAILABLE_LANGUAGES).map(([code, name]) => (
              <SelectItem key={code} value={code}>
                {getNativeLanguageName(code)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="mt-2 text-sm text-muted-foreground">
          {t("languagePreferenceNote")}
        </p>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;
