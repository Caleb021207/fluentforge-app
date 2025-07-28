
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

interface ErrorInfo {
  code?: string;
  status?: number;
  message?: string;
}

const isNonCriticalError = (error: unknown): boolean => {
  // Check for edge function auth errors (401s) that don't break functionality
  if (error && typeof error === 'object') {
    const errorObj = error as any;
    
    // 401 errors from edge functions (like voice-chat-auth) that don't break core functionality
    if (errorObj.status === 401 || errorObj.code === 401) {
      return true;
    }
    
    // Edge function errors that mention "not configured" but don't break chat
    if (errorObj.message && typeof errorObj.message === 'string') {
      if (errorObj.message.includes('not configured') || 
          errorObj.message.includes('API key') ||
          errorObj.message.includes('voice-chat-auth')) {
        return true;
      }
    }
  }
  
  return false;
};

export const useErrorHandler = () => {
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();

  const handleError = (error: unknown, options?: { silent?: boolean }) => {
    console.error('Error:', error);
    
    // Silent logging for non-critical errors or when explicitly requested
    if (options?.silent || isNonCriticalError(error)) {
      console.warn('Non-critical error (silent):', error);
      return;
    }
    
    setHasError(true);
    toast({
      title: t("error"),
      description: t("networkConnectionIssue"),
      variant: "destructive",
    });
  };

  const clearError = () => {
    setHasError(false);
  };

  return {
    hasError,
    setHasError,
    handleError,
    clearError
  };
};
