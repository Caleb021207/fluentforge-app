
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Send, Mic } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
  placeholder: string;
  hasAudioPermission?: boolean;
  onRequestMicAccess?: () => void;
}

const ChatInput: React.FC<ChatInputProps> = ({
  input,
  setInput,
  handleSubmit,
  isLoading,
  placeholder,
  hasAudioPermission,
  onRequestMicAccess
}) => {
  const { t } = useLocalization();
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus the input field when it's available
  useEffect(() => {
    if (inputRef.current && !isLoading) {
      inputRef.current.focus();
    }
  }, [isLoading]);

  return (
    <form onSubmit={handleSubmit} className="flex gap-3">
      <input
        ref={inputRef}
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder={placeholder}
        className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-lingua-accent transition-all duration-200
                  dark:bg-gray-800/80 dark:border-gray-700 dark:text-gray-100 dark:placeholder:text-gray-500 dark:focus:ring-lingua-blue-primary"
        disabled={isLoading}
      />
      
      {onRequestMicAccess && (
        <Button 
          type="button" 
          onClick={onRequestMicAccess}
          variant={hasAudioPermission ? "outline" : "default"}
          className={`${hasAudioPermission ? 'bg-green-100 dark:bg-green-900/20' : ''}`}
          title={hasAudioPermission ? t("microphoneActive") : t("requestMicAccess")}
        >
          <Mic className={`h-4 w-4 ${hasAudioPermission ? 'text-green-600 dark:text-green-400' : ''}`} />
        </Button>
      )}
      
      <Button 
        type="submit" 
        disabled={isLoading || !input.trim()} // Only disabled if loading or empty input
        className="bg-lingua-accent hover:bg-lingua-accent-hover text-lingua-primary font-medium transition-colors duration-200
                 dark:bg-lingua-blue-primary dark:hover:bg-lingua-blue-dark dark:text-white"
      >
        <Send className="h-4 w-4 mr-2" />
        {t("send")}
      </Button>
    </form>
  );
};

export default ChatInput;
