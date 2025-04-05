
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

interface UserTranscriptProps {
  transcript: string;
}

const UserTranscript: React.FC<UserTranscriptProps> = ({ transcript }) => {
  const { t } = useLocalization();
  
  if (!transcript) return null;
  
  return (
    <div className="mb-6">
      <h3 className="font-medium mb-2">{t("youSaid")}:</h3>
      <div className="bg-gray-100 rounded-lg p-4 text-gray-800">
        {transcript}
      </div>
    </div>
  );
};

export default UserTranscript;
