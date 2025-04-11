
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getAvailableTargetLanguages, getLanguageDisplayName, isLanguageUnderDevelopment } from "@/utils/languageUtils";

const LanguageAvailabilityBanner = () => {
  const { currentLanguage, t } = useLocalization();
  
  if (currentLanguage === "english") {
    const availableLanguages = getAvailableTargetLanguages(currentLanguage);
    
    // Filter active languages (not under development)
    const activeLanguages = availableLanguages.filter(lang => !isLanguageUnderDevelopment(lang));
    const developmentLanguages = availableLanguages.filter(lang => isLanguageUnderDevelopment(lang));
    
    const activeLanguageNames = activeLanguages
      .map(lang => getLanguageDisplayName(lang))
      .join(' and ');
    
    const developmentLanguageNames = developmentLanguages
      .map(lang => getLanguageDisplayName(lang))
      .join(', ');
    
    return (
      <div className="bg-blue-50 text-blue-700 px-4 py-2 text-center text-sm rounded-md mb-4">
        <p>Currently, English speakers can learn {activeLanguageNames} with our app.</p>
        {developmentLanguages.length > 0 && (
          <p className="mt-1">
            <span className="font-medium">Coming soon:</span> {developmentLanguageNames}
          </p>
        )}
      </div>
    );
  }
  
  // For other language speakers learning English
  return (
    <div className="bg-blue-50 text-blue-700 px-4 py-2 text-center text-sm rounded-md mb-4">
      {t("currentlySupportingEnglish")}
    </div>
  );
};

export default LanguageAvailabilityBanner;
