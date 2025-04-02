
import React from "react";
import { Info } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const TestInstructions = () => {
  const { currentLanguage } = useLocalization();
  
  // Determine the target language based on user's native language
  const getInstructions = () => {
    if (currentLanguage === "spanish" || currentLanguage === "portuguese" || currentLanguage === "korean") {
      // For Spanish/Portuguese/Korean speakers learning English
      return (
        <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc">
          <li>Speak naturally in English</li>
          <li>Answer the tutor's questions</li>
          <li>Try to keep the conversation flowing</li>
          <li>Listen carefully to understand questions</li>
          <li>Don't worry about making mistakes</li>
        </ul>
      );
    } else {
      // For English speakers learning Spanish
      return (
        <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc">
          <li>Speak naturally in Spanish</li>
          <li>Answer the tutor's questions</li>
          <li>Try to keep the conversation flowing</li>
          <li>Listen carefully to understand questions</li>
          <li>Don't worry about making mistakes</li>
        </ul>
      );
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <Info className="h-4 w-4 text-blue-500 mr-2" />
        <h3 className="text-sm font-medium">Test Instructions</h3>
      </div>
      {getInstructions()}
    </div>
  );
};

export default TestInstructions;
