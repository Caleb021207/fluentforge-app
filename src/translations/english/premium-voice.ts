
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
  viewTierDetails: "View tier details",
  refresh: "Refresh data",
  total: "total",
  upgradeAccount: "Upgrade Account",
  
  // Fixed premium voice chat cooldown messages
  cooldownPeriodActive: "Weekly limit reached",
  cooldownActive: "Weekly limit reached",
  waitBeforeNextSession: "You need to wait before starting another session",
  cooldownPeriodDescription: "You need to wait {{time}} before starting another premium voice chat session.",
  resetsAt6AM: "Your weekly time will reset after {{time}} (Monday 6:00 AM)",
  dailyLimitReached: "You've used up your weekly time allowance. Time will reset on Monday at 6:00 AM.",
  
  // Login related messages
  loginRequired: "Login Required",
  pleaseLoginToAccessPremiumFeature: "Please login to access the premium voice chat feature",
  redirectingToLogin: "Redirecting to login page",
  failedToStartSession: "Failed to start session",
  failedToCreateSession: "Failed to create session",
  loginRequiredDescription: "To access the premium voice chat feature, please login to your account.",
  
  // Success messages
  conversationHistoryCleared: "Conversation history cleared",
  remaining: "remaining",
  
  // Premium voice benefits
  premiumVoiceChatDescription: "Chat naturally with our premium AI tutor to practice {{practice}}! The AI will help you correct grammar, vocabulary, and pronunciation.",
  premiumVoiceNote: "Premium voice chat time is limited based on your account tier",
  premiumVoiceNoteWithReset: "Premium voice chat allows practice time based on your account tier. Your time is refreshed every Monday at 6:00 AM UTC.",
  benefitNaturalVoice: "Natural, human-like voice interactions using ElevenLabs technology",
  benefitAccentPronunciation: "Accurate accent and pronunciation for immersive learning",
  benefitRegularPractice: "Weekly practice time (based on your tier), refreshed every Monday at 6:00 AM UTC",

  // Added voice chat controls
  startVoiceChat: "Start Voice Chat",
  stopVoiceChat: "Stop Voice Chat",
  voiceChatEnded: "Voice Chat Ended",
  timeLimit10MinReached: "Time limit reached",
  speaking: "Speaking...",
  startChatting: "Start chatting",
  sendMessage: "Send Message",
  typeYourMessageHere: "Type your message here",
  
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
