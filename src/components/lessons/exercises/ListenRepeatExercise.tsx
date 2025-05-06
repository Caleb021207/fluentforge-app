
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Volume2, Mic, AlertCircle, Check } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { useSpeechRecognition } from "@/hooks/useSpeechRecognition";
import { useLocalization } from "@/context/LocalizationContext";
import AudioButton from '@/components/practice/chat-message/AudioButton';

interface ListenRepeatExerciseProps {
  exercise: {
    title: string;
    description: string;
    phrases: {
      text: string;
      audioUrl?: string;
    }[];
    points: number;
  };
  onAnswer: (isCorrect: boolean) => void;
  timeLeft: number | null;
}

const ListenRepeatExercise: React.FC<ListenRepeatExerciseProps> = ({
  exercise,
  onAnswer,
}) => {
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasListened, setHasListened] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [isAudioLoading, setIsAudioLoading] = useState(false);
  const [hasAudioError, setHasAudioError] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  const currentPhrase = exercise.phrases[currentPhraseIndex];
  
  // Use our custom speech recognition hook
  const { isListening, startListening, stopListening, transcript, isSupported } = useSpeechRecognition({
    language: 'es-ES', // Spanish - this should be dynamic based on context 
    continuous: false,
    interimResults: true,
    onTranscript: (text, isFinal) => {
      if (isFinal) {
        setTimeout(() => {
          // Auto-proceed after transcript is final
          handleNextPhrase(true);
        }, 1000);
      }
    },
    onEnd: () => {
      setIsRecording(false);
    }
  });

  useEffect(() => {
    // Update the recording state when listening state changes
    setIsRecording(isListening);
  }, [isListening]);

  // Create audio element
  useEffect(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      
      audioRef.current.addEventListener('play', () => {
        setIsAudioPlaying(true);
        console.log('Audio started playing');
      });
      
      audioRef.current.addEventListener('ended', () => {
        setIsAudioPlaying(false);
        setHasListened(true);
        console.log('Audio finished playing');
      });
      
      audioRef.current.addEventListener('error', (e) => {
        console.error('Audio error:', e);
        setIsAudioPlaying(false);
        setIsAudioLoading(false);
        setHasAudioError(true);
        toast({
          title: t("error") || "Error",
          description: t("failedToGenerateSpeech") || "Failed to play audio", 
          variant: "destructive",
        });
      });
    }
    
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.src = '';
      }
    };
  }, [t, toast]);

  // Update audio source when phrase changes
  useEffect(() => {
    if (audioRef.current && currentPhrase) {
      setHasAudioError(false);
      setHasListened(false);
    }
  }, [currentPhrase]);

  const playAudio = () => {
    if (!currentPhrase?.text) return;
    
    setIsAudioLoading(true);
    setHasAudioError(false);
    
    if (audioRef.current && currentPhrase.audioUrl) {
      audioRef.current.src = currentPhrase.audioUrl;
      audioRef.current.play()
        .then(() => {
          setIsAudioLoading(false);
        })
        .catch(err => {
          console.error("Error playing audio from URL:", err);
          setIsAudioLoading(false);
          setHasAudioError(true);
          fallbackToSpeechSynthesis();
        });
    } else {
      // Fallback if no audio URL - use text-to-speech
      fallbackToSpeechSynthesis();
    }
  };
  
  const fallbackToSpeechSynthesis = () => {
    try {
      if ('speechSynthesis' in window) {
        // Cancel any ongoing speech
        window.speechSynthesis.cancel();
        
        const utterance = new SpeechSynthesisUtterance(currentPhrase.text);
        utterance.lang = 'es-ES'; // Spanish language
        
        utterance.onstart = () => {
          setIsAudioLoading(false);
          setIsAudioPlaying(true);
          console.log("Speech synthesis started");
        };
        
        utterance.onend = () => {
          setIsAudioPlaying(false);
          setHasListened(true);
          console.log("Speech synthesis ended");
        };
        
        utterance.onerror = (event) => {
          console.error("Speech synthesis error:", event);
          setIsAudioPlaying(false);
          setIsAudioLoading(false);
          setHasAudioError(true);
          toast({
            title: t("error") || "Error",
            description: t("speechSynthesisError") || "Speech synthesis failed", 
            variant: "destructive",
          });
        };
        
        window.speechSynthesis.speak(utterance);
      } else {
        setIsAudioLoading(false);
        setHasAudioError(true);
        toast({
          title: t("error") || "Error",
          description: t("speechSynthesisNotSupported") || "Speech synthesis not supported", 
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error("Speech synthesis error:", err);
      setIsAudioLoading(false);
      setHasAudioError(true);
    }
  };

  const startRecording = async () => {
    if (!isSupported) {
      toast({
        title: t("speechRecognitionError") || "Error",
        description: t("speechRecognitionNotSupported") || "Speech recognition not supported in this browser",
        variant: "destructive",
      });
      return;
    }
    
    await startListening();
  };

  const stopRecording = () => {
    stopListening();
    
    // For this demo, we'll just assume the user said it correctly
    setTimeout(() => {
      handleNextPhrase(true);
    }, 1000);
  };

  const handleNextPhrase = (wasCorrect: boolean) => {
    if (currentPhraseIndex < exercise.phrases.length - 1) {
      setCurrentPhraseIndex(currentPhraseIndex + 1);
      setHasListened(false);
      setIsRecording(false);
      stopListening();
      
      if (wasCorrect) {
        toast({
          title: "Good job!",
          description: "You pronounced it correctly!",
          variant: "default",
        });
      }
    } else {
      // All phrases completed
      onAnswer(true);
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-6 rounded-lg">
        <h3 className="text-xl font-medium mb-3">{exercise.title}</h3>
        <p className="text-slate-600 mb-4">{exercise.description}</p>
        
        <div className="border rounded-lg p-4 bg-white">
          <p className="text-lg font-medium mb-4">{currentPhrase.text}</p>
          
          <div className="flex space-x-4 items-center">
            <AudioButton 
              isPlaying={isAudioPlaying}
              isLoading={isAudioLoading}
              hasError={hasAudioError}
              onClick={playAudio}
              ariaLabel="Listen to phrase"
              variant="outline"
              size="default"
            />
            
            <Button
              onClick={isRecording ? stopRecording : startRecording}
              variant={isRecording ? "destructive" : (hasListened ? "default" : "outline")}
              disabled={!hasListened || (isRecording && !transcript)}
              className="flex items-center space-x-2"
            >
              {isRecording ? (
                <>
                  <Mic className="h-4 w-4 mr-2 animate-pulse" />
                  <span>Recording...</span>
                </>
              ) : (
                <>
                  <Mic className="h-4 w-4 mr-2" />
                  <span>Speak</span>
                </>
              )}
            </Button>
            
            {transcript && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <span>You said:</span>
                <span className="font-medium">{transcript}</span>
              </div>
            )}
          </div>
        </div>
        
        <div className="mt-4 text-sm text-slate-500">
          <p>Listen to the phrase first, then click "Speak" to repeat it.</p>
          <p className="mt-1">Progress: {currentPhraseIndex + 1}/{exercise.phrases.length}</p>
          
          {!isSupported && (
            <div className="mt-2 flex items-center text-amber-600">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>Speech recognition is not supported in this browser. Try using Chrome.</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ListenRepeatExercise;
