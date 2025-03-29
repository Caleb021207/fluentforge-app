
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LanguagePair } from "./ProgressDataProcessor";
import { useLocalization } from "@/context/LocalizationContext";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getLanguageName } from "./hooks/useProgressData";

interface LanguagePairSelectorProps {
  languagePairs: LanguagePair[];
  selectedPairKey: string | null;
  onPairChange: (pairKey: string) => void;
}

const LanguagePairSelector = ({ 
  languagePairs, 
  selectedPairKey, 
  onPairChange 
}: LanguagePairSelectorProps) => {
  const { t } = useLocalization();

  if (languagePairs.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("selectLanguagePair")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Select
          value={selectedPairKey || ''}
          onValueChange={onPairChange}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder={t("selectLanguagePair")} />
          </SelectTrigger>
          <SelectContent>
            {languagePairs.map((pair, index) => (
              <SelectItem 
                key={index} 
                value={`${pair.sourceLanguage}-${pair.targetLanguage}`}
              >
                {getLanguageName(pair.sourceLanguage)} → {getLanguageName(pair.targetLanguage)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
};

export default LanguagePairSelector;
