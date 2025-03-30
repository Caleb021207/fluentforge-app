
import { useState, useRef, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

type VoiceMessage = {
  role: 'user' | 'assistant';
  content: string;
  audio?: string;
  timestamp: Date;
};

export const useVoiceConversation = (currentLanguage: string) => {
  const { toast } = useToast();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null);
  const [audioChunks, setAudioChunks] = useState<Blob[]>([]);
  const [voiceMessages, setVoiceMessages] = useState<VoiceMessage[]>([]);
  const [remainingTime, setRemainingTime] = useState<number | null>(null);
  const [isFallbackMode, setIsFallbackMode] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const conversationHistoryRef = useRef<Array<{role: string, content: string}>>([]);

  // Initialize remaining time from localStorage
  useEffect(() => {
    const getRemainingTime = () => {
      const storedTime = localStorage.getItem('voiceRemainingTime');
      const lastReset = localStorage.getItem('voiceTimeLastReset');
      
      // Reset the timer if it's a new day
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      
      if (lastReset !== today) {
        // It's a new day, reset the timer
        localStorage.setItem('voiceRemainingTime', '600'); // 10 minutes in seconds
        localStorage.setItem('voiceTimeLastReset', today);
        return 600;
      }
      
      return storedTime ? parseInt(storedTime) : 600; // Default to 10 minutes (600 seconds)
    };
    
    setRemainingTime(getRemainingTime());
    
    // Check if we should be in fallback mode
    if (getRemainingTime() <= 0) {
      setIsFallbackMode(true);
    }
  }, []);

  // Update localStorage whenever remaining time changes
  useEffect(() => {
    if (remainingTime !== null) {
      localStorage.setItem('voiceRemainingTime', remainingTime.toString());
    }
  }, [remainingTime]);

  const setupMediaRecorder = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setAudioChunks((prev) => [...prev, e.data]);
        }
      };
      
      recorder.onstop = () => {
        console.log('Recording stopped');
      };
      
      setMediaRecorder(recorder);
      return true;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast({
        title: "Microphone Error",
        description: "Please allow microphone access to use voice features.",
        variant: "destructive",
      });
      return false;
    }
  };

  const startRecording = async () => {
    // Check if we have enough time remaining
    if (remainingTime !== null && remainingTime <= 0) {
      setIsFallbackMode(true);
      toast({
        title: "Daily Limit Reached",
        description: "You've reached your daily voice conversation limit. Try again tomorrow or upgrade.",
        variant: "destructive",
      });
      return;
    }

    // Clear previous audio chunks
    setAudioChunks([]);
    
    // Setup recorder if not already set up
    if (!mediaRecorder) {
      const success = await setupMediaRecorder();
      if (!success) return;
    }
    
    mediaRecorder?.start();
    setIsRecording(true);
    
    // Start a timer to track recording duration
    const startTime = Date.now();
    
    // Set up an interval to decrease the remaining time
    const interval = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev === null || prev <= 0) {
          clearInterval(interval);
          if (mediaRecorder?.state === 'recording') {
            mediaRecorder.stop();
          }
          setIsRecording(false);
          setIsFallbackMode(true);
          toast({
            title: "Daily Limit Reached",
            description: "You've reached your daily voice conversation limit. Try again tomorrow or upgrade.",
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    
    // Save the interval ID for cleanup
    return interval;
  };

  const stopRecording = async (intervalId?: number) => {
    if (intervalId) {
      clearInterval(intervalId);
    }
    
    if (mediaRecorder?.state === 'recording') {
      mediaRecorder.stop();
      
      // Wait for the ondataavailable event to fire
      await new Promise((resolve) => setTimeout(resolve, 200));
      
      setIsRecording(false);
      await processRecording();
    }
  };

  const processRecording = async () => {
    if (audioChunks.length === 0) return;
    
    setIsProcessing(true);
    
    try {
      // Combine audio chunks into a single blob
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result as string;
        // Remove the data URL prefix (e.g., "data:audio/webm;base64,")
        const base64Data = base64Audio.split(',')[1];
        
        // Add user message immediately with audio indication
        const userMessage: VoiceMessage = {
          role: 'user',
          content: '🔊 Processing your audio...',
          timestamp: new Date()
        };
        
        setVoiceMessages((prev) => [...prev, userMessage]);
        
        // Call the Supabase function
        const { data, error } = await supabase.functions.invoke('voice-conversation', {
          body: {
            audio: base64Data,
            userLanguage: currentLanguage,
            conversationHistory: conversationHistoryRef.current
          }
        });
        
        if (error) {
          console.error('Error processing voice:', error);
          toast({
            title: "Error",
            description: "Failed to process your voice message. Please try again.",
            variant: "destructive",
          });
          
          // Update the processing message to show the error
          setVoiceMessages((prev) => 
            prev.map((msg, i) => 
              i === prev.length - 1 ? { ...msg, content: 'Error processing your message' } : msg
            )
          );
          setIsProcessing(false);
          return;
        }
        
        // Update the user message with the transcribed text
        setVoiceMessages((prev) => 
          prev.map((msg, i) => 
            i === prev.length - 1 ? { ...msg, content: data.userText } : msg
          )
        );
        
        // Add the assistant response
        const assistantMessage: VoiceMessage = {
          role: 'assistant',
          content: data.assistantText,
          audio: data.audioContent,
          timestamp: new Date()
        };
        
        setVoiceMessages((prev) => [...prev, assistantMessage]);
        
        // Play the audio response
        if (data.audioContent && audioRef.current) {
          audioRef.current.src = `data:audio/mp3;base64,${data.audioContent}`;
          audioRef.current.play();
        }
        
        // Update conversation history
        conversationHistoryRef.current = data.updatedHistory || [
          ...conversationHistoryRef.current,
          { role: 'user', content: data.userText },
          { role: 'assistant', content: data.assistantText }
        ];
        
        setIsProcessing(false);
      };
    } catch (error) {
      console.error('Error processing recording:', error);
      toast({
        title: "Error",
        description: "Failed to process your voice message. Please try again.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  // Handle fallback mode using browser's built-in SpeechRecognition and SpeechSynthesis
  const handleFallbackVoiceInput = () => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      toast({
        title: "Not Supported",
        description: "Your browser doesn't support speech recognition. Please upgrade.",
        variant: "destructive",
      });
      return;
    }
    
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = currentLanguage === 'spanish' ? 'es-ES' : 
                       currentLanguage === 'portuguese' ? 'pt-BR' : 'en-US';
    recognition.continuous = false;
    recognition.interimResults = false;
    
    recognition.onstart = () => {
      setIsRecording(true);
      toast({
        title: "Fallback Mode",
        description: "Using browser speech recognition. Quality may be limited.",
      });
    };
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      
      // Add user message
      const userMessage: VoiceMessage = {
        role: 'user',
        content: transcript,
        timestamp: new Date()
      };
      
      setVoiceMessages((prev) => [...prev, userMessage]);
      
      // Generate a simple response (in a real app, you could use a simpler AI endpoint)
      const responses = {
        english: "I heard you, but I'm in fallback mode. You've reached your daily limit for premium voice conversations.",
        spanish: "Te escuché, pero estoy en modo de respaldo. Has alcanzado tu límite diario para conversaciones de voz premium.",
        portuguese: "Eu ouvi você, mas estou no modo de fallback. Você atingiu seu limite diário para conversas de voz premium."
      };
      
      const response = responses[currentLanguage as keyof typeof responses] || responses.english;
      
      // Add assistant response
      const assistantMessage: VoiceMessage = {
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };
      
      setVoiceMessages((prev) => [...prev, assistantMessage]);
      
      // Use browser's speech synthesis for response
      const speech = new SpeechSynthesisUtterance(response);
      speech.lang = currentLanguage === 'spanish' ? 'es-ES' : 
                   currentLanguage === 'portuguese' ? 'pt-BR' : 'en-US';
      window.speechSynthesis.speak(speech);
    };
    
    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsRecording(false);
    };
    
    recognition.onend = () => {
      setIsRecording(false);
    };
    
    recognition.start();
  };

  // Format remaining time for display
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const clearConversation = () => {
    setVoiceMessages([]);
    conversationHistoryRef.current = [];
    toast({
      title: "Success",
      description: "Voice conversation history has been cleared.",
    });
  };

  return {
    isRecording,
    isProcessing,
    voiceMessages,
    remainingTime,
    isFallbackMode,
    audioRef,
    startRecording,
    stopRecording,
    handleFallbackVoiceInput,
    formatTime,
    clearConversation
  };
};
