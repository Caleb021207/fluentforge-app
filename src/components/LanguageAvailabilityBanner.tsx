
import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const LanguageAvailabilityBanner = () => {
  const [hasStudyMaterials, setHasStudyMaterials] = useState(true);
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  
  useEffect(() => {
    // Check session storage for language settings
    const hasStudyMaterials = sessionStorage.getItem("hasStudyMaterials") === "true";
    const languagePair = sessionStorage.getItem("languagePair") || "";
    
    setHasStudyMaterials(hasStudyMaterials);
    
    // Parse the language pair
    if (languagePair) {
      const [native, target] = languagePair.split("-");
      setNativeLanguage(native);
      setTargetLanguage(target);
    }
  }, []);

  if (hasStudyMaterials || !nativeLanguage || !targetLanguage) {
    return null;
  }

  return (
    <Alert variant="warning" className="mb-6 bg-yellow-50 border-yellow-200">
      <AlertCircle className="h-5 w-5 text-yellow-500" />
      <AlertDescription className="text-sm md:text-base">
        Study materials for learning <span className="capitalize">{targetLanguage}</span> from <span className="capitalize">{nativeLanguage}</span> are coming soon! 
        Some features might be limited or unavailable.
      </AlertDescription>
    </Alert>
  );
};

export default LanguageAvailabilityBanner;
