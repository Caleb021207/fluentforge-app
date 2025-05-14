
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type ComplexityLevel = "Novice" | "Intermediate" | "Advanced" | "Superior";

interface ComplexitySelectorProps {
  selectedComplexity: ComplexityLevel | null;
  onSelect: (complexity: ComplexityLevel) => void;
}

const ComplexitySelector: React.FC<ComplexitySelectorProps> = ({ selectedComplexity, onSelect }) => {
  const { t } = useLocalization();

  const complexityLevels = [
    {
      level: "Novice" as ComplexityLevel,
      description: t("noviceLevelDescription"),
      example: t("noviceLevelExample"),
    },
    {
      level: "Intermediate" as ComplexityLevel,
      description: t("intermediateLevelDescription"),
      example: t("intermediateLevelExample"),
    },
    {
      level: "Advanced" as ComplexityLevel,
      description: t("advancedLevelDescription"),
      example: t("advancedLevelExample"),
    },
    {
      level: "Superior" as ComplexityLevel,
      description: t("superiorLevelDescription"),
      example: t("superiorLevelExample"),
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {complexityLevels.map((item) => (
        <Card 
          key={item.level}
          className={`cursor-pointer transition-all ${
            selectedComplexity === item.level 
              ? "border-primary shadow-md" 
              : "hover:border-primary/50"
          }`}
          onClick={() => onSelect(item.level)}
        >
          <CardHeader>
            <CardTitle>{item.level}</CardTitle>
            <CardDescription>{item.description}</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm mb-4 italic">"{item.example}"</p>
            <Button 
              className="w-full"
              variant={selectedComplexity === item.level ? "default" : "outline"}
            >
              {selectedComplexity === item.level 
                ? t("selected") 
                : t("selectThisLevel")}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ComplexitySelector;
