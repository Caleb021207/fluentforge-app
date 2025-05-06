
import { useCallback } from "react";

interface UseSilenceDetectionOptions {
  isListening: boolean;
  silenceTimeout: number;
  onEnd?: () => void;
  disableAutoStop: boolean;
}

export const useSilenceDetection = ({
  isListening,
  silenceTimeout,
  onEnd,
  disableAutoStop
}: UseSilenceDetectionOptions) => {
  // Reset silence detection timer
  const resetSilenceDetection = useCallback((
    silenceTimeoutRef: React.MutableRefObject<number | null>,
    hasTranscriptRef: React.MutableRefObject<boolean>,
    text?: string
  ) => {
    // If auto-stopping is disabled, don't set up silence detection
    if (disableAutoStop) {
      return;
    }
    
    if (silenceTimeoutRef.current !== null) {
      window.clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
    
    // Only set up silence detection if we're listening and have a silence timeout
    if (isListening && silenceTimeout && silenceTimeout > 0) {
      console.log("Setting up silence detection timeout for", silenceTimeout, "ms");
      
      // If we have text, update the hasTranscriptRef state
      if (text && text.trim() !== "") {
        hasTranscriptRef.current = true;
      }
      
      silenceTimeoutRef.current = window.setTimeout(() => {
        console.log("Silence timeout reached after", silenceTimeout, "ms");
        
        // Only auto-submit if we actually have a transcript
        if (hasTranscriptRef.current) {
          console.log("We have a transcript, calling onEnd");
          if (onEnd) {
            onEnd();
          }
        } else {
          console.log("No transcript detected, continuing to listen");
          // If no speech detected, just reset the timeout and continue listening
          resetSilenceDetection(silenceTimeoutRef, hasTranscriptRef);
        }
      }, silenceTimeout);
    }
  }, [isListening, silenceTimeout, onEnd, disableAutoStop]);
  
  return { resetSilenceDetection };
};
