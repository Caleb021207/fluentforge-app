
import React from 'react';
import { Button } from '@/components/ui/button';
import { Mic, MicOff, Send } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';

interface VoiceControlsProps {
  isListening: boolean;
  transcript: string;
  isLoading: boolean;
  isSpeaking: boolean;
  isRecognitionSupported: boolean;
  onToggleListening: () => void;
  onSendTranscript: (transcript: string) => void;
}

const VoiceControls: React.FC<VoiceControlsProps> = ({
  isListening,
  transcript,
  isLoading,
  isSpeaking,
  isRecognitionSupported,
  onToggleListening,
  onSendTranscript
}) => {
  const { t } = useLocalization();
  
  return (
    <div className="flex gap-2">
      <Button
        onClick={onToggleListening}
        variant={isListening ? "destructive" : "default"}
        size="lg"
        disabled={isLoading || isSpeaking || !isRecognitionSupported}
      >
        {isListening ? (
          <>
            <MicOff className="h-5 w-5 mr-2" />
            {t("stopListening")}
          </>
        ) : (
          <>
            <Mic className="h-5 w-5 mr-2" />
            {t("startSpeaking")}
          </>
        )}
      </Button>
      
      {isListening && transcript && (
        <Button
          onClick={() => onSendTranscript(transcript)}
          variant="default"
          size="lg"
          disabled={isLoading || isSpeaking || !transcript.trim()}
        >
          <Send className="h-5 w-5 mr-2" />
          {t("send")}
        </Button>
      )}
    </div>
  );
};

export default VoiceControls;
