
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { getSpeechSynthesisLanguageCode } from "@/utils/languageUtils";
import { supabase } from "@/integrations/supabase/client";

interface UseVoiceSpeechRecognitionProps {
  targetLanguage: string;
  onTranscriptChange?: (transcript: string) => void;
  onSendTranscript?: (transcript: string) => void;
  useWhisper?: boolean; // Whether to use Whisper STT instead of browser API
  multilingualMode?: boolean; // Whether to enable multilingual support
}

export const useVoiceSpeechRecognition = ({ 
  targetLanguage,
  onTranscriptChange,
  onSendTranscript,
  useWhisper = true, // Default to Whisper
  multilingualMode = true // Default to multilingual
}: UseVoiceSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [isInitializing, setIsInitializing] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();
  
  // Use refs to prevent race conditions
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef<boolean>(false);
  const autoSendTimeoutRef = useRef<number | null>(null);
  const finalTranscriptRef = useRef<string>("");  // Accumulate finalized speech
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  
  // Clean up function that properly stops recognition and clears timeouts
  const cleanUpRecognition = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      } catch (e) {
        console.error("Error stopping recognition:", e);
      }
    }
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch (e) {
        console.error("Error stopping media recorder:", e);
      }
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (autoSendTimeoutRef.current) {
      window.clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }

    isListeningRef.current = false;
    setIsListening(false);
  }, []);

  // Initialize speech recognition with proper error handling
  const initRecognition = useCallback(() => {
    if (typeof window === "undefined") return null;
    
    if (!('SpeechRecognition' in window) && !('webkitSpeechRecognition' in window)) {
      console.error("Speech recognition not supported in this browser");
      toast({
        title: t("error"),
        description: t("speechRecognitionNotSupported"),
        variant: "destructive",
      });
      return null;
    }
    
    const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognitionAPI();
    
    let recognitionLanguage = getSpeechSynthesisLanguageCode(targetLanguage.toLowerCase());
    recognition.lang = recognitionLanguage;
    recognition.interimResults = true;
    recognition.continuous = true;
    recognition.maxAlternatives = 1;
    
    recognition.onresult = (event: any) => {
      if (!isListeningRef.current) return; // Skip if we've already stopped listening
      
      // Accumulate all finalized results
      let finalTranscript = finalTranscriptRef.current;
      let interimTranscript = "";
      
      // CRITICAL FIX: Only process NEW results using resultIndex to avoid duplicates
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTranscript += result[0].transcript + " ";
        } else {
          interimTranscript += result[0].transcript;
        }
      }
      
      // Update the ref with accumulated finalized text
      finalTranscriptRef.current = finalTranscript;
      
      // Combine finalized and interim for display
      const combinedTranscript = (finalTranscript + interimTranscript).trim();
      
      if (combinedTranscript) {
        // Reset silence detection timer
        if (autoSendTimeoutRef.current) {
          window.clearTimeout(autoSendTimeoutRef.current);
        }
        
        // Auto-send after 3 seconds of silence
        autoSendTimeoutRef.current = window.setTimeout(() => {
          if (isListeningRef.current && combinedTranscript && onSendTranscript) {
            // Stop recording before sending
            cleanUpRecognition();
            onSendTranscript(combinedTranscript);
            setTranscript("");
            finalTranscriptRef.current = "";
          }
        }, 3000);
        
        setTranscript(combinedTranscript);
        if (onTranscriptChange) {
          onTranscriptChange(combinedTranscript);
        }
      }
    };
    
    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      cleanUpRecognition();
      setIsInitializing(false);
      
      // Only show toast for critical errors, not for aborted/stopped recognition
      if (event.error === 'not-allowed') {
        toast({
          title: t("microphoneAccessRequired"),
          description: t("allowMicAccess"),
          variant: "destructive",
        });
      } else if (event.error !== 'aborted' && event.error !== 'no-speech') {
        // Silent logging for aborted and no-speech errors (they're normal)
        console.warn('Speech recognition error (silent):', event.error);
      }
    };
    
    recognition.onend = () => {
      // Only attempt to restart if we're still supposed to be listening
      if (isListeningRef.current) {
        try {
          // Add a small delay before restarting to prevent rapid cycling
          setTimeout(() => {
            if (isListeningRef.current) {
              try {
                recognition.start();
              } catch (e) {
                console.error("Failed to restart speech recognition after delay:", e);
                cleanUpRecognition();
              }
            }
          }, 300);
        } catch (e) {
          console.error("Failed to handle recognition onend event:", e);
          cleanUpRecognition();
        }
      } else {
        setIsInitializing(false);
      }
    };
    
    return recognition;
  }, [targetLanguage, toast, t, onTranscriptChange, onSendTranscript, cleanUpRecognition]);

  // Start Whisper-based recording
  const startWhisperRecording = useCallback(async () => {
    try {
      // Check Whisper STT limits before starting
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.id) {
        const { data: limitsData } = await supabase
          .rpc('can_use_whisper_stt', { p_student_id: user.id })
          .single();
        
        if (limitsData && !limitsData.can_use) {
          console.log('Whisper STT limit reached, using browser fallback');
          toast({
            title: "Switched to Browser Speech Recognition",
            description: "You've reached your monthly Whisper STT limit. Now using browser speech recognition.",
          });
          startBrowserRecognition();
          return;
        }
      }
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        console.log('MediaRecorder stopped, processing audio...');
        setIsTranscribing(true);
        
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const durationSeconds = audioChunksRef.current.length; // Rough estimate
        
        // Convert to base64
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          
          try {
            const { data: { user } } = await supabase.auth.getUser();
            
            console.log('Sending audio to Whisper API for transcription...');
            const { data, error } = await supabase.functions.invoke('transcribe-audio', {
              body: {
                audio: base64Audio,
                language: multilingualMode ? 'auto' : undefined,
                userId: user?.id,
                durationSeconds
              }
            });

            if (error || data?.useFallback) {
              console.error('Transcription error or limit reached:', error || data);
              toast({
                title: "Switched to Browser Speech Recognition",
                description: "You've reached your monthly Whisper STT limit. Now using browser speech recognition.",
              });
              setIsTranscribing(false);
              // Switch to browser recognition for future requests
              startBrowserRecognition();
              return;
            }

            if (data?.text) {
              const transcribedText = data.text.trim();
              console.log('Transcription received:', transcribedText);
              setTranscript(transcribedText);
              finalTranscriptRef.current = transcribedText;
              if (onTranscriptChange) {
                onTranscriptChange(transcribedText);
              }
            } else {
              console.warn('No transcription text received');
            }
          } catch (error) {
            console.error('Error transcribing audio:', error);
            toast({
              title: t("error"),
              description: t("transcriptionFailed") || "Failed to transcribe audio",
              variant: "destructive",
            });
          } finally {
            setIsTranscribing(false);
            setIsInitializing(false);
            if (streamRef.current) {
              streamRef.current.getTracks().forEach(track => track.stop());
              streamRef.current = null;
            }
          }
        };
        
        reader.readAsDataURL(audioBlob);
      };

      mediaRecorder.start();
      isListeningRef.current = true;
      setIsListening(true);
      setIsInitializing(false);
      
      console.log('Whisper recording started');
    } catch (error) {
      console.error('Error starting Whisper recording:', error);
      setIsInitializing(false);
      toast({
        title: t("error"),
        description: t("microphoneAccessFailed") || "Microphone access failed",
        variant: "destructive",
      });
    }
  }, [multilingualMode, toast, t, onTranscriptChange]);

  // Start browser-based recognition (fallback)
  const startBrowserRecognition = useCallback(() => {
    try {
      cleanUpRecognition();
      recognitionRef.current = initRecognition();
      
      if (recognitionRef.current) {
        isListeningRef.current = true;
        setIsListening(true);
        recognitionRef.current.start();
        setIsInitializing(false);
        console.log('Browser recognition started');
      }
    } catch (error) {
      console.error('Error starting browser recognition:', error);
      setIsInitializing(false);
    }
  }, [initRecognition, cleanUpRecognition]);

  // Set up and clean up on mount/unmount
  useEffect(() => {
    return () => {
      cleanUpRecognition();
    };
  }, [cleanUpRecognition]);

  const toggleListening = () => {
    // Prevent rapid re-toggling
    if (isInitializing) {
      console.log("Cannot toggle while initializing");
      return;
    }
    
    if (isListening) {
      console.log("Stopping recording");
      cleanUpRecognition();
    } else {
      console.log("Starting recording");
      setIsInitializing(true);
      
      // Reset transcripts when starting a new recording
      setTranscript("");
      finalTranscriptRef.current = "";
      
      if (useWhisper) {
        startWhisperRecording();
      } else {
        startBrowserRecognition();
      }
    }
  };

  const handleSendTranscript = (text: string) => {
    if (!text.trim()) return;
    
    // CRITICAL: Stop recording immediately to prevent capturing TTS response
    cleanUpRecognition();
    
    if (autoSendTimeoutRef.current) {
      window.clearTimeout(autoSendTimeoutRef.current);
      autoSendTimeoutRef.current = null;
    }
    
    if (onSendTranscript) {
      onSendTranscript(text);
    }
    
    // Clear transcript and reset accumulator after sending
    setTranscript("");
    finalTranscriptRef.current = "";
  };

  return {
    isListening,
    isInitializing,
    isTranscribing,
    transcript,
    toggleListening,
    handleSendTranscript,
    clearTranscript: () => {
      setTranscript("");
      finalTranscriptRef.current = "";
    }
  };
};
