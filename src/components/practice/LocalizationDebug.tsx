
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import translations from "@/translations";
import { AVAILABLE_LANGUAGES } from "@/translations/constants";

const LocalizationDebug = () => {
  const { currentLanguage, t } = useLocalization();
  const storedLanguage = localStorage.getItem("nativeLanguage");
  const [showAllKeys, setShowAllKeys] = useState(false);
  
  // Expanded set of translation keys to test
  const commonTestKeys = ["send", "typeMessage", "startConversationIn", "textPractice", "cancel", "loading", "error"];
  const practiceTestKeys = ["practiceWithAI", "startTextChatting", "noticeTextBasedPractice"];
  
  // Check for missing translations in current language
  const missingKeys = commonTestKeys.concat(practiceTestKeys).filter(key => 
    !translations[currentLanguage]?.[key] && translations["english"]?.[key]
  );
  
  // Get keys from English that are missing in current language
  const getAllMissingKeys = () => {
    const englishKeys = Object.keys(translations["english"] || {});
    return englishKeys.filter(key => 
      !translations[currentLanguage]?.[key]
    );
  };
  
  const allMissingKeys = getAllMissingKeys();
  
  // Helper function to safely get string representation of translation
  const getDisplayValue = (value: any): string => {
    if (typeof value === 'string') return value;
    if (typeof value === 'object' && value !== null) return '[Object]';
    if (value === undefined) return 'undefined';
    return String(value);
  };
  
  return (
    <Card className="mt-4 bg-amber-50 border-amber-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-amber-800 flex justify-between items-center">
          <span>Localization Debug Info</span>
          <button 
            onClick={() => setShowAllKeys(!showAllKeys)} 
            className="text-xs bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded text-amber-900"
          >
            {showAllKeys ? "Hide Details" : "Show All Missing Keys"}
          </button>
        </CardTitle>
      </CardHeader>
      <CardContent className="text-sm space-y-2">
        <div>
          <strong>Current Language from Context:</strong> {currentLanguage}
        </div>
        <div>
          <strong>Stored Language in localStorage:</strong> {storedLanguage || "not set"}
        </div>
        <div>
          <strong>Available Languages:</strong> {Object.keys(AVAILABLE_LANGUAGES).join(", ")}
        </div>
        <div className="mt-2">
          <strong>Translation Tests:</strong>
          <ul className="list-disc pl-5 mt-1">
            {commonTestKeys.map(key => (
              <li key={key} className={!translations[currentLanguage]?.[key] ? "text-red-500" : ""}>
                Key: <code>{key}</code> → Result: "<span className="font-semibold">{getDisplayValue(t(key))}</span>"
                {!translations[currentLanguage]?.[key] && translations["english"]?.[key] && 
                  <span className="text-red-500 ml-2">(using fallback)</span>}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-2">
          <strong>Practice Page Specific Keys:</strong>
          <ul className="list-disc pl-5 mt-1">
            {practiceTestKeys.map(key => (
              <li key={key} className={!translations[currentLanguage]?.[key] ? "text-red-500" : ""}>
                Key: <code>{key}</code> → Result: "<span className="font-semibold">{getDisplayValue(t(key))}</span>"
                {!translations[currentLanguage]?.[key] && translations["english"]?.[key] && 
                  <span className="text-red-500 ml-2">(using fallback)</span>}
              </li>
            ))}
          </ul>
        </div>
        
        <div className="mt-2">
          <strong>Missing Translations:</strong> {missingKeys.length > 0 ? (
            <span className="text-red-500">{missingKeys.length} keys missing</span>
          ) : (
            <span className="text-green-500">All test keys translated</span>
          )}
        </div>

        {showAllKeys && allMissingKeys.length > 0 && (
          <div className="mt-2 border-t border-amber-200 pt-2">
            <strong>All Missing Keys ({allMissingKeys.length}):</strong>
            <div className="mt-1 max-h-40 overflow-y-auto bg-amber-100/50 p-2 rounded text-xs">
              {allMissingKeys.map(key => (
                <div key={key} className="mb-1">
                  <code className="bg-amber-100 px-1 rounded">{key}</code>: "
                  {getDisplayValue(translations["english"]?.[key]) || ""}"
                </div>
              ))}
            </div>
          </div>
        )}
        
        <div className="mt-2">
          <strong>Has translations loaded:</strong> {Object.keys(translations).length > 0 ? (
            <span className="text-green-500">Yes ({Object.keys(translations).length} languages)</span>
          ) : (
            <span className="text-red-500">No</span>
          )}
        </div>

        <div className="text-xs mt-2 border-t border-amber-200 pt-2 text-amber-700">
          <p>This debug panel helps identify localization issues. Red text indicates missing translations that are falling back to English.</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocalizationDebug;
