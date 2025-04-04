
import { TranslationRecord } from "../types";

const commonTranslations: TranslationRecord = {
  // Navigation and common UI elements
  home: "خانه",
  practice: "تمرین",
  voiceChat: "چت صوتی",
  premiumVoiceChat: "چت صوتی پیشرفته",
  settings: "تنظیمات",
  login: "ورود",
  signup: "ثبت نام",
  logout: "خروج",
  profile: "پروفایل",
  
  // Error messages
  error: "خطا",
  somethingWentWrong: "مشکلی پیش آمد",
  tryAgainLater: "لطفا بعدا دوباره امتحان کنید",
  networkConnectionIssue: "مشکل اتصال به شبکه",
  
  // Success messages
  success: "موفق",
  
  // Audio related
  microphoneAccessRequired: "دسترسی به میکروفون نیاز است",
  allowMicAccess: "لطفا به مرورگر اجازه دسترسی به میکروفون را بدهید",
  
  // Chat related
  message: "پیام",
  send: "ارسال",
  startSpeaking: "شروع به صحبت کردن",
  stopListening: "توقف گوش دادن",
  listeningNow: "در حال گوش دادن",
  youSaid: "شما گفتید",
  aiResponse: "پاسخ هوش مصنوعی",
  playAgain: "پخش مجدد",
  speaking: "در حال صحبت...",
  translation: "ترجمه",
  clearConversation: "پاک کردن مکالمه",
  conversationHistory: "تاریخچه مکالمه",
  conversationStarters: "آغازگرهای مکالمه",
  tryThesePhrases: "این عبارات را امتحان کنید",
  inYourTargetLanguage: "به زبان مقصد شما",
  inYourNativeLanguage: "به زبان مادری شما",
  
  // Voice chat related
  unlimitedVoicePractice: "تمرین صوتی نامحدود",
  startVoiceChat: "شروع چت صوتی",
  stopVoiceChat: "توقف چت صوتی",
  voiceChatEnded: "چت صوتی پایان یافت",
  timeLimit5MinReached: "محدودیت زمانی 5 دقیقه به پایان رسید",
  
  // Browser support messages
  speechRecognitionNotSupported: "تشخیص گفتار در این مرورگر پشتیبانی نمی‌شود",
  speechSynthesisNotSupported: "سنتز گفتار در این مرورگر پشتیبانی نمی‌شود",
  speechRecognitionError: "خطای تشخیص گفتار",
  speechSynthesisError: "خطای سنتز گفتار",
  browserBasedTTS: "توجه: این از تبدیل متن به گفتار مبتنی بر مرورگر استفاده می‌کند. برای کیفیت صدای بهتر، از چت صوتی پیشرفته استفاده کنید.",
  failedToGetResponse: "دریافت پاسخ ناموفق بود",
  
  // Practice related
  practiceLevel: "سطح تمرین",
  cefrB1Description: "متوسط - می‌تواند در مورد موضوعات آشنا بحث کند",
  practiceLanguageTips: "از این ابزار برای بهبود مهارت‌های گفتاری و شنیداری خود استفاده کنید. در اینجا چند نکته است:",
  askQuestionsAboutTopics: "در مورد موضوعاتی که به آنها علاقه دارید سؤال بپرسید",
  practiceEverydayPhrases: "عبارات روزمره را تمرین کنید",
  describeImagesOrScenes: "تصاویر یا صحنه‌ها را توصیف کنید",
  practiceVocabularyForSpecificTopics: "لغات مربوط به موضوعات خاص را تمرین کنید",
  
  // Special support for Persian
  persianVoiceAssistant: "دستیار صوتی فارسی",
  persianVoiceDescription: "این صفحه از تشخیص گفتار OpenAI Whisper و TTS-1 برای پشتیبانی از زبان فارسی استفاده می‌کند.",
  notSupportedByEleven: "فارسی توسط ElevenLabs پشتیبانی نمی‌شود، اما ما راه‌حل جایگزینی ایجاد کرده‌ایم.",
};

export default commonTranslations;
