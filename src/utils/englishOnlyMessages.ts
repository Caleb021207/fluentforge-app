/**
 * English-only messages for system notifications, errors, and toasts
 * These should always display in English regardless of the user's UI language
 */

export const ENGLISH_ONLY_MESSAGES = {
  // Conversation level messages
  conversationLevelUpdated: "Conversation Level Updated",
  levelSetTo: "Level set to",
  grammarCorrectionEnabled: "Grammar Correction Enabled",
  grammarCorrectionDisabled: "Grammar Correction Disabled",
  tutorWillCorrectGrammar: "The tutor will now correct your grammar mistakes",
  tutorWontCorrectGrammar: "The tutor will focus on conversation flow",
  
  // Level names
  basicLevel: "Basic (A1-A2)",
  intermediateLevel: "Intermediate (B1)",
  advancedLevel: "Advanced (B2-C1)",
  
  // Common errors
  error: "Error",
  success: "Success",
  warning: "Warning",
  
  // Speech recognition errors
  speechRecognitionError: "Speech recognition error",
  speechRecognitionNotSupported: "Speech recognition is not supported in your browser",
  microphoneAccessRequired: "Microphone access is required for this feature",
  microphonePermissionDenied: "Microphone permission denied",
  
  // API errors
  failedToGetResponse: "Failed to get response from AI. Please try again.",
  failedToGenerateSpeech: "Failed to generate speech. Please try again.",
  audioPlaybackError: "Error playing audio. Please try again.",
  networkError: "Network error. Please check your connection.",
  
  // Voice chat
  voiceChatEnded: "Voice chat ended",
  timeLimit10MinReached: "The 10-minute time limit has been reached",
  timeLimit5MinReached: "The 5-minute time limit has been reached",
  
  // Usage limits
  voiceSessionBlocked: "Voice Session Blocked",
  monthlyVoiceLimitReached: "You've reached your monthly voice chat limit",
  
  // Session messages
  sessionStarted: "Session started",
  sessionEnded: "Session ended",
  
  // Generic messages
  pleaseWait: "Please wait...",
  processing: "Processing...",
  loading: "Loading...",
  tryAgain: "Please try again",
  
  // Pronunciation practice
  generatingExercise: "Generating Exercise",
  generatingNewPhrase: "Generating New Phrase",
  pronunciationAnalysisFailed: "Pronunciation analysis failed. Please try again.",
  transcriptionFailed: "Transcription failed. Please try again.",
};

export type EnglishOnlyMessageKey = keyof typeof ENGLISH_ONLY_MESSAGES;

/**
 * Get an English-only message
 * @param key The message key
 * @returns The English message
 */
export function getEnglishOnlyMessage(key: EnglishOnlyMessageKey): string {
  return ENGLISH_ONLY_MESSAGES[key];
}
