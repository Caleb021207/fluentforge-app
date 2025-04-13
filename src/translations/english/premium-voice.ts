
import { TranslationRecord } from "../types";

const premiumVoiceTranslations: TranslationRecord = {
  premiumVoiceChat: "Premium Voice Chat",
  premiumVoiceChatBenefits: "Premium Voice Benefits",
  textConversationPractice: "Text conversation practice",
  cefrA1Description: "Beginner - Basic phrases and expressions",
  cefrA2Description: "Elementary - Simple everyday communication",
  cefrB1Description: "Intermediate - Can discuss familiar topics",
  cefrB2Description: "Upper Intermediate - Can communicate with fluency",
  beginner: "Beginner",
  elementary: "Elementary",
  intermediate: "Intermediate",
  upperIntermediate: "Upper Intermediate",
  selectCEFRLevel: "Select CEFR Level",
  selectedLevel: "Selected Level",
  
  // Tier-related messages
  upgradeYourTier: "Upgrade Your Tier",
  getMorePremiumTime: "Get more premium voice chat time",
  currentAllowance: "Current allowance",
  nextTierAllowance: "Next tier allowance",
  upgradeToGetMoreTime: "Upgrade your tier to get more weekly practice time with our AI tutors",
  upgradeNow: "Upgrade Now",
  tierResetInfo: "Your weekly time resets every Monday at 6:00 AM UTC",
  
  // Fixed premium voice chat cooldown messages
  cooldownPeriodActive: "Weekly limit reached",
  cooldownActive: "Weekly limit reached",
  waitBeforeNextSession: "You need to wait before starting another session",
  cooldownPeriodDescription: "You need to wait {{time}} before starting another premium voice chat session.",
  resetsAt6AM: "Your 10 minutes weekly time will reset after {{time}} (Monday 6:00 AM)",
  dailyLimitReached: "You've used up your 10 minutes weekly. Time will reset on Monday at 6:00 AM.",
  
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
  premiumVoiceChatDescription: "Chat naturally with our premium AI tutor to practice {{practice}}! The AI will help you correct grammar, vocabulary, and pronunciation.",
  premiumVoiceNote: "Premium voice chat is limited to a 10-minute session per week",
  premiumVoiceNoteWithReset: "Premium voice chat allows 10 minutes of practice time per week. Your time is refreshed every Monday at 6:00 AM Central Time.",
  benefitNaturalVoice: "Natural, human-like voice interactions using ElevenLabs technology",
  benefitAccentPronunciation: "Accurate accent and pronunciation for immersive learning",
  benefitRegularPractice: "10 minutes of weekly practice time, refreshed every Monday at 6:00 AM Central Time",

  // Added voice chat controls
  startVoiceChat: "Start Voice Chat",
  stopVoiceChat: "Stop Voice Chat",
  voiceChatEnded: "Voice Chat Ended",
  timeLimit10MinReached: "10-minute time limit reached",
  speaking: "Speaking...",
  startChatting: "Start chatting",
  
  // Added missing key
  premiumSessionLimitReached: "Premium session limit reached",
  
  // New tier explanations
  tierSystemExplanation: "Our tier system provides different levels of access to premium voice features",
  tierFreeDetails: "Free tier includes text chat only, no premium voice access",
  tierBasicDetails: "Basic tier includes 10 minutes of premium voice chat per week",
  tierStandardDetails: "Standard tier includes 20 minutes of premium voice chat per week",
  tierPremiumDetails: "Premium tier includes 30 minutes of premium voice chat per week",
  tierUnlimitedDetails: "Unlimited tier includes 60 minutes of premium voice chat per week",
  nextResetTime: "Next reset time: {{time}}",
  timeRemainingThisWeek: "Time remaining this week: {{minutes}} minutes"
};

export default premiumVoiceTranslations;
