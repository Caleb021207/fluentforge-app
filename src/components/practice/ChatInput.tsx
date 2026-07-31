
import React, { useState, useRef, KeyboardEvent, FormEvent, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Send } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import HintButton from "./HintButton";
import type { Message } from "@/types/chat";

interface ChatInputProps {
  isLoading: boolean;
  value: string;
  onChange: (value: string) => void;
  onSubmit: (e: FormEvent) => void;
  placeholder: string;
  messages: Message[];
  targetLanguage: string;
  cefrLevel?: string;
  assignmentTopic?: string;
}

export default function ChatInput({
  isLoading,
  value,
  onChange,
  onSubmit,
  placeholder,
  messages,
  targetLanguage,
  cefrLevel,
  assignmentTopic
}: ChatInputProps) {
  const { t } = useLocalization();
  const [rows, setRows] = useState(1);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  useEffect(() => {
    // Reset rows when value is empty
    if (!value) {
      setRows(1);
    }
  }, [value]);

  // Handle textarea height adjustment
  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    onChange(textarea.value);
    
    // Adjust rows based on content
    const lineCount = textarea.value.split('\n').length;
    const newRows = Math.min(5, Math.max(1, lineCount));
    setRows(newRows);
  };
  
  // Handle keyboard shortcuts
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Submit on Enter (without Shift)
    if (e.key === "Enter" && !e.shiftKey && !isLoading) {
      e.preventDefault();
      onSubmit(e);
    }
  };
  
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div className="relative">
        <Textarea
          ref={textareaRef}
          value={value}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          rows={rows}
          placeholder={placeholder}
          className="min-h-[64px] resize-none rounded-xl py-4 pr-16 text-lg md:text-xl"
          disabled={isLoading}
        />
        <div className="absolute bottom-2.5 right-2.5">
          <Button
            type="submit"
            disabled={isLoading || value.trim().length === 0}
            className="h-11 w-11 rounded-xl p-0 [&_svg]:size-5"
          >
            <Send />
            <span className="sr-only">{t("send")}</span>
          </Button>
        </div>
      </div>
      <div className="flex justify-center">
        <HintButton 
          targetLanguage={targetLanguage}
          messages={messages}
          cefrLevel={cefrLevel}
          assignmentTopic={assignmentTopic}
        />
      </div>
    </form>
  );
}
