
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover";
import { HelpCircle, Volume2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { playTTS } from "@/utils/tts";
import { supabase } from "@/integrations/supabase/client";
import type { Message, SuggestionCategory } from "@/types/chat";
import { Separator } from "@/components/ui/separator";

interface HintButtonProps {
  targetLanguage: string;
  messages: Message[];
  className?: string;
}

export default function HintButton({ targetLanguage, messages, className }: HintButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState<string | null>(null);
  const [hints, setHints] = useState<SuggestionCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { t, currentLanguage } = useLocalization();
  const { toast } = useToast();
  
  const fetchSuggestions = async () => {
    if (messages.length === 0) return;
    
    setIsLoading(true);
    try {
      // Get the last few messages from the conversation (max 5)
      const recentMessages = messages.slice(-5);
      
      console.log("Fetching hints with params:", {
        targetLanguage,
        userLanguage: currentLanguage || 'english',
        messageCount: recentMessages.length
      });
      
      const { data, error } = await supabase.functions.invoke("chat-with-tutor", {
        body: {
          conversationHistory: recentMessages,
          requestType: 'hint',
          targetLanguage,
          userLanguage: currentLanguage || 'english', // Use current UI language
        }
      });
      
      if (error) {
        console.error("Error fetching hints:", error);
        throw error;
      }
      
      console.log("Hint response:", data);
      
      // Updated structure handling - check if suggestions are in data.categories or data.suggestions
      if (data?.categories && Array.isArray(data.categories)) {
        setHints(data.categories);
      } else if (data?.suggestions && Array.isArray(data.suggestions)) {
        setHints(data.suggestions);
      } else {
        // Fallback hints if the API doesn't return suggestions in the expected format
        setHints([
          {
            title: t("greetings"),
            suggestions: ["Hola, ¿cómo estás?", "Buenos días", "Encantado de conocerte"]
          },
          {
            title: t("questions"),
            suggestions: ["¿Qué te gusta hacer?", "¿De dónde eres?", "¿Cuál es tu comida favorita?"]
          }
        ]);
      }
    } catch (err) {
      console.error("Error fetching hints:", err);
      toast({
        title: t("error"),
        description: t("couldNotGenerateHints"),
        variant: "destructive",
      });
      
      // Set fallback hints on error
      setHints([
        {
          title: t("greetings"),
          suggestions: ["Hola, ¿cómo estás?", "Buenos días", "Encantado de conocerte"]
        },
        {
          title: t("questions"),
          suggestions: ["¿Qué te gusta hacer?", "¿De dónde eres?", "¿Cuál es tu comida favorita?"]
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const playHintAudio = (text: string) => {
    if (isPlaying) return; // Prevent multiple audio plays at once
    
    setIsPlaying(text);
    
    playTTS({
      text,
      language: targetLanguage.toLowerCase(),
      isTargetLanguage: true,
      useMetaMms: false,
      onStart: () => setIsPlaying(text),
      onEnd: () => setIsPlaying(null),
      onError: (err) => {
        console.error("TTS error:", err);
        setIsPlaying(null);
        toast({
          title: t("error"),
          description: t("failedToPlayAudio"),
          variant: "destructive",
        });
      }
    });
  };
  
  return (
    <Popover open={open} onOpenChange={(isOpen) => {
      setOpen(isOpen);
      if (isOpen) {
        fetchSuggestions();
      }
    }}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="icon"
          className={className}
          title={t("getResponseSuggestions")}
        >
          <HelpCircle className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        className="w-80 p-0" 
        align="end" 
        alignOffset={-40}
        sideOffset={8}
      >
        <div className="p-4 bg-muted/30 border-b">
          <h4 className="font-medium text-sm">{t("responseSuggestions")}</h4>
          <p className="text-xs text-muted-foreground mt-1">
            {t("clickPlayToHearPronunciation")}
          </p>
        </div>
        
        <div className="p-2 max-h-[300px] overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center p-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          ) : hints.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground text-center">
              {t("startConversationForSuggestions")}
            </div>
          ) : (
            hints.map((category, idx) => (
              <div key={idx} className="mb-4">
                <h5 className="text-xs font-medium text-muted-foreground px-2 mb-1">
                  {category.title}
                </h5>
                <div className="space-y-1">
                  {category.suggestions.map((suggestion, i) => (
                    <div 
                      key={i}
                      className="flex items-center justify-between p-2 text-sm rounded-md hover:bg-muted"
                    >
                      <span className="flex-1 mr-2">{suggestion}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={`h-8 w-8 p-0 ${isPlaying === suggestion ? 'text-primary' : ''}`}
                        disabled={isPlaying !== null}
                        onClick={() => playHintAudio(suggestion)}
                      >
                        <Volume2 className="h-4 w-4" />
                        <span className="sr-only">{t("play")}</span>
                      </Button>
                    </div>
                  ))}
                </div>
                {idx < hints.length - 1 && <Separator className="my-2" />}
              </div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
