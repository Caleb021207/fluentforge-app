
import React from "react";
import { AlertTriangle } from "lucide-react";

interface SafetyWarningProps {
  wasContentFiltered: boolean;
}

const SafetyWarning: React.FC<SafetyWarningProps> = ({ wasContentFiltered }) => {
  if (!wasContentFiltered) {
    return null;
  }
  
  return (
    <div className="mb-2 p-1 bg-yellow-100 rounded text-yellow-700 text-xs flex items-center">
      <AlertTriangle size={12} className="mr-1" />
      <span>Some content was filtered for safety</span>
    </div>
  );
};

export default SafetyWarning;
