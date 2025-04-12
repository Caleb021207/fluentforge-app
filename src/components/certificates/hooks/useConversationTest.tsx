
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

type Role = 'user' | 'assistant';

type Message = {
  message: string;
  source: Role;
};

export const useConversationTest = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const { toast } = useToast();
  
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
  
  return {
    messages,
    isLoading,
    isRecording,
    transcript,
    startConversation,
    stopConversation,
    sendMessage,
    startRecording,
    stopRecording,
  };
};
