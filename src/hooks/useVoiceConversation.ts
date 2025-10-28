
import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import { useLanguageAnalysis } from "@/hooks/useLanguageAnalysis";
import { getLanguagePair } from "@/utils/languageUtils";
import { useGamification } from "@/hooks/useGamification";
import { Message } from "@/types/chat";

type ConversationMessage = {
  role: 'user' | 'assistant' | 'system';
  content: string;
  translation?: string;
  timestamp: Date;
};

export const useVoiceConversation = (conversationLevel: string = "intermediate", correctGrammar: boolean = false) => {
  const [conversationHistory, setConversationHistory] = useState<ConversationMessage[]>([]);
  const [apiConversationHistory, setApiConversationHistory] = useState<{role: 'user' | 'assistant' | 'system'; content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [gptResponse, setGptResponse] = useState("");
  const [translation, setTranslation] = useState("");
  const [hasAnalyzedConversation, setHasAnalyzedConversation] = useState(false);
  const sessionIdRef = useRef<string | null>(null);
  const usageTrackingRecordIdRef = useRef<string | null>(null); // Store DB record ID
  const sessionStartedRef = useRef<boolean>(false);
  const conversationHistoryRef = useRef<ConversationMessage[]>([]);
  const sessionStartTimeRef = useRef<number | null>(null);
  const sessionEndedRef = useRef<boolean>(false);
  const cleanupSetupRef = useRef<boolean>(false);
  const { toast } = useToast();
  const { t, currentLanguage } = useLocalization();
  const { native, practice } = getLanguagePair(currentLanguage);
  const { analyzeConversation } = useLanguageAnalysis();
  const { awardXP } = useGamification();

  // Initialize the session ID
  if (!sessionIdRef.current) {
    sessionIdRef.current = crypto.randomUUID();
  }

  // Update conversationHistoryRef whenever state changes
  useEffect(() => {
    conversationHistoryRef.current = conversationHistory;
  }, [conversationHistory]);

  // Handle cleanup on unmount or page unload
  useEffect(() => {
    if (cleanupSetupRef.current) return; // Only set up once
    cleanupSetupRef.current = true;

    const handleBeforeUnload = () => {
      if (sessionStartedRef.current && !sessionEndedRef.current) {
        const history = conversationHistoryRef.current;
        const duration = sessionStartTimeRef.current 
          ? Math.ceil((Date.now() - sessionStartTimeRef.current) / 60000)
          : 0;
        
        const data = {
          record_id: usageTrackingRecordIdRef.current,
          session_id: sessionIdRef.current,
          ended_at: new Date().toISOString(),
          messages_count: history.length,
          minutes_used: duration
        };
        
        navigator.sendBeacon(
          `https://dukpljcweixxmpkiblwo.supabase.co/functions/v1/track-session-end`,
          JSON.stringify(data)
        );
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      if (sessionStartedRef.current && !sessionEndedRef.current) {
        // Capture values before cleanup
        trackSessionEnd(
          usageTrackingRecordIdRef.current,
          sessionIdRef.current,
          conversationHistoryRef.current,
          sessionStartTimeRef.current
        );
      }
    };
  }, []); // Empty dependencies - only run once!

  // Track session start in usage_tracking
  const trackSessionStart = async () => {
    if (sessionStartedRef.current) return;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      sessionStartTimeRef.current = Date.now(); // Record start time
      
      console.log('📊 Starting session:', {
        sessionId: sessionIdRef.current,
        userId: user.id
      });
      
      // Capture the inserted record's ID
      const { data, error } = await supabase
        .from('usage_tracking')
        .insert({
          student_id: user.id,
          session_type: 'voice_practice',
          session_id: sessionIdRef.current,
          messages_count: 0,
          minutes_used: 0
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('❌ Error inserting usage tracking:', error);
        return;
      }
      
      if (data?.id) {
        usageTrackingRecordIdRef.current = data.id; // Store the DB record ID
        console.log('✅ Voice practice session started with record ID:', data.id);
      }
      
      sessionStartedRef.current = true;
      sessionEndedRef.current = false; // Reset ended flag
    } catch (error) {
      console.error('❌ Error tracking session start:', error);
    }
  };

  // Track session end with passed parameters (prevents race conditions)
  const trackSessionEnd = async (
    recordId: string | null,
    sessionId: string | null,
    history: ConversationMessage[],
    startTime: number | null
  ) => {
    if (sessionEndedRef.current) return;
    sessionEndedRef.current = true;
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const duration = startTime ? Math.ceil((Date.now() - startTime) / 60000) : 0;

      console.log('📊 Ending session:', { sessionId, messagesCount: history.length, duration });

      // Check if there are at least 2 user messages to analyze
      const userMessageCount = history.filter(msg => msg.role === 'user').length;
      
      if (userMessageCount >= 2) {
        const messagesToAnalyze = history.map(msg => ({
          role: msg.role,
          content: msg.content
        }));

        let classroomId = null;
        const { data } = await supabase
          .from('student_enrollments')
          .select('class_id')
          .eq('student_id', user.id)
          .limit(1);
        
        if (data && data.length > 0) {
          classroomId = data[0].class_id;
        }

        await analyzeConversation(messagesToAnalyze, {
          sessionId: sessionId || undefined,
          classroomId: classroomId || undefined,
          silent: true
        });

        console.log('✅ Conversation analyzed on session end:', sessionId);
      }

      // Update session with final message count and duration
      let updateSuccess = false;
      
      if (recordId) {
        const { data: updateData, error: updateError } = await supabase
          .from('usage_tracking')
          .update({
            ended_at: new Date().toISOString(),
            messages_count: history.length,
            minutes_used: duration
          })
          .eq('id', recordId)
          .select();

        if (updateError) {
          console.error('❌ Error updating session:', updateError);
        } else if (updateData && updateData.length > 0) {
          updateSuccess = true;
          console.log('✅ Session updated successfully');
        }
      }
      
      if (!updateSuccess) {
        console.error('❌ Failed to update session record');
      }

      // Trigger aggregation
      await supabase.rpc('update_student_practice_counts', {
        target_student_id: user.id
      });

      console.log('✅ Session ended:', sessionId, 'Messages:', history.length, 'Minutes:', duration);
      sessionStartedRef.current = false;
    } catch (error) {
      console.error('❌ Error tracking session end:', error);
    }
  };

  const sendMessage = async (text: string, speakResponse: (text: string) => Promise<void>) => {
    if (!text.trim()) return;
    
    // Track session start on first message
    await trackSessionStart();
    
    setIsLoading(true);
    
    const userMessage: ConversationMessage = {
      role: 'user',
      content: text,
      timestamp: new Date()
    };
    
    setConversationHistory(prev => [...prev, userMessage]);
    
    try {
      // Make it clear which language we're practicing
      const { data, error } = await supabase.functions.invoke('chat-with-tutor', {
        body: { 
          message: text,
          userLanguage: native || currentLanguage,
          targetLanguage: practice || 'english',
          conversationHistory: apiConversationHistory,
          conversationLevel: conversationLevel,
          correctGrammar: correctGrammar,
          requestTranslation: true
        }
      });

      if (error) throw error;
      
      console.log("Chat response:", data);
      
      const content = data.content || data.reply || "";
      let translationText = data.translation || "";
      
      if (!translationText && currentLanguage === "hindi") {
        try {
          const { data: translationData, error: translationError } = await supabase.functions.invoke('chat-with-tutor', {
            body: {
              message: content,
              userLanguage: currentLanguage,
              requestType: 'translation'
            }
          });
          
          if (!translationError && translationData && translationData.translation) {
            translationText = translationData.translation;
            console.log("Got translation:", translationText);
          }
        } catch (translationError) {
          console.error("Failed to get translation:", translationError);
        }
      }
      
      // Extract conversational content only (before grammar note) for TTS
      const ttsContent = content.split(/\n\n?📝/)[0].trim();
      
      // Wait for TTS to load before showing the message
      await speakResponse(ttsContent);
      
      // Now add the message to conversation history after TTS is ready
      const aiMessage: ConversationMessage = {
        role: 'assistant',
        content: content,
        translation: translationText,
        timestamp: new Date()
      };
      
      setGptResponse(content);
      setTranslation(translationText);
      setConversationHistory(prev => [...prev, aiMessage]);
      
      const updatedHistory = [
        ...apiConversationHistory,
        { role: 'user' as const, content: text },
        { role: 'assistant' as const, content: content + (translationText ? "\nTranslation: " + translationText : "") }
      ];
      
      setApiConversationHistory(data.updatedHistory || updatedHistory);
      
      // Award XP for sending a voice message
      await awardXP('voice_message');
    } catch (error) {
      console.error('Error getting GPT response:', error);
      toast({
        title: t("error"),
        description: t("failedToGetResponse"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearConversation = async () => {
    // Capture current values before clearing
    const currentRecordId = usageTrackingRecordIdRef.current;
    const currentSessionId = sessionIdRef.current;
    const currentHistory = conversationHistoryRef.current;
    const currentStartTime = sessionStartTimeRef.current;
    
    // Track session end with captured values
    await trackSessionEnd(currentRecordId, currentSessionId, currentHistory, currentStartTime);
    
    setConversationHistory([]);
    setApiConversationHistory([]);
    setGptResponse("");
    setTranslation("");
    setHasAnalyzedConversation(false);
    
    // Reset session for next conversation
    sessionIdRef.current = crypto.randomUUID();
    usageTrackingRecordIdRef.current = null;
    sessionStartedRef.current = false;
    sessionEndedRef.current = false;
    sessionStartTimeRef.current = null;
  };

  const handleAnalyzeConversation = async () => {
    if (hasAnalyzedConversation) {
      toast({
        description: t("canOnlyAnalyzeOncePerSession"),
        variant: "default"
      });
      return;
    }

    if (conversationHistory.length < 4) {
      toast({
        description: t("notEnoughMessagesToAnalyze"),
        variant: "warning"
      });
      return;
    }
    
    // Format messages for analysis
    const messagesToAnalyze = conversationHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    }));
    
    // Get class ID for current user
    let classroomId = null;
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('student_enrollments')
        .select('class_id')
        .eq('student_id', user.id)
        .limit(1);
      
      if (data && data.length > 0) {
        classroomId = data[0].class_id;
      }
    }
    
    const results = await analyzeConversation(messagesToAnalyze, {
      sessionId: sessionIdRef.current || undefined,
      classroomId: classroomId || undefined
    });
    
    if (results) {
      setHasAnalyzedConversation(true);
      toast({
        title: t("conversationAnalysisComplete"),
        description: `${t("grammarAccuracy")}: ${results.grammarAccuracy.toFixed(1)}, ${t("conversationComplexity")}: ${results.conversationComplexity.toFixed(1)}`,
      });
    }
  };

  return {
    conversationHistory,
    apiConversationHistory,
    isLoading,
    sendMessage,
    clearConversation,
    handleAnalyzeConversation,
    sessionIdRef,
    hasAnalyzedConversation
  };
};
