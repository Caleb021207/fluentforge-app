
import {  } from "../types";
import arabicCoreTranslations from "./core";
import arabicPracticeTranslations from "./practice";

// Create voice chat translations for Arabic
const arabicVoiceChatTranslations: TranslationRecord = {
  // Voice chat page
  "freePracticeWithVoice": "ممارسة مجانية بالصوت",
  "startSpeaking": "ابدأ بالتحدث",
  "listeningNow": "أستمع الآن",
  "youSaid": "قلت",
  "aiResponse": "استجابة الذكاء الاصطناعي",
  "conversationStarters": "بدايات المحادثة",
  "tryThesePhrases": "جرب هذه العبارات لبدء محادثة:",
  "practiceWithVoiceChat": "تدرب مع المحادثة الصوتية",
  "useThisTool": "استخدم هذه الأداة لتحسين مهارات التحدث والاستماع. إليك بعض النصائح:",
  "askQuestionsAboutTopics": "اسأل أسئلة حول مواضيع يومية",
  "practiceEverydayPhrases": "تدرب على العبارات والتعبيرات الشائعة",
  "describeWhatYouSee": "صف ما تراه حولك",
  "practiceVocabularyForSpecific": "تدرب على مفردات مواضيع محددة مثل السفر أو الطعام",
  "responseSuggestions": "اقتراحات الرد",
  "clickPlayToHear": "اضغط على التشغيل لسماع النطق",
  "startConversationToSee": "ابدأ محادثة لرؤية الاقتراحات",
  
  // Conversation phrases
  "phrase1": "مرحباً، كيف حالك اليوم؟",
  "phrase2": "كيف الطقس حيث أنت؟",
  "phrase3": "هل يمكنك أن توصي بمطعم جيد؟",
  "phrase4": "ما هي هواياتك واهتماماتك؟",
  "phrase5": "أخبرني عن كتابك أو فيلمك المفضل.",
  "phrase6": "ماذا فعلت في عطلة نهاية الأسبوع الماضية؟",
  "phrase7": "ما هي خططك لغداً؟",
  "phrase8": "كيف نقول... بالإنجليزية؟",
  
  // Additional voice chat functionality
  "askQuestions": "اسأل أسئلة حول مواضيع يومية",
  "practiceCommonPhrases": "تدرب على العبارات والتعبيرات الشائعة",
  "browserBasedTTS": "ملاحظة: هذا يستخدم تحويل النص إلى كلام المستند إلى المتصفح. للحصول على جودة صوتية مميزة مع ElevenLabs، جرب محادثتنا الصوتية المميزة.",
  "voiceChatEnded": "انتهت المحادثة الصوتية",
  "remaining": "متبقي",
  "failedToGetResponse": "فشل في الحصول على استجابة",
  "speechRecognitionError": "خطأ في التعرف على الكلام",
  "speechRecognitionNotSupported": "متصفحك لا يدعم التعرف على الكلام",
  "microphoneAccessRequired": "مطلوب الوصول للميكروفون",
  "failedToGenerateSpeech": "فشل في توليد الكلام",
  "stopListening": "توقف عن الاستماع"
};

// Complete Arabic translations with voice chat and practice integration
const arabicTranslations: TranslationRecord = {
  ...arabicCoreTranslations,
  ...arabicVoiceChatTranslations,
  ...arabicPracticeTranslations
};

export default arabicTranslations;
