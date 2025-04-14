
import React from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";

interface PracticeHeaderProps {
  targetLanguage?: string;
}

const PracticeHeader: React.FC<PracticeHeaderProps> = ({ targetLanguage = "spanish" }) => {
  const { t, currentLanguage } = useLocalization();
  
  // Determine which language is being practiced
  const displayLanguage = currentLanguage === "english" 
    ? getLanguageDisplayName(targetLanguage)
    : "English";
  
  // Customized header for English speakers learning French
  if (currentLanguage === "english" && targetLanguage === "french") {
    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Link to="/">
            <Button variant="outline" size="sm" className="gap-1">
              <ArrowLeft className="h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-lingua-text mb-2">
          Practice Your French
        </h1>
        
        <p className="text-gray-600 mb-4">
          Chat with our AI tutor to practice your French! The AI will help correct your grammar, 
          vocabulary, and provide tips on French pronunciation and culture.
        </p>
      </div>
    );
  }
  
  // Default header for other language combinations
  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <Link to="/">
          <Button variant="outline" size="sm" className="gap-1">
            <ArrowLeft className="h-4 w-4" />
            {t("back")}
          </Button>
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold text-lingua-text mb-2">
        {t("practiceYourLanguage", { language: displayLanguage })}
      </h1>
      
      <p className="text-gray-600 mb-4">
        {t("chatWithAI", { language: displayLanguage })}
      </p>
    </div>
  );
};

export default PracticeHeader;
