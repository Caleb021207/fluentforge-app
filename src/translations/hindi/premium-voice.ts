
import { TranslationRecord } from "../types";

const premiumVoiceTranslations: TranslationRecord = {
  premiumVoiceTitle: "प्रीमियम वॉइस चैट",
  premiumVoiceChat: "प्रीमियम वॉइस चैट",
  premiumVoiceChatBenefits: "प्रीमियम वॉइस के लाभ",
  textConversationPractice: "टेक्स्ट वार्तालाप अभ्यास",
  cefrA1Description: "शुरुआती - बुनियादी वाक्यांश और अभिव्यक्तियां",
  cefrA2Description: "प्रारंभिक - सरल रोजमर्रा की बातचीत",
  cefrB1Description: "मध्यवर्ती - परिचित विषयों पर चर्चा कर सकते हैं",
  cefrB2Description: "उच्च मध्यवर्ती - प्रवाह के साथ बातचीत कर सकते हैं",
  beginner: "शुरुआती",
  elementary: "प्रारंभिक",
  intermediate: "मध्यवर्ती",
  upperIntermediate: "उच्च मध्यवर्ती",
  selectCEFRLevel: "CEFR स्तर चुनें",
  selectedLevel: "चयनित स्तर",
  
  // Fixed premium voice chat cooldown messages
  cooldownPeriodActive: "साप्ताहिक सीमा पहुँच गई",
  cooldownActive: "साप्ताहिक सीमा पहुँच गई",
  waitBeforeNextSession: "अगला सत्र शुरू करने से पहले आपको प्रतीक्षा करनी होगी",
  cooldownPeriodDescription: "आपको अगला प्रीमियम वॉइस चैट सत्र शुरू करने से पहले {{time}} प्रतीक्षा करनी होगी।",
  resetsAt6AM: "आपका 15-मिनट का साप्ताहिक कोटा {{time}} में रीसेट होगा (सोमवार सुबह 6:00 बजे)",
  dailyLimitReached: "आपने अपने 15-मिनट के साप्ताहिक कोटा का उपयोग कर लिया है। समय सोमवार सुबह 6:00 बजे रीसेट होगा।",
  
  // Login related messages
  loginRequired: "लॉगिन आवश्यक है",
  pleaseLoginToAccessPremiumFeature: "प्रीमियम वॉइस चैट सुविधा तक पहुँचने के लिए कृपया लॉगिन करें",
  redirectingToLogin: "लॉगिन पेज पर पुनर्निर्देशित किया जा रहा है",
  failedToStartSession: "सत्र शुरू करने में विफल",
  failedToCreateSession: "सत्र बनाने में विफल",
  loginRequiredDescription: "प्रीमियम वॉइस चैट सुविधा का उपयोग करने के लिए, कृपया अपने खाते में लॉगिन करें।",
  
  // Success messages
  conversationHistoryCleared: "वार्तालाप इतिहास साफ़ किया गया",
  remaining: "इस सप्ताह शेष",
  
  // Premium voice benefits
  premiumVoiceChatDesc: "हमारे प्रीमियम AI ट्यूटर के साथ {{practice}} का अभ्यास करने के लिए प्राकृतिक आवाज वार्तालाप करें! AI आपके व्याकरण, शब्दावली और उच्चारण को सुधारने में मदद करेगा।",
  premiumVoiceChatDescription: "हमारे प्रीमियम AI ट्यूटर के साथ {{practice}} का अभ्यास करने के लिए प्राकृतिक आवाज वार्तालाप करें! AI आपके व्याकरण, शब्दावली और उच्चारण को सुधारने में मदद करेगा।",
  premiumVoiceNote: "प्रीमियम वॉइस चैट का उपयोग प्रति सप्ताह एक 15-मिनट के सत्र तक सीमित है",
  premiumVoiceNoteWithReset: "प्रीमियम वॉइस चैट प्रति सप्ताह 15 मिनट के अभ्यास समय की अनुमति देता है। आपका समय हर सोमवार सुबह 6:00 बजे सेंट्रल टाइम पर रीसेट होता है।",
  benefitNaturalVoice: "ElevenLabs तकनीक का उपयोग करके प्राकृतिक, मानव जैसी आवाज़ बातचीत",
  benefitAccentPronunciation: "इमर्सिव लर्निंग के लिए सटीक उच्चारण और एक्सेंट",
  benefitRegularPractice: "प्रति सप्ताह 15 मिनट का अभ्यास समय, जो हर सोमवार सुबह 6:00 बजे सेंट्रल टाइम पर रीसेट होता है",
  
  // Additional voice chat controls
  startVoiceChat: "वॉइस चैट शुरू करें",
  stopVoiceChat: "वॉइस चैट बंद करें",
  timeRemaining: "समय शेष: {{time}}",
  premiumSessionLimitMessage: "आपने अपनी साप्ताहिक 15 मिनट की प्रीमियम वॉइस चैट सीमा तक पहुंच गए हैं। नई सीमा सोमवार को सुबह 6 बजे सेंट्रल टाइम (अमेरिका) पर रीसेट होगी।",
  timeLimit5MinReached: "5 मिनट की समय सीमा पूरी हो गई है।",
  signIn: "साइन इन करें",
  voiceChatEnded: "वॉइस चैट समाप्त हुआ",
  premiumSessionLimitReached: "साप्ताहिक सीमा पहुंच गई"
};

export default premiumVoiceTranslations;
