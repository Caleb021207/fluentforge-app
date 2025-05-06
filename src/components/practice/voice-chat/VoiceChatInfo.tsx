
import React from 'react';
import { useLocalization } from '@/context/LocalizationContext';

interface VoiceChatInfoProps {
  speechRecognitionSupported: boolean;
}

const VoiceChatInfo: React.FC<VoiceChatInfoProps> = ({ speechRecognitionSupported }) => {
  const { t } = useLocalization();
  
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        {t("unlimitedVoicePractice")}
      </h1>
      <p className="text-gray-600 mb-4">
        {t("practiceDescription")}
      </p>
      <p className="text-sm text-gray-500 mb-2">
        <strong>{t("aiModelInfo")}</strong>
      </p>
      
      {/* Show appropriate TTS info message */}
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-amber-800 text-sm">
          {t("browserBasedTTS")}
        </p>
      </div>
      
      {!speechRecognitionSupported && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-4">
          <p className="text-red-800 text-sm">
            {t("speechRecognitionNotSupported")} {t("useChrome")}
          </p>
        </div>
      )}
    </div>
  );
};

export default VoiceChatInfo;
