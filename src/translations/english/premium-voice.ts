
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
  cooldownPeriodActive: "Cooldown Period Active",
  cooldownActive: "Cooldown Active",
  waitBeforeNextSession: "You need to wait before starting another session",
  cooldownPeriodDescription: "You need to wait {{time}} before starting another premium voice chat session.",
  
  // Login related messages
  loginRequired: "Login Required",
  pleaseLoginToAccessPremiumFeature: "Please login to access the premium voice chat feature",
  redirectingToLogin: "Redirecting to login page",
  failedToStartSession: "Failed to start session",
  failedToCreateSession: "Failed to create session",
  loginRequiredDescription: "To access the premium voice chat feature, please login to your account.",
  
  // Success messages
  conversationHistoryCleared: "Conversation history cleared",
  
  // Premium voice benefits
  premiumVoiceChatDescription: "Have natural voice conversations with our premium AI tutor to practice {{practice}}! The AI will help correct your grammar, vocabulary, and pronunciation.",
  premiumVoiceNote: "Premium voice chat usage is limited to one 5-minute session every 24 hours",
  benefitNaturalVoice: "Natural, human-like voice interactions using ElevenLabs technology",
  benefitAccentPronunciation: "Accurate accent and pronunciation for immersive learning",
  benefitRegularPractice: "5-minute sessions with 24-hour cooldown to encourage regular, focused practice",
};

export default premiumVoiceTranslations;
