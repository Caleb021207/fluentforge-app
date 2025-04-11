
import { useRef } from "react";

export const useSilenceDetection = (
  silenceTimeout: number,
  onSilence?: () => void
) => {
  const silenceTimeoutRef = useRef<number | null>(null);
  
  const resetSilenceDetection = () => {
    clearSilenceDetection();
    
    if (onSilence) {
      silenceTimeoutRef.current = window.setTimeout(() => {
        console.log(`${silenceTimeout/1000} seconds of silence detected, automatically sending message`);
        onSilence();
      }, silenceTimeout);
    }
  };

  const clearSilenceDetection = () => {
    if (silenceTimeoutRef.current !== null) {
      clearTimeout(silenceTimeoutRef.current);
      silenceTimeoutRef.current = null;
    }
  };
  
  return {
    resetSilenceDetection,
    clearSilenceDetection
  };
};
