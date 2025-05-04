import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Pause, Play, RotateCcw, Check } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useLocalization } from "@/hooks/useLocalization";

interface AudioTranscriptionExerciseProps {
  audioSrc: string;
  expectedText: string;
  onComplete: () => void;
}

const AudioTranscriptionExercise: React.FC<AudioTranscriptionExerciseProps> = ({
  audioSrc,
  expectedText,
  onComplete
}) => {
  const { t } = useLocalization();
  const [isRecording, setIsRecording] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [transcription, setTranscription] = useState("");
  const [progress, setProgress] = useState(0);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleStartRecording = () => {
    setIsRecording(true);
    // Start recording logic here
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // Stop recording logic here
  };

  const handlePlayAudio = () => {
    setIsAudioPlaying(true);
    // Play audio logic here
  };

  const handlePauseAudio = () => {
    setIsAudioPlaying(false);
    // Pause audio logic here
  };

  const handleReset = () => {
    setTranscription("");
    setProgress(0);
    setIsCorrect(false);
  };

  const handleSubmit = () => {
    // Check transcription against expected text
    if (transcription.toLowerCase() === expectedText.toLowerCase()) {
      setIsCorrect(true);
      onComplete();
    } else {
      setIsCorrect(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center space-x-4">
        <Button
          variant="outline"
          onClick={handlePlayAudio}
          disabled={isRecording || isAudioPlaying}
        >
          <Play className="h-4 w-4 mr-2" />
          {t("play")}
        </Button>
        <Button
          variant="outline"
          onClick={handlePauseAudio}
          disabled={isRecording || !isAudioPlaying}
        >
          <Pause className="h-4 w-4 mr-2" />
          {t("pause")}
        </Button>
        <Button
          variant={isRecording ? "destructive" : "outline"}
          onClick={isRecording ? handleStopRecording : handleStartRecording}
          disabled={isAudioPlaying}
        >
          <Mic className="h-4 w-4 mr-2" />
          {isRecording ? t("stopRecording") : t("startRecording")}
        </Button>
        <Button
          variant="secondary"
          onClick={handleReset}
          disabled={isRecording || isAudioPlaying}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          {t("reset")}
        </Button>
      </div>

      <div>
        <label htmlFor="transcription" className="block text-sm font-medium text-gray-700">
          {t("yourTranscription")}
        </label>
        <textarea
          id="transcription"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          value={transcription}
          onChange={(e) => setTranscription(e.target.value)}
          rows={4}
        />
      </div>

      <div>
        <Progress value={progress} />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={isRecording || isAudioPlaying}>
          <Check className="h-4 w-4 mr-2" />
          {t("check")}
        </Button>
      </div>

      {isCorrect !== null && (
        <div className={isCorrect ? "text-green-500" : "text-red-500"}>
          {isCorrect ? t("correctTranscription") : t("incorrectTranscription")}
        </div>
      )}
    </div>
  );
};

export default AudioTranscriptionExercise;
