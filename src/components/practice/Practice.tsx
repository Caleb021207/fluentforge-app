
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import ChatContainer from "./ChatContainer";
import ChatInput from "./ChatInput";
import LanguageMetricsPanel from "./LanguageMetricsPanel";
import PracticeGuide from "./PracticeGuide";
import PracticeHeader from "./PracticeHeader";
import PracticePromptButton from "./PracticePromptButton";
import { useChatMessaging } from "./hooks/useChatMessaging";
import { useLanguageMetricsPanel } from "./hooks/useLanguageMetricsPanel";
import LocalizationDebug from "./LocalizationDebug";
import EmptyChatState from "./EmptyChatState";
import HintButton from "./HintButton";
import LoadingIndicator from "./LoadingIndicator";

const Practice = () => {
  const { 
    messages, 
    isGenerating, 
    sendMessage, 
    startNewChat,
    error,
    hints
  } = useChatMessaging();
  
  const { 
    metrics, 
    isMetricsLoading, 
    isExpanded, 
    togglePanel, 
    analyzeConversation 
  } = useLanguageMetricsPanel();
  
  const params = useParams<{ language?: string }>();
  const targetLanguage = params.language || "spanish";
  const bottomRef = useRef<HTMLDivElement>(null);
  const [showDebug, setShowDebug] = useState(false);
  
  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isGenerating]);
  
  // Only show debug panel in development
  const isDevMode = process.env.NODE_ENV === 'development';
  
  return (
    <div className="container mx-auto max-w-4xl p-4">
      <PracticeHeader targetLanguage={targetLanguage} />
      
      {messages.length === 0 ? (
        <>
          <PracticePromptButton
            onClick={startNewChat}
            isLoading={isGenerating}
            targetLanguage={targetLanguage}
          />
          <PracticeGuide targetLanguage={targetLanguage} />
          {isDevMode && (
            <div className="mt-4">
              <button 
                onClick={() => setShowDebug(!showDebug)} 
                className="text-xs bg-amber-200 hover:bg-amber-300 px-2 py-1 rounded text-amber-900"
              >
                {showDebug ? "Hide Debug Panel" : "Show Debug Panel"}
              </button>
              {showDebug && <LocalizationDebug />}
            </div>
          )}
        </>
      ) : (
        <div className="border rounded-lg shadow-sm bg-background">
          <div className="flex flex-col h-[70vh]">
            <div className="flex-grow overflow-y-auto p-4">
              <ChatContainer
                messages={messages}
                isLoading={isGenerating}
                error={error}
              />
              {isGenerating && <LoadingIndicator />}
              <div ref={bottomRef} />
            </div>
            
            <div className="border-t p-4">
              <HintButton hints={hints} targetLanguage={targetLanguage} />
              <ChatInput
                onSubmit={sendMessage}
                isDisabled={isGenerating}
              />
            </div>
          </div>
          
          <LanguageMetricsPanel
            metrics={metrics}
            isLoading={isMetricsLoading}
            isExpanded={isExpanded}
            onToggle={togglePanel}
            onAnalyze={analyzeConversation}
          />
        </div>
      )}
    </div>
  );
};

export default Practice;
