import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/hooks/useLocalization";

interface LanguageSelectionCardProps {
  language: string;
  onSelect: (language: string) => void;
  isSelected: boolean;
}

const LanguageSelectionCard: React.FC<LanguageSelectionCardProps> = ({
  language,
  onSelect,
  isSelected,
}) => {
  const { getNativeLanguageName } = useLocalization();
  const nativeName = getNativeLanguageName(language);

  return (
    <Card
      className={`w-48 cursor-pointer ${
        isSelected ? "border-2 border-primary" : "border"
      }`}
      onClick={() => onSelect(language)}
    >
      <CardHeader>
        <CardTitle>{nativeName}</CardTitle>
      </CardHeader>
      <CardContent>
        <Button variant="outline" className="w-full">
          {isSelected ? "Selected" : "Select"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default LanguageSelectionCard;

