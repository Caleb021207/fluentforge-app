
import React, { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const LanguageAvailabilityBanner = () => {
  const [hasStudyMaterials, setHasStudyMaterials] = useState(true);
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const { t } = useLocalization();
  
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
    <Alert variant="warning" className="mb-6">
      <AlertCircle className="h-5 w-5" />
      <AlertDescription className="text-sm md:text-base">
        {t("studyMaterialsComingSoon", { 
          nativeLanguage: nativeLanguage, 
          targetLanguage: targetLanguage 
        })}
        {" "}
        {t("someFeaturesLimited")}
      </AlertDescription>
    </Alert>
  );
};

export default LanguageAvailabilityBanner;
