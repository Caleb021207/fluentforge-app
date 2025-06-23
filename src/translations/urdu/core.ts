
import { TranslationRecord } from "../types";

// Clean, focused Urdu translations for core UI elements only
const urduCoreTranslations: TranslationRecord = {
  // Navigation elements
  "home": "گھر",
  "practice": "مشق", 
  "textPractice": "متنی مشق",
  "unlimitedVoicePractice": "لامحدود آواز کی مشق",
  "voiceChat": "آواز کی بات چیت",
  "pronunciationPractice": "تلفظ کی مشق",
  "logout": "لاگ آؤٹ",
  "login": "لاگ ان",
  "signIn": "سائن ان",
  "createAccount": "اکاؤنٹ بنائیں",
  
  // Home page elements
  "welcomeToLanguageLearning": "زبان سیکھنے میں خوش آمدید",
  "yourPersonalAICompanion": "زبان سیکھنے کے لیے آپ کا ذاتی AI ساتھی", 
  "swipeUpToGetStarted": "شروع کرنے کے لیے اوپر سوائپ کریں",
  "getStarted": "شروع کریں",
  "goToDashboard": "ڈیش بورڈ پر جائیں",
  
  // Text practice page
  "practiceYourLanguage": "اپنی {{language}} کی مشق کریں",
  "chatWithAI": "{{language}} کی مشق کے لیے ہمارے AI سے بات چیت کریں! AI آپ کی گرامر، الفاظ کو ٹھیک کرنے میں مدد کرے گا اور {{language}} کے تلفظ اور ثقافت کے بارے میں مشورے دے گا۔",
  "startConversationIn": "{{language}} میں بات چیت شروع کریں",
  "practiceGuide": "{{language}} مشق کی رہنمائی",
  "practiceGuideDescription": "یہاں کچھ تجاویز ہیں جو آپ کی {{language}} مشق سے زیادہ سے زیادہ فائدہ اٹھانے میں مدد کریں گی:",
  "practiceGuideItem1": "مکمل جملے بنانے کی کوشش کریں، چاہے وہ آسان ہوں۔",
  "practiceGuideItem2": "غلطیوں کی فکر نہ کریں - یہ سیکھنے کا حصہ ہیں!",
  "practiceGuideItem3": "اگر کوئی چیز سمجھ میں نہ آئے تو وضاحت مانگیں۔",
  "practiceGuideItem4": "حال ہی میں سیکھے گئے الفاظ استعمال کریں۔",
  "practiceDisclaimer": "ہمارا AI آپ کی مہارت کی سطح کے مطابق ڈھل جائے گا اور آہستہ آہستہ بہتری میں آپ کی مدد کرے گا۔",
  "startTextChatting": "ٹیکسٹ چیٹنگ شروع کریں",
  "typeMessageToPractice": "{{language}} کی مشق کے لیے اپنا پیغام ٹائپ کریں...",
  "send": "بھیجیں",
  "clearConversation": "بات چیت صاف کریں",
  "correctGrammar": "گرامر درست کریں",
  
  // Voice chat page
  "freePracticeWithVoice": "آواز کے ساتھ مفت مشق",
  "startSpeaking": "بولنا شروع کریں",
  "listeningNow": "اب سن رہا ہوں",
  "youSaid": "آپ نے کہا",
  "aiResponse": "AI کا جواب",
  "conversationStarters": "بات چیت کے آغاز کنندگان",
  "tryThesePhrases": "بات چیت شروع کرنے کے لیے یہ فقرے آزمائیں:",
  "practiceWithVoiceChat": "آواز چیٹ کے ساتھ مشق کریں",
  "useThisTool": "اپنی بولنے اور سننے کی مہارت بہتر بنانے کے لیے یہ ٹول استعمال کریں۔ یہاں کچھ تجاویز ہیں:",
  "askQuestionsAboutTopics": "روزمرہ کے موضوعات کے بارے میں سوالات پوچھیں",
  "practiceEverydayPhrases": "روزمرہ کے فقروں اور تاثرات کی مشق کریں", 
  "describeWhatYouSee": "اپنے ارد گرد جو کچھ دیکھتے ہیں اس کی وضاحت کریں",
  "practiceVocabularyForSpecific": "مخصوص موضوعات جیسے سفر یا کھانے کے لیے الفاظ کی مشق کریں",
  "responseSuggestions": "جواب کی تجاویز",
  "clickPlayToHear": "تلفظ سننے کے لیے پلے پر کلک کریں",
  "startConversationToSee": "تجاویز دیکھنے کے لیے بات چیت شروع کریں",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "ہدف شدہ مشقوں کے ساتھ اپنی تلفظ کی مہارت بہتر بنائیں",
  "selectComplexityLevel": "پیچیدگی کی سطح منتخب کریں",
  "chooseDifficultyLevelBasedOn": "اپنی زبان کی صلاحیت کی بنیاد پر مشکل کی سطح منتخب کریں", 
  "selectLevelToStart": "مشق شروع کرنے کے لیے سطح منتخب کریں",
  "pronunciationPracticeTips": "تلفظ مشق کی تجاویز",
  "listenCarefullyTip": "بولنے کی کوشش کرنے سے پہلے آڈیو کو غور سے سنیں",
  "payAttentionToStressTip": "زور کے انداز اور لہجے پر توجہ دیں",
  "practiceDifficultSoundsTip": "مشکل آوازوں کو کئی بار مشق کریں",
  "recordYourselfTip": "اپنے آپ کو ریکارڈ کریں اور مقامی بولنے والوں سے موازنہ کریں",
  "bePatientTip": "صبر رکھیں - تلفظ کی بہتری میں وقت لگتا ہے",
  "novice": "ابتدائی",
  "intermediate": "درمیانی", 
  "advanced": "اعلیٰ",
  "superior": "اعلیٰ ترین",
  "startExercise": "مشق شروع کریں",
  "speechRate": "تقریر کی رفتار",
  
  // Common UI elements
  "loading": "لوڈ ہو رہا ہے...",
  "error": "خرابی",
  "cancel": "منسوخ",
  "save": "محفوظ کریں",
  "back": "واپس",
  "continue": "جاری رکھیں",
  "processing": "عمل میں ہے..."
};

export default urduCoreTranslations;
