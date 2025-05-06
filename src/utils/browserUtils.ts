
/**
 * Utility functions for browser compatibility and feature detection
 */

/**
 * Check if the browser supports Speech Recognition
 */
export const isSpeechRecognitionSupported = (): boolean => {
  return typeof window !== 'undefined' && 
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
};

/**
 * Check if the browser is Safari
 */
export const isSafari = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return userAgent.includes('safari') && !userAgent.includes('chrome');
};

/**
 * Check if the browser is running on iOS
 */
export const isIOS = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  const userAgent = navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

/**
 * Get browser-specific troubleshooting instructions
 */
export const getBrowserInstructions = (featureName: string): string => {
  if (isSafari()) {
    if (featureName === 'speechRecognition') {
      return "Safari has limited support for speech recognition. Consider using Chrome, Edge, or Firefox for the best experience.";
    }
  }
  
  if (isIOS()) {
    return "On iOS, speech recognition works best in Safari. Make sure to grant microphone permissions when prompted.";
  }
  
  return "For the best experience, use the latest version of Chrome, Edge, or Firefox.";
};
