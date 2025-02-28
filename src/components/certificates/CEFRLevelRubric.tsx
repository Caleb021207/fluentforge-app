
import React from "react";

interface RubricItemProps {
  level: string;
  range: string;
}

const rubricData = [
  { level: 'C2', range: '84-100%' },
  { level: 'C1', range: '67-83%' },
  { level: 'B2', range: '50-66%' },
  { level: 'B1', range: '33-49%' },
  { level: 'A2', range: '17-32%' },
  { level: 'A1', range: '0-16%' },
];

const CEFRLevelRubric = () => {
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">CEFR Level Rubric</h3>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
        {rubricData.map((item) => (
          <div key={item.level} className="p-2 bg-white rounded border text-center">
            <div className="font-medium">Level {item.level}</div>
            <div className="text-sm text-gray-600">{item.range}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CEFRLevelRubric;
export { rubricData };
