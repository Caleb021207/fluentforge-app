
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

interface LanguagePair {
  sourceLanguage: string;
  targetLanguage: string;
}

interface TestInstructionsProps {
  languagePair?: LanguagePair;
}

const TestInstructions = ({ languagePair }: TestInstructionsProps) => {
  const { t, currentLanguage } = useLocalization();
  
  const getLanguageName = (code: string): string => {
    switch(code) {
      case 'english': 
        return currentLanguage === "spanish" ? "Inglés" : 
               currentLanguage === "portuguese" ? "Inglês" : "English";
      case 'spanish': 
        return currentLanguage === "spanish" ? "Español" : 
               currentLanguage === "portuguese" ? "Espanhol" : "Spanish";
      case 'portuguese': 
        return currentLanguage === "spanish" ? "Portugués" : 
               currentLanguage === "portuguese" ? "Português" : "Portuguese";
      default: 
        return code.charAt(0).toUpperCase() + code.slice(1);
    }
  };
  
  const getInstructionsForLanguagePair = () => {
    if (!languagePair) return t("conversationTestInstructions");
    
    const sourceLanguage = getLanguageName(languagePair.sourceLanguage);
    const targetLanguage = getLanguageName(languagePair.targetLanguage);
    
    if (currentLanguage === "spanish") {
      return `Esta prueba evaluará su capacidad para mantener una conversación en ${targetLanguage} como un hablante de ${sourceLanguage}.`;
    } else if (currentLanguage === "portuguese") {
      return `Este teste avaliará sua capacidade de manter uma conversa em ${targetLanguage} como um falante de ${sourceLanguage}.`;
    } else {
      return `This test will evaluate your ability to maintain a conversation in ${targetLanguage} as a ${sourceLanguage} speaker.`;
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-semibold mb-4">{t("testInstructions")}</h2>
      
      <div className="space-y-4 text-gray-700">
        <p>{getInstructionsForLanguagePair()}</p>
        
        <ol className="list-decimal ml-5 space-y-2">
          <li>{t("conversationTestInstruction1")}</li>
          <li>{t("conversationTestInstruction2")}</li>
          <li>{t("conversationTestInstruction3")}</li>
          <li>{t("conversationTestInstruction4")}</li>
        </ol>
        
        <p className="font-medium mt-4">{t("conversationTestNote")}</p>
      </div>
    </div>
  );
};

export default TestInstructions;
