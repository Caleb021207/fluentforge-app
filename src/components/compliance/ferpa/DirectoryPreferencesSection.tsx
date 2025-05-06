
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

export interface DirectoryPreference {
  name: boolean;
  email: boolean;
  language: boolean;
  progress: boolean;
  achievements: boolean;
  [key: string]: boolean;
}

interface DirectoryPreferencesSectionProps {
  preferences: DirectoryPreference;
  onPreferenceChange: (item: string, checked: boolean) => void;
}

const DirectoryPreferencesSection = ({ preferences, onPreferenceChange }: DirectoryPreferencesSectionProps) => {
  const { t } = useLocalization();
  
  const preferenceItems = [
    { id: "name", label: t("yourName") || "Your name" },
    { id: "email", label: t("yourEmail") || "Your email address" },
    { id: "language", label: t("languagesStudied") || "Languages you're studying" },
    { id: "progress", label: t("learningProgress") || "Learning progress" },
    { id: "achievements", label: t("achievements") || "Achievements and certificates" }
  ];
  
  return (
    <div className="space-y-2">
      <h3 className="font-medium">{t("directoryInformation") || "Directory Information"}</h3>
      <p className="text-sm text-gray-500">
        {t("directoryInfoDescription") || "Control which information can be shared in public directories or with other users"}
      </p>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-2">
        {preferenceItems.map(item => (
          <div key={item.id} className="flex items-center justify-between space-x-2 bg-gray-50 dark:bg-gray-700 p-2 rounded">
            <Label htmlFor={`share-${item.id}`} className="text-sm cursor-pointer flex-grow text-gray-800 dark:text-white">
              {item.label}
            </Label>
            <Switch 
              id={`share-${item.id}`}
              checked={preferences[item.id]} 
              onCheckedChange={(checked) => onPreferenceChange(item.id, checked)}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default DirectoryPreferencesSection;
