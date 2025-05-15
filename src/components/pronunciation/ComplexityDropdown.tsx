
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type ComplexityLevel = "Novice" | "Intermediate" | "Advanced" | "Superior";

interface ComplexityDropdownProps {
  selectedComplexity: ComplexityLevel | null;
  onSelect: (complexity: ComplexityLevel) => void;
}

const ComplexityDropdown: React.FC<ComplexityDropdownProps> = ({
  selectedComplexity,
  onSelect,
}) => {
  const { t } = useLocalization();

  const handleValueChange = (value: string) => {
    onSelect(value as ComplexityLevel);
  };

  return (
    <div className="w-full mb-6">
      <label className="text-sm font-medium mb-2 block">
        {t("selectComplexityLevel")}
      </label>
      <Select
        value={selectedComplexity || undefined}
        onValueChange={handleValueChange}
      >
        <SelectTrigger className="w-full">
          <SelectValue placeholder={t("selectComplexityLevel")} />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Novice">
            {t("novice")} - {t("noviceLevelShortDescription")}
          </SelectItem>
          <SelectItem value="Intermediate">
            {t("intermediate")} - {t("intermediateLevelShortDescription")}
          </SelectItem>
          <SelectItem value="Advanced">
            {t("advanced")} - {t("advancedLevelShortDescription")}
          </SelectItem>
          <SelectItem value="Superior">
            {t("superior")} - {t("superiorLevelShortDescription")}
          </SelectItem>
        </SelectContent>
      </Select>
      {!selectedComplexity && (
        <p className="text-sm text-muted-foreground mt-2">
          {t("selectLevelToStart")}
        </p>
      )}
    </div>
  );
};

export default ComplexityDropdown;
