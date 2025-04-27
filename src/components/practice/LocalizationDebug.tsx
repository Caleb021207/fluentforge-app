
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import translations, { AVAILABLE_LANGUAGES } from "@/translations";

const LocalizationDebug = () => {
  const { currentLanguage, t } = useLocalization();
  const storedLanguage = localStorage.getItem("nativeLanguage");
  
  // Sample translation keys to test
  const testKeys = ["send", "typeMessage", "startConversationIn", "textPractice"];
  
  return (
    <Card className="mt-4 bg-amber-50 border-amber-200">
      <CardHeader className="pb-2">
        <CardTitle className="text-base text-amber-800">Localization Debug Info</CardTitle>
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
            {testKeys.map(key => (
              <li key={key}>
                Key: <code>{key}</code> → Result: "<span className="font-semibold">{t(key)}</span>"
              </li>
            ))}
          </ul>
        </div>
        <div className="mt-2">
          <strong>Has translations loaded:</strong> {Object.keys(translations).length > 0 ? "Yes" : "No"}
        </div>
      </CardContent>
    </Card>
  );
};

export default LocalizationDebug;
