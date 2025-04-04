
import { TranslationRecord } from "../types";

const premiumVoiceTranslations: TranslationRecord = {
  premiumVoiceChat: "چت صوتی پیشرفته",
  premiumVoiceChatBenefits: "مزایای چت صوتی پیشرفته",
  textConversationPractice: "تمرین مکالمه متنی",
  cefrA1Description: "مبتدی - عبارات و بیان پایه",
  cefrA2Description: "پایه - ارتباط روزمره ساده",
  cefrB1Description: "متوسط - می‌تواند در مورد موضوعات آشنا بحث کند",
  cefrB2Description: "متوسط بالا - می‌تواند با روانی ارتباط برقرار کند",
  beginner: "مبتدی",
  elementary: "پایه",
  intermediate: "متوسط",
  upperIntermediate: "متوسط بالا",
  selectCEFRLevel: "انتخاب سطح CEFR",
  selectedLevel: "سطح انتخاب شده",
  
  // Fixed premium voice chat cooldown messages
  cooldownPeriodActive: "دوره انتظار فعال است",
  cooldownActive: "در حال انتظار",
  waitBeforeNextSession: "شما باید قبل از شروع جلسه دیگر صبر کنید",
  cooldownPeriodDescription: "شما باید {{time}} قبل از شروع جلسه چت صوتی پیشرفته دیگر صبر کنید.",
  
  // Login related messages
  loginRequired: "ورود لازم است",
  pleaseLoginToAccessPremiumFeature: "لطفاً برای دسترسی به ویژگی چت صوتی پیشرفته وارد شوید",
  redirectingToLogin: "در حال هدایت به صفحه ورود",
  failedToStartSession: "شروع جلسه ناموفق بود",
  failedToCreateSession: "ایجاد جلسه ناموفق بود",
  loginRequiredDescription: "برای دسترسی به ویژگی چت صوتی پیشرفته، لطفاً وارد حساب کاربری خود شوید.",
  
  // Success messages
  conversationHistoryCleared: "تاریخچه مکالمه پاک شد",
  
  // Premium voice benefits
  premiumVoiceChatDescription: "مکالمه طبیعی با مربی هوش مصنوعی پیشرفته ما برای تمرین {{practice}}! هوش مصنوعی به شما در اصلاح دستور زبان، لغات و تلفظ کمک خواهد کرد.",
  premiumVoiceNote: "استفاده از چت صوتی پیشرفته محدود به یک جلسه 5 دقیقه‌ای در هر 24 ساعت است",
  benefitNaturalVoice: "تعامل صوتی طبیعی، شبیه انسان با استفاده از فناوری ElevenLabs",
  benefitAccentPronunciation: "لهجه و تلفظ دقیق برای یادگیری غوطه‌ور",
  benefitRegularPractice: "جلسات 5 دقیقه‌ای با زمان انتظار 24 ساعته برای تشویق تمرین منظم و متمرکز",

  // Added voice chat controls
  startVoiceChat: "شروع چت صوتی",
  stopVoiceChat: "توقف چت صوتی",
  voiceChatEnded: "چت صوتی پایان یافت",
  timeLimit5MinReached: "محدودیت زمانی 5 دقیقه به پایان رسید",
  speaking: "در حال صحبت...",
  startChatting: "شروع به چت کردن"
};

export default premiumVoiceTranslations;
