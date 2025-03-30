
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { Send, RefreshCw, MessageSquare } from 'lucide-react';
import { useLocalization } from '@/context/LocalizationContext';
import { supabase } from '@/integrations/supabase/client';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  translation?: string;
  timestamp: Date;
};

// Define language level options
const languageLevels = [
  { value: 'A1', label: 'A1 - Beginner' },
  { value: 'A2', label: 'A2 - Elementary' },
  { value: 'B1', label: 'B1 - Intermediate', default: true },
  { value: 'B2', label: 'B2 - Upper Intermediate' },
  { value: 'C1', label: 'C1 - Advanced' },
];

const DynamicChat = () => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [conversationHistory, setConversationHistory] = useState<any[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('B1');
  const { toast } = useToast();
  const { currentLanguage, t } = useLocalization();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Helper function to add system welcome message
  useEffect(() => {
    const welcomeMessage = getWelcomeMessage();
    if (welcomeMessage && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content: welcomeMessage.message,
          translation: welcomeMessage.translation,
          timestamp: new Date(),
        },
      ]);
    }
  }, [currentLanguage, messages.length]);

  const getWelcomeMessage = () => {
    if (currentLanguage === 'english') {
      return {
        message: '¡Hola! Soy tu tutor de español. ¿Cómo puedo ayudarte hoy?',
        translation: 'Hello! I am your Spanish tutor. How can I help you today?',
      };
    } else if (currentLanguage === 'spanish') {
      return {
        message: 'Hello! I am your English tutor. How can I help you today?',
        translation: '¡Hola! Soy tu tutor de inglés. ¿Cómo puedo ayudarte hoy?',
      };
    } else if (currentLanguage === 'portuguese') {
      return {
        message: 'Hello! I am your English tutor. How can I help you today?',
        translation: 'Olá! Eu sou seu tutor de inglês. Como posso ajudá-lo hoje?',
      };
    }
    return null;
  };

  const getLanguagePair = () => {
    if (currentLanguage === 'english') {
      return { learning: 'Spanish', native: 'English' };
    } else if (currentLanguage === 'spanish') {
      return { learning: 'English', native: 'Spanish' };
    } else if (currentLanguage === 'portuguese') {
      return { learning: 'English', native: 'Portuguese' };
    }
    return { learning: 'Spanish', native: 'English' }; // Default fallback
  };

  const sendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    
    if (!message.trim()) return;
    
    const userMessage = {
      role: 'user' as const,
      content: message,
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setMessage('');
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('chat-with-gpt', {
        body: {
          message: message,
          userLanguage: currentLanguage,
          conversationHistory,
          cefrLevel: selectedLevel,
        },
      });
      
      if (error) throw error;
      
      // Update conversation history for context
      setConversationHistory(data.updatedHistory || []);
      
      const aiResponse = {
        role: 'assistant' as const,
        content: data.content,
        translation: data.translation,
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error in chat:', error);
      toast({
        title: t('error'),
        description: error instanceof Error ? error.message : 'Failed to get AI response',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setConversationHistory([]);
    
    // Add welcome message again
    const welcomeMessage = getWelcomeMessage();
    if (welcomeMessage) {
      setMessages([
        {
          role: 'assistant',
          content: welcomeMessage.message,
          translation: welcomeMessage.translation,
          timestamp: new Date(),
        },
      ]);
    }
    
    toast({
      title: 'Conversation Reset',
      description: 'Your conversation has been reset.',
    });
  };

  const { learning, native } = getLanguagePair();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-lingua-text mb-4">Dynamic AI Conversation</h1>
        <p className="text-gray-600 mb-4">
          {currentLanguage === 'english' 
            ? `Chat with our AI language tutor to practice your ${learning}! The AI will help correct your grammar, vocabulary, and provide translations.`
            : currentLanguage === 'spanish'
              ? `¡Chatea con nuestro tutor de idiomas con IA para practicar tu ${learning}! La IA te ayudará a corregir tu gramática, vocabulario y proporcionará traducciones.`
              : `Converse com nosso tutor de idiomas com IA para praticar seu ${learning}! A IA ajudará a corrigir sua gramática, vocabulário e fornecerá traduções.`}
        </p>
        
        <div className="flex items-center gap-2 mb-4">
          <label className="text-sm font-medium">
            {currentLanguage === 'english' 
              ? 'Language Level:' 
              : currentLanguage === 'spanish' 
                ? 'Nivel de Idioma:' 
                : 'Nível de Idioma:'}
          </label>
          <select 
            className="border rounded px-2 py-1 text-sm"
            value={selectedLevel}
            onChange={(e) => setSelectedLevel(e.target.value)}
          >
            {languageLevels.map(level => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
          
          <Button 
            variant="outline" 
            size="sm" 
            className="ml-auto" 
            onClick={resetConversation}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            {currentLanguage === 'english' 
              ? 'Reset Chat' 
              : currentLanguage === 'spanish' 
                ? 'Reiniciar Chat' 
                : 'Reiniciar Chat'}
          </Button>
        </div>
      </div>

      <Card className="mb-6">
        <CardContent className="pt-6">
          <div className="overflow-y-auto max-h-[500px] space-y-4 mb-4">
            {messages.map((msg, index) => (
              <div 
                key={index} 
                className={`flex flex-col ${
                  msg.role === 'user' ? 'items-end' : 'items-start'
                }`}
              >
                <div 
                  className={`max-w-[80%] rounded-lg p-3 ${
                    msg.role === 'user' 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-100 text-gray-800'
                  }`}
                >
                  <p>{msg.content}</p>
                  {msg.translation && (
                    <p className="mt-2 text-sm opacity-80 border-t pt-2">
                      {msg.translation}
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-500 mt-1">
                  {msg.timestamp.toLocaleTimeString()}
                </span>
              </div>
            ))}
            {isLoading && (
              <div className="flex items-start">
                <div className="bg-gray-100 text-gray-800 rounded-lg p-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    <div className="h-2 w-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef}></div>
          </div>
          
          <form onSubmit={sendMessage} className="flex items-end gap-2">
            <Textarea
              placeholder={currentLanguage === 'english' 
                ? `Type your message in English or ${learning}...` 
                : currentLanguage === 'spanish'
                  ? `Escribe tu mensaje en español o ${learning}...`
                  : `Digite sua mensagem em português ou ${learning}...`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="flex-1 resize-none"
              rows={3}
            />
            <Button 
              type="submit" 
              disabled={isLoading || !message.trim()} 
              className="bg-lingua-primary hover:bg-lingua-primary/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
      
      <div className="bg-blue-50 border border-blue-200 rounded-md p-4 text-sm text-blue-800">
        <div className="flex items-center gap-2 font-medium mb-2">
          <MessageSquare className="h-4 w-4" />
          {currentLanguage === 'english' 
            ? 'Dynamic AI Tutor Capabilities' 
            : currentLanguage === 'spanish'
              ? 'Capacidades del Tutor de IA Dinámico'
              : 'Capacidades do Tutor de IA Dinâmico'}
        </div>
        <ul className="list-disc list-inside space-y-1 ml-1">
          <li>
            {currentLanguage === 'english' 
              ? `Adjusts to your selected language level (${selectedLevel})` 
              : currentLanguage === 'spanish'
                ? `Se ajusta a tu nivel de idioma seleccionado (${selectedLevel})`
                : `Ajusta-se ao seu nível de idioma selecionado (${selectedLevel})`}
          </li>
          <li>
            {currentLanguage === 'english' 
              ? 'Provides translations for easy understanding' 
              : currentLanguage === 'spanish'
                ? 'Proporciona traducciones para una fácil comprensión'
                : 'Fornece traduções para facilitar a compreensão'}
          </li>
          <li>
            {currentLanguage === 'english' 
              ? 'Remembers conversation context for natural dialogue' 
              : currentLanguage === 'spanish'
                ? 'Recuerda el contexto de la conversación para un diálogo natural'
                : 'Lembra o contexto da conversa para um diálogo natural'}
          </li>
          <li>
            {currentLanguage === 'english' 
              ? 'Offers gentle corrections to improve your language skills' 
              : currentLanguage === 'spanish'
                ? 'Ofrece correcciones suaves para mejorar tus habilidades lingüísticas'
                : 'Oferece correções suaves para melhorar suas habilidades linguísticas'}
          </li>
        </ul>
      </div>
    </div>
  );
};

export default DynamicChat;
