
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface PracticeLevelSelectorProps {
  selectedLevel: string;
  onSelectLevel: (level: string) => void;
}

const PracticeLevelSelector: React.FC<PracticeLevelSelectorProps> = ({
  selectedLevel,
  onSelectLevel
}) => {
  const { t } = useLocalization();

  const levels = [
    { id: "A1", label: t("beginner"), description: t("cefrA1Description") },
    { id: "A2", label: t("elementary"), description: t("cefrA2Description") },
    { id: "B1", label: t("intermediate"), description: t("cefrB1Description") },
    { id: "B2", label: t("upperIntermediate"), description: t("cefrB2Description") }
  ];

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">{t("selectCEFRLevel")}</CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup
          value={selectedLevel}
          onValueChange={onSelectLevel}
          className="grid grid-cols-2 gap-4"
        >
          {levels.map((level) => (
            <div key={level.id} className="flex items-start space-x-2">
              <RadioGroupItem value={level.id} id={`level-${level.id}`} />
              <div className="grid gap-1">
                <Label htmlFor={`level-${level.id}`} className="font-medium">
                  {level.label} ({level.id})
                </Label>
                <p className="text-sm text-muted-foreground">{level.description}</p>
              </div>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
};

export default PracticeLevelSelector;
