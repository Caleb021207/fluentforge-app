
import React from "react";
import { Info } from "lucide-react";

const TestInstructions = () => {
  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <Info className="h-4 w-4 text-blue-500 mr-2" />
        <h3 className="text-sm font-medium">Test Instructions</h3>
      </div>
      <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc">
        <li>Speak naturally in English</li>
        <li>Answer the tutor's questions</li>
        <li>Try to keep the conversation flowing</li>
        <li>Listen carefully to understand questions</li>
        <li>Don't worry about making mistakes</li>
      </ul>
    </div>
  );
};

export default TestInstructions;
