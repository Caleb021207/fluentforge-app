
import { TranslationRecord } from "../types";

const premiumVoiceTranslations: TranslationRecord = {
  // Premium voice chat features
  premiumVoiceChat: "Premium Voice Chat",
  unlimitedVoicePractice: "Premium Voice Practice",
  premiumVoiceChatBenefits: "Premium Voice Benefits",
  textConversationPractice: "Text Conversation Practice",
  
  // Instructions
  howToUse: "How to Use Premium Voice Practice",
  step1: "Click 'Start Premium Session' to begin",
  step2: "Allow microphone access when prompted",
  step3: "The AI tutor will greet you and ask the first question",
  step4: "Speak naturally and clearly in {{targetLanguage}}",
  step5: "The AI will respond and help correct your mistakes",
  step6: "Watch your timer - you have 15 minutes this month",
  step7: "Click 'End Session' when finished",
  tips: "Tips for Best Experience",
  tip1: "Use headphones for better audio quality",
  tip2: "Find a quiet environment",
  tip3: "Don't be afraid to make mistakes!",
  
  // General
  practiceConversational: "Practice conversational {{targetLanguage}} with GPT-4o-mini Realtime",
  minutesRemaining: "minutes remaining this month",
  poweredBy: "Powered by GPT-4o-mini Realtime",
  conversation: "Conversation",
  
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
};

export default premiumVoiceTranslations;
