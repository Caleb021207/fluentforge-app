
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
  
  // This section for French is kept but will not be accessible via normal UI flows
  // since we've removed French from getAvailableTargetLanguages
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
          Practice Your French <span className="text-gray-400 text-lg">(Coming Soon)</span>
        </h1>
        
        <p className="text-gray-600 mb-4">
          French language practice is currently under development. Please check back later!
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
