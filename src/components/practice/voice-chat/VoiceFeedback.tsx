
import React from 'react';
import { Button } from '@/components/ui/button';
import { Volume2 } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

interface VoiceFeedbackProps {
  transcript: string;
  gptResponse: string;
  translation: string;
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  onPlayAgain: () => void;
}

const VoiceFeedback: React.FC<VoiceFeedbackProps> = ({
  transcript,
  gptResponse,
  translation,
  isListening,
  isLoading,
  isSpeaking,
  onPlayAgain
}) => {
  const { t } = useLocalization();
  
  return (
    <>
      {isListening && (
        <div className="text-sm text-gray-500 animate-pulse mb-4">
          {t("listeningNow")}...
        </div>
      )}

      {transcript && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">
            {t("youSaid")}:
          </h3>
          <div className="bg-gray-100 rounded-lg p-4 text-gray-800">
            {transcript}
          </div>
        </div>
      )}

      {isLoading && (
        <div className="flex justify-center my-6">
          <div className="flex space-x-2">
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" />
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
            <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
          </div>
        </div>
      )}

      {gptResponse && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">
              {t("aiResponse")}:
            </h3>
            <Button 
              onClick={onPlayAgain} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              disabled={isSpeaking}
            >
              <Volume2 className="h-4 w-4" />
              {isSpeaking 
                ? t("speaking") 
                : t("playAgain")}
            </Button>
          </div>
          <div className="bg-lingua-primary/10 rounded-lg p-4 text-gray-800">
            {gptResponse}
            
            {translation && translation.trim() !== "" && (
              <>
                <div className="border-t border-gray-300 my-3"></div>
                <div className="text-sm text-gray-600">
                  <strong>
                    {t("translation")}:
                  </strong> {translation || t("translationNotAvailable")}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
};

export default VoiceFeedback;
