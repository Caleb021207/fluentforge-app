
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export const useLanguagePreferences = () => {
  const { toast } = useToast();
  const { t, setCurrentLanguage } = useLocalization();
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [hasStudyMaterials, setHasStudyMaterials] = useState(true);

  useEffect(() => {
    const savedNativeLanguage = localStorage.getItem("nativeLanguage");
    const savedTargetLanguage = localStorage.getItem("targetLanguage");
    
    if (savedNativeLanguage) setNativeLanguage(savedNativeLanguage);
    if (savedTargetLanguage) setTargetLanguage(savedTargetLanguage);
  }, []);

  useEffect(() => {
    if (nativeLanguage && targetLanguage) {
      setHasStudyMaterials(true);
      
      sessionStorage.setItem("languagePair", `${nativeLanguage}-${targetLanguage}`);
      sessionStorage.setItem("hasStudyMaterials", "true");
    }
  }, [nativeLanguage, targetLanguage]);

  const handleLanguageSelection = () => {
    if (nativeLanguage && targetLanguage) {
      localStorage.setItem("nativeLanguage", nativeLanguage);
      localStorage.setItem("targetLanguage", targetLanguage);
      
      const languagePair = `${nativeLanguage}-${targetLanguage}`;
      sessionStorage.setItem("languagePair", languagePair);
      sessionStorage.setItem("hasStudyMaterials", "true");
      
      setCurrentLanguage(nativeLanguage);
      
      toast({
        title: t("languagePreferencesSaved"),
        description: `${t("youreNowLearning")} ${targetLanguage} ${t("from")} ${nativeLanguage}`,
      });
      
      window.location.reload();
    } else {
      toast({
        title: t("pleaseSelectBothLanguages"),
        description: t("youNeedToSelectBoth"),
        variant: "destructive",
      });
    }
  };

  return {
    nativeLanguage,
    targetLanguage,
    hasStudyMaterials,
    setNativeLanguage,
    setTargetLanguage,
    handleLanguageSelection
  };
};
