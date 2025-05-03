
import React from "react";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AVAILABLE_LANGUAGES } from "@/translations/constants";
import { useLocalization } from "@/context/LocalizationContext";

interface LanguageSelectFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label?: string;
  excludeLanguages?: string[];
}

const LanguageSelectField: React.FC<LanguageSelectFieldProps> = ({
  value,
  onChange,
  placeholder,
  label,
  excludeLanguages = []
}) => {
  const { t } = useLocalization();
  
  // Filter out excluded languages
  const availableLanguages = Object.entries(AVAILABLE_LANGUAGES)
    .filter(([key]) => !excludeLanguages.includes(key))
    .sort((a, b) => {
      // Always put English first
      if (a[0] === "english") return -1;
      if (b[0] === "english") return 1;
      
      // Then sort alphabetically by display name
      return a[1].localeCompare(b[1]);
    });

  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-gray-700">{label}</label>}
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {availableLanguages.map(([key, displayName]) => (
              <SelectItem key={key} value={key}>
                {/* Translate language name if possible */}
                {t(key) !== key ? t(key) : displayName}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelectField;
