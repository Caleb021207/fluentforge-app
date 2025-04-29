
import React from "react";
import { AlertTriangle } from "lucide-react";

const EmptyMessageWarning: React.FC = () => {
  return (
    <div className="flex justify-center mb-4">
      <div className="bg-yellow-100 rounded p-4 text-yellow-700">
        <AlertTriangle size={16} className="inline mr-2" />
        <span>Empty message received</span>
      </div>
    </div>
  );
};

export default EmptyMessageWarning;
