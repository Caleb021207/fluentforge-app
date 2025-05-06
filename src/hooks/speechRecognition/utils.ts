
import { getSpeechRecognitionErrorMessage } from "@/utils/speechRecognitionUtils";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

/**
 * Cleans up a speech recognition instance
 */
export const cleanupSpeechRecognition = (
  recognitionRef: React.MutableRefObject<SpeechRecognition | null>,
  silenceTimeoutRef: React.MutableRefObject<number | null>,
  restartTimeoutRef: React.MutableRefObject<number | null>,
  setIsRestarting: React.Dispatch<React.SetStateAction<boolean>>,
) => {
  console.log("Cleaning up speech recognition");
  
  // Clear any silence detection timeout
  if (silenceTimeoutRef.current !== null) {
    window.clearTimeout(silenceTimeoutRef.current);
    silenceTimeoutRef.current = null;
    console.log("Cleared silence detection timeout");
  }
  
  if (recognitionRef.current) {
    try {
      // Remove event listeners first
      recognitionRef.current.onend = null;
      recognitionRef.current.onerror = null;
      recognitionRef.current.onresult = null;
      recognitionRef.current.abort();
      console.log("Successfully aborted speech recognition");
    } catch (err) {
      console.error("Error cleaning up speech recognition:", err);
    }
  }
  
  // Clear any pending restart timeout
  if (restartTimeoutRef.current !== null) {
    window.clearTimeout(restartTimeoutRef.current);
    restartTimeoutRef.current = null;
    console.log("Cleared pending restart timeout");
  }
  
  // Reset the restarting flag
  setIsRestarting(false);
};

/**
 * Handle speech recognition errors
 */
export const handleSpeechRecognitionError = (
  errorCode: string,
  setError: (error: string) => void,
  toast: ReturnType<typeof useToast>['toast'],
  t: ReturnType<typeof useLocalization>['t'],
) => {
  console.error("Speech recognition error:", errorCode);
  setError(errorCode);
  
  const errorMessage = getSpeechRecognitionErrorMessage(errorCode);
  
  // Don't show errors for no-speech as they're common and annoying
  if (errorCode !== 'no-speech') {
    toast({
      title: t("speechRecognitionError"),
      description: errorMessage,
      variant: "destructive",
    });
  }
  
  // Return true if we should stop restarting on this error
  return ['not-allowed', 'service-not-allowed', 'permission-denied'].includes(errorCode);
};

/**
 * Request microphone access explicitly
 */
export const requestMicAccess = async (
  setError: (error: string | null) => void,
  toast: ReturnType<typeof useToast>['toast'],
  t: ReturnType<typeof useLocalization>['t'],
): Promise<boolean> => {
  try {
    console.log("Explicitly requesting microphone access...");
    await navigator.mediaDevices.getUserMedia({ audio: true });
    console.log("Microphone access granted");
    return true;
  } catch (err) {
    console.error("Error requesting microphone access:", err);
    setError("Failed to access microphone");
    toast({
      title: t("error"),
      description: t("microphoneAccessRequired"),
      variant: "destructive",
    });
    return false;
  }
};
