import React from "react";
import SafetyWarning from "./SafetyWarning";
import MessageContent from "./MessageContent";
import TranslationSection from "./TranslationSection";
import GrammarFeedbackSection, { parseGrammarFromContent } from "./GrammarFeedbackSection";

interface GrammarFeedback {
  hasErrors: boolean;
  message?: string;
  corrections?: Array<{
    original: string;
    corrected: string;
    explanation: string;
  }>;
}

interface ChatMessageBubbleProps {
  role: "user" | "assistant" | "system";
  safeContent: string;
  safeTranslation: string;
  showTranslation: boolean;
  wasContentFiltered: boolean;
  targetLanguage: string;
  nativeLanguage: string;
  currentLanguage: string;
  grammarFeedback?: GrammarFeedback | null;
  showBilingualOutput?: boolean;
  nativeContent?: string;
}

const ChatMessageBubble: React.FC<ChatMessageBubbleProps> = ({
  role,
  safeContent,
  safeTranslation,
  showTranslation,
  wasContentFiltered,
  targetLanguage,
  nativeLanguage,
  currentLanguage,
  grammarFeedback,
  showBilingualOutput = false,
  nativeContent,
}) => {
  // Parse grammar feedback from content if not provided separately
  const { cleanContent, grammarFeedback: parsedGrammar } = parseGrammarFromContent(safeContent);
  const effectiveGrammarFeedback = grammarFeedback || parsedGrammar;
  const displayContent = effectiveGrammarFeedback ? cleanContent : safeContent;
  
  return (
    <div
      className={`max-w-[85%] rounded-2xl px-4 py-3.5 sm:px-5 sm:py-4 ${
        role === "user"
          ? "rounded-br-md bg-primary text-primary-foreground shadow-sm"
          : "rounded-bl-md border border-border/60 bg-card/80 text-card-foreground shadow-sm"
      }`}
    >
      <SafetyWarning wasContentFiltered={wasContentFiltered} />
      
      <MessageContent
        role={role}
        content={displayContent}
        isPlaying={false}
        isLoading={false}
        onPlayAudio={undefined}
      />
      
      {/* Bilingual output - show native language inline when enabled */}
      {showBilingualOutput && nativeContent && role === "assistant" && (
        <div className="mt-3 pt-3 border-t border-border/50">
          <p className={`text-base md:text-lg opacity-80 italic ${
            role === "assistant" ? "text-foreground/80" : "text-primary-foreground/80"
          }`}>
            {nativeContent}
          </p>
        </div>
      )}
      
      {/* Grammar feedback as collapsible section */}
      {effectiveGrammarFeedback && (
        <GrammarFeedbackSection
          feedback={effectiveGrammarFeedback}
          role={role}
        />
      )}
      
      {showTranslation && !showBilingualOutput && (
        <TranslationSection
          showTranslation={showTranslation}
          role={role}
          translation={safeTranslation}
          currentLanguage={currentLanguage}
          isTranslationPlaying={false}
          isTranslationLoading={false}
          originalContent={displayContent}
          onPlayTranslationAudio={undefined}
        />
      )}
    </div>
  );
};

export default ChatMessageBubble;
