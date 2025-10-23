
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

interface RubricItemProps {
  level: string;
  range: string;
}

const rubricData = [
  { level: 'Distinguished', range: '96-100%' },
  { level: 'Superior', range: '91-95%' },
  { level: 'Advanced High', range: '81-90%' },
  { level: 'Advanced Mid', range: '71-80%' },
  { level: 'Advanced Low', range: '66-70%' },
  { level: 'Intermediate High', range: '56-65%' },
  { level: 'Intermediate Mid', range: '46-55%' },
  { level: 'Intermediate Low', range: '36-45%' },
  { level: 'Novice High', range: '26-35%' },
  { level: 'Novice Mid', range: '11-25%' },
  { level: 'Novice Low', range: '0-10%' },
];

const ACTFLLevelRubric = () => {
  const { t, currentLanguage } = useLocalization();
  
  const getLocalizedTitle = () => {
    switch(currentLanguage) {
      case "spanish":
        return "Rúbrica de Niveles ACTFL";
      case "portuguese":
        return "Rubrica de Níveis ACTFL";
      default:
        return "ACTFL Level Rubric";
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
            <div className="font-medium">{item.level}</div>
            <div className="text-sm text-gray-600">{item.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ACTFLLevelRubric;
export { rubricData };
