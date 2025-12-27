import React, { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface GrammarCorrection {
  original: string;
  corrected: string;
  explanation: string;
}

interface GrammarFeedback {
  hasErrors: boolean;
  message?: string;
  corrections?: GrammarCorrection[];
}

interface GrammarFeedbackSectionProps {
  feedback: GrammarFeedback | string | null;
  role: "user" | "assistant" | "system";
}

/**
 * Parses inline grammar feedback from message content
 * Looks for pattern: 📝 Grammar note: ...
 */
export const parseGrammarFromContent = (content: string): { cleanContent: string; grammarFeedback: GrammarFeedback | null } => {
  // Look for the grammar note pattern
  const grammarPattern = /\n?\n?📝\s*Grammar\s*note:\s*(.+)$/is;
  const match = content.match(grammarPattern);
  
  if (match) {
    const grammarMessage = match[1].trim();
    const cleanContent = content.replace(grammarPattern, '').trim();
    
    // Check if it's a "no corrections needed" message
    const noErrorPatterns = [
      /great job/i,
      /no corrections needed/i,
      /perfect/i,
      /excellent/i,
      /well done/i
    ];
    
    const hasNoErrors = noErrorPatterns.some(pattern => pattern.test(grammarMessage));
    
    return {
      cleanContent,
      grammarFeedback: {
        hasErrors: !hasNoErrors,
        message: grammarMessage
      }
    };
  }
  
  return { cleanContent: content, grammarFeedback: null };
};

const GrammarFeedbackSection: React.FC<GrammarFeedbackSectionProps> = ({
  feedback,
  role
}) => {
  const { t } = useLocalization();
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Only show for assistant messages with feedback
  if (!feedback || role !== "assistant") {
    return null;
  }
  
  // Parse feedback - handle both string and object formats
  const parsedFeedback: GrammarFeedback = typeof feedback === 'string' 
    ? { hasErrors: true, message: feedback }
    : feedback;
  
  if (!parsedFeedback.message && !parsedFeedback.corrections?.length) {
    return null;
  }
  
  return (
    <div className="border-t border-border mt-2 pt-2">
      {/* Grammar feedback toggle button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-2 w-full justify-start"
      >
        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        <Sparkles size={14} className={parsedFeedback.hasErrors ? "text-amber-500" : "text-green-500"} />
        <span>
          {parsedFeedback.hasErrors 
            ? (t("showGrammarFeedback") || "Show Grammar Feedback")
            : (t("grammarCorrect") || "Grammar: Great job!")}
        </span>
      </button>
      
      {/* Grammar feedback content - only shown when expanded */}
      {isExpanded && (
        <div className={`p-3 rounded-md text-sm ${
          parsedFeedback.hasErrors 
            ? "bg-amber-500/10 border border-amber-500/20 text-amber-700 dark:text-amber-300"
            : "bg-green-500/10 border border-green-500/20 text-green-700 dark:text-green-300"
        }`}>
          {parsedFeedback.message && (
            <p className="whitespace-pre-wrap">{parsedFeedback.message}</p>
          )}
          
          {parsedFeedback.corrections && parsedFeedback.corrections.length > 0 && (
            <ul className="mt-2 space-y-2">
              {parsedFeedback.corrections.map((correction, index) => (
                <li key={index} className="border-l-2 border-amber-500 pl-2">
                  <p className="line-through text-muted-foreground">{correction.original}</p>
                  <p className="font-medium">{correction.corrected}</p>
                  {correction.explanation && (
                    <p className="text-xs mt-1 opacity-80">{correction.explanation}</p>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};

export default GrammarFeedbackSection;
