
import React from "react";
import { Mic, MicOff, Send, Volume2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

interface VoiceChatControlsProps {
  isListening: boolean;
  isLoading: boolean;
  isSpeaking: boolean;
  transcript: string;
  gptResponse: string;
  translation: string;
  toggleListening: () => void;
  handleSendTranscript: (text: string) => void;
  playAgain: () => void;
  practiceLevel?: string;
  practiceDescription?: string;
}

const VoiceChatControls: React.FC<VoiceChatControlsProps> = ({
  isListening,
  isLoading,
  isSpeaking,
  transcript,
  gptResponse,
  translation,
  toggleListening,
  handleSendTranscript,
  playAgain,
  practiceLevel = "B1",
  practiceDescription
}) => {
  const { t, currentLanguage } = useLocalization();

  const getPracticeLevelText = () => {
    if (currentLanguage === "mandarin") {
      return "练习水平";
    } else if (currentLanguage === "vietnamese") {
      return "Cấp độ thực hành";
    } else if (currentLanguage === "french") {
      return "Niveau de pratique";
    } else if (currentLanguage === "japanese") {
      return "練習レベル";
    } else if (currentLanguage === "russian") {
      return "Уровень практики";
    } else if (currentLanguage === "hindi") {
      return "अभ्यास स्तर";
    } else if (currentLanguage === "indonesian") {
      return "Tingkat Latihan";
    }
    return t("practiceLevel") || "Practice Level";
  };

  return (
    <Card className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div className="mb-4 md:mb-0">
          <p className="text-sm text-gray-500">
            <span className="font-medium">{getPracticeLevelText()}: {practiceLevel}</span> - {t("cefrB1Description")}
          </p>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={toggleListening}
            variant={isListening ? "destructive" : "default"}
            size="lg"
            disabled={isLoading || isSpeaking}
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
              onClick={() => handleSendTranscript(transcript)}
              variant="default"
              size="lg"
              disabled={isLoading || isSpeaking || !transcript.trim()}
            >
              <Send className="h-5 w-5 mr-2" />
              {t("send")}
            </Button>
          )}
        </div>
      </div>
      
      {isListening && (
        <div className="text-sm text-gray-500 animate-pulse mb-4">
          {t("listeningNow")}...
        </div>
      )}

      {transcript && (
        <div className="mb-6">
          <h3 className="font-medium mb-2">{t("youSaid")}:</h3>
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
            <h3 className="font-medium">{t("aiResponse")}:</h3>
            <Button 
              onClick={playAgain} 
              variant="outline" 
              size="sm"
              className="flex items-center gap-2"
              disabled={isSpeaking}
            >
              <Volume2 className="h-4 w-4" />
              {isSpeaking ? t("speaking") : t("playAgain")}
            </Button>
          </div>
          <div className="bg-lingua-primary/10 rounded-lg p-4 text-gray-800">
            {gptResponse}
            
            {((translation && translation.trim() !== "") || currentLanguage === "hindi") && (
              <>
                <div className="border-t border-gray-300 my-3"></div>
                <div className="text-sm text-gray-600">
                  <strong>{t("translation")}:</strong> {translation || "अनुवाद उपलब्ध नहीं है"}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </Card>
  );
};

export default VoiceChatControls;
