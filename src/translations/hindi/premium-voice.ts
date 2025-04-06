
import { TranslationRecord } from "../types";

const premiumVoiceTranslations: TranslationRecord = {
  premiumVoiceTitle: "प्रीमियम वॉइस चैट",
  premiumVoiceChat: "प्रीमियम वॉइस चैट",
  premiumVoiceChatBenefits: "प्रीमियम वॉइस के लाभ",
  textConversationPractice: "टेक्स्ट कन्वर्सेशन प्रैक्टिस",
  cefrA1Description: "शुरुआती - बुनियादी वाक्यांश और अभिव्यक्तियाँ",
  cefrA2Description: "प्रारंभिक - सरल रोजमर्रा की बातचीत",
  cefrB1Description: "मध्यवर्ती - परिचित विषयों पर चर्चा कर सकते हैं",
  cefrB2Description: "उच्च मध्यवर्ती - प्रवाह के साथ बातचीत कर सकते हैं",
  beginner: "शुरुआती",
  elementary: "प्रारंभिक",
  intermediate: "मध्यवर्ती",
  upperIntermediate: "उच्च मध्यवर्ती",
  selectCEFRLevel: "CEFR स्तर चुनें",
  selectedLevel: "चयनित स्तर",
  
  // कूलडाउन संदेश
  cooldownPeriodActive: "साप्ताहिक सीमा पहुंच गई",
  cooldownActive: "साप्ताहिक सीमा सक्रिय",
  waitBeforeNextSession: "दूसरा सत्र शुरू करने से पहले आपको प्रतीक्षा करनी होगी",
  cooldownPeriodDescription: "दूसरा प्रीमियम वॉइस चैट सत्र शुरू करने से पहले आपको {{time}} प्रतीक्षा करनी होगी।",
  resetsAt6AM: "आपके 10 मिनट के साप्ताहिक समय का रीसेट {{time}} में होगा (सोमवार सुबह 6:00 बजे)",
  dailyLimitReached: "आपने अपने 10 मिनट के साप्ताहिक समय का उपयोग कर लिया है। समय सोमवार सुबह 6:00 बजे रीसेट होगा।",
  
  // लॉगिन संबंधित संदेश
  loginRequired: "लॉगिन आवश्यक है",
  pleaseLoginToAccessPremiumFeature: "प्रीमियम वॉइस चैट सुविधा का उपयोग करने के लिए कृपया लॉगिन करें",
  redirectingToLogin: "लॉगिन पेज पर रीडायरेक्ट कर रहे हैं",
  failedToStartSession: "सत्र शुरू करने में विफल",
  failedToCreateSession: "सत्र बनाने में विफल",
  loginRequiredDescription: "प्रीमियम वॉइस चैट सुविधा का उपयोग करने के लिए, कृपया अपने खाते में लॉगिन करें।",
  
  // सफलता संदेश
  conversationHistoryCleared: "बातचीत का इतिहास साफ़ किया गया",
  remaining: "इस सप्ताह शेष",
  
  // प्रीमियम वॉइस लाभ
  premiumVoiceChatDescription: "{{practice}} का अभ्यास करने के लिए हमारे प्रीमियम AI ट्यूटर के साथ प्राकृतिक वॉइस वार्तालाप करें! AI आपके व्याकरण, शब्दावली और उच्चारण को सुधारने में मदद करेगा।",
  premiumVoiceNote: "प्रीमियम वॉइस चैट का उपयोग हर सप्ताह एक 10-मिनट के सत्र तक सीमित है",
  premiumVoiceNoteWithReset: "प्रीमियम वॉइस चैट साप्ताहिक 10 मिनट के अभ्यास समय की अनुमति देता है। आपका समय हर सोमवार सुबह 6:00 बजे केंद्रीय समय पर रीसेट होता है।",
  benefitNaturalVoice: "ElevenLabs तकनीक का उपयोग करके प्राकृतिक, मानव जैसी वॉइस इंटरैक्शन",
  benefitAccentPronunciation: "इमर्सिव लर्निंग के लिए सटीक उच्चारण और लहजा",
  benefitRegularPractice: "साप्ताहिक 10 मिनट का अभ्यास समय, हर सोमवार सुबह 6:00 बजे केंद्रीय समय पर रीसेट होता है",
  startVoiceChat: "वॉइस चैट शुरू करें",
  stopVoiceChat: "वॉइस चैट बंद करें",
  voiceChatEnded: "वॉइस चैट समाप्त हुई",
  timeLimit5MinReached: "10 मिनट की समय सीमा पूरी हो गई है"
};

export default premiumVoiceTranslations;
