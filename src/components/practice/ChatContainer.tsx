
import React, { useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import ChatInput from "./ChatInput";
import ChatMessage from "./ChatMessage";
import EmptyChatState from "./EmptyChatState";
import LoadingIndicator from "./LoadingIndicator";
import LanguageMetricsPanel from "./LanguageMetricsPanel";
import { useLanguageMetricsPanel } from "./hooks/useLanguageMetricsPanel";
import { useLocalization } from "@/context/LocalizationContext";
import type { TranslationType } from "./hooks/translation/types";

interface Message {
  role: "user" | "assistant" | "system";
  content: string;
  translation?: TranslationType;
}

interface ChatContainerProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  getPlaceholderText: () => string;
  targetLanguage?: string;
  bilingualMode?: boolean;
  cefrLevel?: string;
  assignmentTopic?: string;
}

export default function ChatContainer({
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading,
  getPlaceholderText,
  targetLanguage = "spanish",
  bilingualMode = false,
  cefrLevel,
  assignmentTopic
}: ChatContainerProps) {
  const { t } = useLocalization();
  const scrollRef = useRef<HTMLDivElement>(null);
  const { 
    isExpanded, 
    togglePanel, 
    metrics, 
    isAnalyzing, 
    analyzeCurrentConversation,
    hasAnalyzed
  } = useLanguageMetricsPanel(messages);
  
  // Auto-scroll disabled for better UX during rapid conversations

  return (
    <div className="space-y-2">
      <Card className="overflow-hidden mb-2">
        {/* Text selection/copy is deliberately allowed: ESL learners need to
            copy words into dictionaries and notes. */}
        <ScrollArea className="h-[460px] px-4 py-5 sm:h-[500px] sm:px-5">
          {messages.length === 0 ? (
            <EmptyChatState />
          ) : (
            <div className="space-y-5">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  translation={message.translation}
                  bilingualMode={bilingualMode}
                />
              ))}
              
              {isLoading && <LoadingIndicator />}
              
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t border-border/60 bg-background/30 p-3 sm:p-4">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            placeholder={getPlaceholderText()}
            messages={messages}
            targetLanguage={targetLanguage}
            cefrLevel={cefrLevel}
            assignmentTopic={assignmentTopic}
          />
        </div>
      </Card>

      <LanguageMetricsPanel 
        metrics={metrics}
        isLoading={isAnalyzing}
        isExpanded={isExpanded}
        onToggle={togglePanel}
        onAnalyze={analyzeCurrentConversation}
        hasAnalyzed={hasAnalyzed}
      />
    </div>
  );
}
