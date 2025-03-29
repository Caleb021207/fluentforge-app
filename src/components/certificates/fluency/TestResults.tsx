import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { useLocalization } from "@/context/LocalizationContext";
import CEFRLevelDescriptions from "@/components/certificates/CEFRLevelDescriptions";

interface LanguagePair {
  sourceLanguage: string;
  targetLanguage: string;
}

interface TestResultsProps {
  testResult: any;
  onRetry: () => void;
  onBackToOverview: () => void;
  isLoading: boolean;
  languagePair?: LanguagePair;
}

const TestResults = ({ testResult, onRetry, onBackToOverview, isLoading, languagePair }: TestResultsProps) => {
  const { t, currentLanguage } = useLocalization();
  
  const getProgressColor = (score: number) => {
    if (score >= 85) return "bg-green-500";
    if (score >= 70) return "bg-blue-500";
    if (score >= 55) return "bg-yellow-500";
    return "bg-gray-400";
  };
  
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
  
  const getLanguagePairText = () => {
    if (!languagePair) return "";
    const sourceLanguage = getLanguageName(languagePair.sourceLanguage);
    const targetLanguage = getLanguageName(languagePair.targetLanguage);
    
    if (currentLanguage === "spanish") {
      return `(${sourceLanguage} → ${targetLanguage})`;
    } else if (currentLanguage === "portuguese") {
      return `(${sourceLanguage} → ${targetLanguage})`;
    } else {
      return `(${sourceLanguage} → ${targetLanguage})`;
    }
  };

  
  // This is just a simplified return for the component
  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">
        {t("testResults")} {getLanguagePairText()}
      </h2>
      
      {testResult.speaking && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{t("speaking")}</h3>
          <Progress 
            value={testResult.speaking.overallScore} 
            className="mb-2" 
            indicatorClassName={getProgressColor(testResult.speaking.overallScore)}
          />
          <div className="flex justify-between text-sm">
            <span>{t("score")}: {testResult.speaking.overallScore}%</span>
            <span>{t("level")}: {testResult.speaking.level}</span>
          </div>
        </div>
      )}
      
      {testResult.listening && (
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-2">{t("listening")}</h3>
          <Progress 
            value={testResult.listening.overallScore} 
            className="mb-2" 
            indicatorClassName={getProgressColor(testResult.listening.overallScore)}
          />
          <div className="flex justify-between text-sm">
            <span>{t("score")}: {testResult.listening.overallScore}%</span>
            <span>{t("level")}: {testResult.listening.level}</span>
          </div>
        </div>
      )}
      
      <Separator className="my-4" />
      
      {testResult.feedback && (
        <div className="my-4">
          <h3 className="text-lg font-semibold mb-2">{t("feedback")}</h3>
          <p className="text-gray-700">{testResult.feedback}</p>
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row gap-2 mt-6">
        <Button onClick={onRetry} variant="outline" disabled={isLoading}>
          {t("takeTestAgain")}
        </Button>
        <Button onClick={onBackToOverview}>
          {t("backToCertificates")}
        </Button>
      </div>
      
      <div className="mt-8">
        <CEFRLevelDescriptions />
      </div>
    </div>
  );
};

export default TestResults;
