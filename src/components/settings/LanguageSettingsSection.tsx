import React from "react";
import { Globe } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUiLanguage } from "@/hooks/useUiLanguage";
import { useLocalization } from "@/contexts/LocalizationContext";

/**
 * Post-login UI-language switcher for the Settings page. Lists every loadable
 * language pack (including Karen, Tigrinya, Burmese, Marathi, and Sinhala,
 * which used to exist but were unselectable). Changing the language persists
 * on this device and updates profiles.native_language for signed-in learners.
 */
const LanguageSettingsSection = () => {
  const { currentLanguage, setUiLanguage, options } = useUiLanguage();
  const { t } = useLocalization();

  // t() returns the key itself when a translation is missing; fall back to
  // readable English rather than a raw key.
  const tr = (key: string, fallback: string) => {
    const value = t(key);
    return value && value !== key ? value : fallback;
  };

  return (
    <Card className="glass border-primary/20">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-primary/10 text-primary mt-1">
            <Globe className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg font-bold">
              {tr("language", "Language")}
            </CardTitle>
            <CardDescription className="mt-1.5 text-sm">
              {tr(
                "languageSettingDescription",
                "Choose the language Palavox uses for menus and instructions.",
              )}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Select value={currentLanguage} onValueChange={setUiLanguage}>
          <SelectTrigger
            className="w-full sm:w-80"
            aria-label={tr("language", "Language")}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-80">
            {options.map((option) => (
              <SelectItem key={option.code} value={option.code}>
                <span className="flex items-baseline gap-2">
                  <span>{option.nativeName}</span>
                  {option.nativeName !== option.englishName && (
                    <span className="text-xs text-muted-foreground">
                      {option.englishName}
                    </span>
                  )}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default LanguageSettingsSection;
