
import { TranslationRecord } from "../types";

const premiumVoiceTranslations: TranslationRecord = {
  premiumVoiceChat: "Premium Voice Chat",
  premiumVoiceChatBenefits: "Premium Voice Benefits",
  textConversationPractice: "Text Conversation Practice",
  cefrA1Description: "Beginner - Basic phrases and expressions",
  cefrA2Description: "Elementary - Simple everyday communication",
  cefrB1Description: "Intermediate - Can discuss familiar topics",
  cefrB2Description: "Upper Intermediate - Can interact with fluency",
  beginner: "Beginner",
  elementary: "Elementary",
  intermediate: "Intermediate",
  upperIntermediate: "Upper Intermediate",
  selectCEFRLevel: "Select CEFR Level",
  selectedLevel: "Selected Level",
  
  // Fixed premium voice chat cooldown messages
  cooldownPeriodActive: "Weekly Limit Reached",
  cooldownActive: "Weekly Limit Reached",
  waitBeforeNextSession: "You need to wait before starting another session",
  cooldownPeriodDescription: "You need to wait {{time}} before starting another premium voice chat session.",
  resetsAt6AM: "Your 10-minute weekly allowance will reset in {{time}} (Monday at 6:00 AM)",
  dailyLimitReached: "You've used your 10-minute weekly allowance. Time will reset on Monday at 6:00 AM.",
  premiumSessionLimitReached: "Weekly Premium Session Limit Reached",
  
  // Login related messages
  loginRequired: "Login Required",
  pleaseLoginToAccessPremiumFeature: "Please login to access the premium voice chat feature",
  redirectingToLogin: "Redirecting to login page",
  failedToStartSession: "Failed to start session",
  failedToCreateSession: "Failed to create session",
  loginRequiredDescription: "To access the premium voice chat feature, please login to your account.",
  
  // Success messages
  conversationHistoryCleared: "Conversation history cleared",
  remaining: "remaining this week",
  
  // Premium voice benefits
  premiumVoiceChatDescription: "Have natural voice conversations with our premium AI tutor to practice {{practice}}! The AI will help correct your grammar, vocabulary, and pronunciation.",
  premiumVoiceNote: "Premium voice chat usage is limited to one 10-minute session every week",
  premiumVoiceNoteWithReset: "Premium voice chat allows for 10 minutes of practice time weekly. Your time resets every Monday at 6:00 AM Central Time.",
  benefitNaturalVoice: "Natural, human-like voice interactions using ElevenLabs technology",
  benefitAccentPronunciation: "Accurate accent and pronunciation for immersive learning",
  benefitRegularPractice: "10 minutes of practice time weekly, resetting each Monday at 6:00 AM Central Time",
  timeLimit10MinReached: "10-minute time limit reached",
  
  // Language-specific advanced voice pages
  spanishAdvancedVoice: "Spanish Advanced Voice",
  spanishAdvancedVoiceChat: "Spanish Advanced Voice Chat",
  portugueseAdvancedVoice: "Portuguese Advanced Voice",
  portugueseAdvancedVoiceChat: "Portuguese Advanced Voice Chat",
  advancedVoiceDescription: "Practice with advanced voice technology specifically optimized for {{language}} speakers",
  
  // Premium Voice Practice Page
  premiumVoicePractice: "Premium Voice Practice",
  practiceConversationalEnglish: "Practice conversational English with GPT-4o Realtime",
  minutesRemainingThisMonth: "{{minutes}} minutes remaining this month",
  startPremiumSession: "Start Premium Session",
  endSession: "End Session",
  poweredByGPT4oRealtime: "Powered by GPT-4o Realtime",
  conversation: "Conversation",
  you: "You",
  aiTutor: "AI Tutor",
  minutesLeft: "{{minutes}} minutes left",
  connected: "Connected",
  premiumVoiceReady: "Premium voice practice is ready. Start speaking!",
  limitReached: "Limit Reached",
  monthlyLimitMessage: "You've used all {{minutes}} minutes this month. Resets on the 1st.",
  sessionSaved: "Session Saved",
  usedMinutesMessage: "Used {{minutes}} minute{{plural}} this session",
  timeWarning: "Time Warning",
  minutesRemainingWarning: "{{minutes}} minute{{plural}} remaining",
  sessionEnded: "Session Ended",
  premiumSessionEndedMessage: "Your 15-minute premium session has ended",
  premiumVoiceInstructions: "This feature is designed for fluid, dynamic conversations. You get 15 minutes of practice per month. Simply hit the button and say 'Hello, how are you?' The AI tutor will help you practice your English speaking skills.",
  
  // Language support messages
  gptLanguageSupport: "GPT-4o Realtime supports 20+ languages. While optimized for English, it provides natural conversations in your language.",
  customLanguageSupport: "Custom Realtime AI supports 99+ languages. This system uses specialized multilingual models including Whisper (speech recognition), GPT-4o-mini (conversation), and Azure TTS (voice synthesis).",
  recommendedForYourLanguage: "Recommended for your language",
  multilingualSupport: "MULTILINGUAL",
  customRealtimeDisclaimer: "Each recording is limited to 1 minute. After 3 seconds of silence, your message will be automatically sent.",
  
  // Voice practice page
  openaiLatestVoiceModel: "OpenAI's latest voice model",
  connecting: "Connecting...",
  startGptSession: "Start GPT Session",
  startCustomSession: "Start Custom Session",
  exchanges: "exchanges",
  stateListening: "listening",
  stateProcessing: "processing",
  stateSpeaking: "speaking",
  stateIdle: "idle",
};

export default premiumVoiceTranslations;
