
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Role = 'user' | 'assistant';

type Message = {
  message: string;
  source: Role;
};

// Helper function to format time (mm:ss)
export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
};

export const useConversationTest = (onTestComplete?: () => void) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes in seconds
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [microphoneAccess, setMicrophoneAccess] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [conversation, setConversation] = useState({ status: 'disconnected' });
  const [conversationTranscript, setConversationTranscript] = useState('');
  
  const { toast } = useToast();
  
  // Check login status
  useEffect(() => {
    const checkLogin = async () => {
      const { data } = await supabase.auth.getUser();
      setIsLoggedIn(!!data.user);
    };
    
    checkLogin();
  }, []);
  
  // Check microphone access
  useEffect(() => {
    const checkMicrophoneAccess = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        setMicrophoneAccess(true);
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        console.error('Microphone access denied:', error);
        setMicrophoneAccess(false);
      }
    };
    
    checkMicrophoneAccess();
  }, []);
  
  // Handle timer countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isStarted && !isComplete && timeRemaining > 0) {
      timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            endTest();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [isStarted, isComplete, timeRemaining]);
  
  // Mock conversation handlers
  const startConversation = async () => {
    setIsLoading(true);
    
    // Add initial system message
    const initialMessage = {
      message: "Hello! I'm your language assessment assistant. Let's have a conversation to evaluate your language skills.",
      source: 'assistant' as Role
    };
    
    setMessages([initialMessage]);
    setIsLoading(false);
    
    return true;
  };
  
  const stopConversation = async () => {
    setIsRecording(false);
    return true;
  };
  
  const sendMessage = async (text: string) => {
    if (!text.trim()) return;
    
    // Add user message
    const userMessage = {
      message: text,
      source: 'user' as Role
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    
    try {
      // Mock AI response
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockResponse = {
        message: `I understand your message: "${text}". This is a mock response for testing.`,
        source: 'assistant' as Role
      };
      
      setMessages(prev => [...prev, mockResponse]);
    } catch (error) {
      console.error('Error sending message:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const startRecording = async () => {
    setIsRecording(true);
    setTranscript('');
    
    // Simulate recording process
    toast({
      title: 'Recording Started',
      description: 'Speak clearly into your microphone.',
    });
    
    return true;
  };
  
  const stopRecording = async () => {
    setIsRecording(false);
    
    // Simulate transcript generation
    const mockTranscript = 'This is a mock transcript from voice recording.';
    setTranscript(mockTranscript);
    
    await sendMessage(mockTranscript);
    
    return true;
  };
  
  // Test specific functions
  const startTest = async () => {
    if (!isLoggedIn || !microphoneAccess) {
      return;
    }
    
    setIsStarted(true);
    setIsComplete(false);
    setTimeRemaining(180);
    setConversation({ status: 'connected' });
    
    await startConversation();
    
    // Simulate conversation start
    toast({
      title: 'Test Started',
      description: 'You have 3 minutes to complete the conversation test.',
    });
  };
  
  const endTest = async () => {
    setIsStarted(false);
    setIsComplete(true);
    await stopConversation();
    
    // Generate mock test results
    const mockResults = {
      speaking: {
        overallScore: 75,
        level: 'B1',
        pronunciation: 7,
        fluency: 8,
        grammar: 6
      },
      listening: {
        overallScore: 80,
        level: 'B2',
        understanding: 8,
        vocabulary: 7,
        interaction: 8
      },
      feedback: "You demonstrated good conversational ability with some minor grammar mistakes. Your pronunciation is clear, though there's room for improvement with certain sounds. You understood most questions well and responded appropriately.",
      strengths: [
        "Good overall fluency and natural speech rhythm",
        "Strong vocabulary for everyday topics",
        "Good listening comprehension skills"
      ],
      areasToImprove: [
        "Work on grammatical accuracy, especially with verb tenses",
        "Practice pronunciation of specific sounds",
        "Expand vocabulary for more specialized topics"
      ]
    };
    
    setTestResult(mockResults);
    setConversationTranscript(messages.map(m => `${m.source}: ${m.message}`).join('\n'));
    
    // Notify parent component if callback provided
    if (onTestComplete) {
      onTestComplete();
    }
  };
  
  const resetTest = () => {
    setIsStarted(false);
    setIsComplete(false);
    setTimeRemaining(180);
    setMessages([]);
    setTestResult(null);
    setConversationTranscript('');
  };
  
  return {
    messages,
    isLoading,
    isRecording,
    transcript,
    isStarted,
    isComplete,
    timeRemaining,
    isLoggedIn,
    microphoneAccess,
    testResult,
    conversation,
    conversationTranscript,
    startConversation,
    stopConversation,
    sendMessage,
    startRecording,
    stopRecording,
    startTest,
    endTest,
    resetTest
  };
};
