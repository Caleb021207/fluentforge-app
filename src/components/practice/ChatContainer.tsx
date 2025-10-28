
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

interface Message {
  role: "user" | "assistant";
  content: string;
  translation?: string;
}

interface ChatContainerProps {
  messages: Message[];
  input: string;
  setInput: (value: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  getPlaceholderText: () => string;
  targetLanguage?: string;
}

export default function ChatContainer({
  messages,
  input,
  setInput,
  handleSubmit,
  isLoading,
  getPlaceholderText,
  targetLanguage = "spanish"
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
        <ScrollArea className="h-[500px] p-4 select-none" onContextMenu={(e) => e.preventDefault()} onCopy={(e) => e.preventDefault()}>
          {messages.length === 0 ? (
            <EmptyChatState />
          ) : (
            <div className="space-y-4">
              {messages.map((message, index) => (
                <ChatMessage
                  key={index}
                  role={message.role}
                  content={message.content}
                  translation={message.translation}
                />
              ))}
              
              {isLoading && <LoadingIndicator />}
              
              <div ref={scrollRef} />
            </div>
          )}
        </ScrollArea>
        
        <div className="border-t p-4">
          <ChatInput
            value={input}
            onChange={setInput}
            onSubmit={handleSubmit}
            isLoading={isLoading}
            placeholder={getPlaceholderText()}
            messages={messages}
            targetLanguage={targetLanguage}
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
