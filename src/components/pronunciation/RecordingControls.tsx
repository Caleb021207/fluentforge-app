
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Mic, MicOff, Loader2 } from "lucide-react";

interface RecordingControlsProps {
  isRecording: boolean;
  isProcessing?: boolean;
  transcript: string;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isProcessing = false,
  transcript,
  onStartRecording,
  onStopRecording
}) => {
  const { t } = useLocalization();

  const handleRecordingToggle = async () => {
    // Prevent rapid re-toggling
    if (isProcessing) {
      return;
    }
    
    if (isRecording) {
      onStopRecording();
    } else {
      onStartRecording();
    }
  };

  const isLoading = isProcessing;

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">{t("yourPronunciation")}</h3>
        <Button
          variant={isRecording ? "destructive" : "default"}
          onClick={handleRecordingToggle}
          disabled={isLoading}
          className="flex items-center gap-2"
          type="button"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("processing")}
            </>
          ) : isRecording ? (
            <>
              <MicOff className="h-4 w-4" />
              {t("stopRecording")}
            </>
          ) : (
            <>
              <Mic className="h-4 w-4" />
              {t("startRecording")}
            </>
          )}
        </Button>
      </div>

      <Card>
        <CardContent className="p-4">
          {isRecording ? (
            <div className="flex items-center justify-center h-12">
              <div className="relative flex items-center justify-center">
                <div className="absolute w-8 h-8 bg-red-500 rounded-full opacity-75 animate-ping"></div>
                <div className="w-6 h-6 bg-red-500 rounded-full"></div>
              </div>
              <p className="ml-3">{t("listeningToYou")}</p>
            </div>
          ) : isProcessing ? (
            <div className="flex items-center justify-center h-12">
              <Loader2 className="h-6 w-6 mr-2 animate-spin" />
              <p>{t("processingAudio")}</p>
            </div>
          ) : transcript ? (
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("yourTranscription")}:</p>
              <p className="text-xl">{transcript}</p>
            </div>
          ) : (
            <p className="text-muted-foreground text-center py-2">
              {t("clickStartToRecord")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default RecordingControls;
