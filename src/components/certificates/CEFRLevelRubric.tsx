
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

interface RubricItemProps {
  level: string;
  range: string;
}

const rubricData = [
  { level: 'C2', range: '96-100%' },
  { level: 'C1', range: '81-95%' },
  { level: 'B2', range: '66-80%' },
  { level: 'B1', range: '50-65%' },
  { level: 'A2', range: '31-49%' },
  { level: 'A1', range: '0-30%' },
];

const CEFRLevelRubric = () => {
  const { t, currentLanguage } = useLocalization();
  
  const getLocalizedTitle = () => {
    switch(currentLanguage) {
      case "spanish":
        return "Rúbrica de Niveles CEFR";
      case "portuguese":
        return "Rubrica de Níveis CEFR";
      default:
        return "CEFR Level Rubric";
    }
  };
  
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {getLocalizedTitle()}
      </h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {rubricData.map((item) => (
          <div key={item.level} className="p-2 bg-white rounded border text-center">
            <div className="font-medium">{t("level")} {item.level}</div>
            <div className="text-sm text-gray-600">{item.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CEFRLevelRubric;
export { rubricData };
