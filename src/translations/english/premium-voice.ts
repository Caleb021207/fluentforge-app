
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
};

export default premiumVoiceTranslations;
