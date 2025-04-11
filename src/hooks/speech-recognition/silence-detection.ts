
import { useRef, useEffect } from "react";

export const useSilenceDetection = (
  silenceTimeout: number = 5000,
  onSilence?: () => void
) => {
  const silenceTimerRef = useRef<number | null>(null);
  
  // Clear up any timers on unmount
  useEffect(() => {
    return () => {
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
    };
  }, []);
  
  const resetSilenceDetection = () => {
    if (onSilence) {
      // Clear any existing timer
      if (silenceTimerRef.current) {
        window.clearTimeout(silenceTimerRef.current);
      }
      
      // Set a new timer
      silenceTimerRef.current = window.setTimeout(() => {
        console.log(`Silence detected after ${silenceTimeout}ms`);
        if (onSilence) {
          onSilence();
        }
      }, silenceTimeout);
    }
  };
  
  const clearSilenceDetection = () => {
    if (silenceTimerRef.current) {
      window.clearTimeout(silenceTimerRef.current);
      silenceTimerRef.current = null;
    }
  };
  
  return {
    resetSilenceDetection,
    clearSilenceDetection
  };
};
