
import React, { useState, useEffect } from "react";
import { Bot, User, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ConversationItemProps {
  message: string;
  isAi: boolean;
}

const ConversationItem = ({ message, isAi }: ConversationItemProps) => {
  const [expandedView, setExpandedView] = useState(false);
  const [truncatedMessage, setTruncatedMessage] = useState("");
  const [isLongMessage, setIsLongMessage] = useState(false);
  const maxCharsToShow = 300;
  
  useEffect(() => {
    if (!message) return;
    
    const isLong = message.length > maxCharsToShow;
    setIsLongMessage(isLong);
    
    if (isLong && !expandedView) {
      setTruncatedMessage(`${message.substring(0, maxCharsToShow)}...`);
    } else {
      setTruncatedMessage(message);
    }
  }, [message, expandedView]);

  // Function to format message text - detects and formats URLs, line breaks, etc.
  const formatMessage = (text: string) => {
    // Handle undefined or empty strings
    if (!text) {
      console.warn('Received empty or undefined message in ConversationItem:', { isAi });
      return "No content";
    }
    
    // Check if message appears to be JSON, try to format it nicely
    if (typeof text === 'string' && (text.startsWith('{') || text.startsWith('['))) {
      try {
        const parsed = JSON.parse(text);
        console.log('Message appears to be JSON:', parsed);
        // If it's valid JSON, display it prettified
        return <pre className="whitespace-pre-wrap text-xs font-mono bg-gray-50 p-2 rounded">
          {JSON.stringify(parsed, null, 2)}
        </pre>;
      } catch (e) {
        // Not valid JSON, continue with normal formatting
        console.log('Message looks like JSON but fails to parse:', e);
      }
    }
    
    // Convert line breaks to <br /> tags
    const withLineBreaks = text.split('\n').map((line, i) => (
      <React.Fragment key={i}>
        {line}
        {i < text.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
    
    return withLineBreaks;
  };

  // Log messages for debugging
  React.useEffect(() => {
    console.log(`Rendering ${isAi ? 'AI' : 'User'} message:`, 
      message?.length > 100 ? `${message.substring(0, 100)}... (${message.length} chars)` : message
    );
  }, [message, isAi]);

  return (
    <div className="flex gap-3 mb-4">
      <div className={`flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border ${
        isAi ? "bg-primary text-primary-foreground" : "bg-muted"
      } shadow${isAi ? "" : "-sm"}`}>
        {isAi ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
      </div>
      <div className="flex-1 space-y-2">
        <div className="prose-sm prose-gray max-w-none">
          <p>{formatMessage(isLongMessage && !expandedView ? truncatedMessage : message)}</p>
          
          {isLongMessage && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setExpandedView(!expandedView)}
              className="mt-1 text-xs flex items-center gap-1 h-6 px-2"
            >
              {expandedView ? (
                <>
                  <ChevronUp className="h-3 w-3" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3" />
                  Show more
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ConversationItem;
