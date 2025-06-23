
import { TranslationRecord } from "../types";

// Clean, focused Bengali translations for core UI elements only
const bengaliCoreTranslations: TranslationRecord = {
  // Navigation elements
  "home": "হোম",
  "practice": "অনুশীলন", 
  "textPractice": "টেক্সট অনুশীলন",
  "unlimitedVoicePractice": "সীমাহীন ভয়েস অনুশীলন",
  "voiceChat": "ভয়েস চ্যাট",
  "pronunciationPractice": "উচ্চারণ অনুশীলন",
  "logout": "লগআউট",
  "login": "লগইন",
  "signIn": "সাইন ইন",
  "createAccount": "অ্যাকাউন্ট তৈরি করুন",
  
  // Home page elements
  "welcomeToLanguageLearning": "ভাষা শিক্ষায় স্বাগতম",
  "yourPersonalAICompanion": "ভাষা শেখার জন্য আপনার ব্যক্তিগত AI সহচর", 
  "swipeUpToGetStarted": "শুরু করতে উপরে সোয়াইপ করুন",
  "getStarted": "শুরু করুন",
  "goToDashboard": "ড্যাশবোর্ডে যান",
  
  // Text practice page
  "practiceYourLanguage": "আপনার {{language}} অনুশীলন করুন",
  "chatWithAI": "{{language}} অনুশীলনের জন্য আমাদের AI এর সাথে চ্যাট করুন! AI আপনার ব্যাকরণ, শব্দভাণ্ডার সংশোধন করতে এবং {{language}} উচ্চারণ ও সংস্কৃতি সম্পর্কে পরামর্শ দিতে সাহায্য করবে।",
  "startConversationIn": "{{language}} এ কথোপকথন শুরু করুন",
  "practiceGuide": "{{language}} অনুশীলন গাইড",
  "practiceGuideDescription": "আপনার {{language}} অনুশীলন থেকে সর্বোচ্চ ফল পেতে এখানে কিছু টিপস:",
  "practiceGuideItem1": "সম্পূর্ণ বাক্য গঠনের চেষ্টা করুন, এমনকি যদি সেগুলো সহজ হয়।",
  "practiceGuideItem2": "ভুল নিয়ে চিন্তা করবেন না - এগুলো শেখার অংশ!",
  "practiceGuideItem3": "কিছু বুঝতে না পারলে ব্যাখ্যা চান।",
  "practiceGuideItem4": "সম্প্রতি শেখা শব্দগুলো ব্যবহার করুন।",
  "practiceDisclaimer": "আমাদের AI আপনার দক্ষতার স্তরের সাথে খাপ খাইয়ে নেবে এবং ধীরে ধীরে উন্নতি করতে সাহায্য করবে।",
  "startTextChatting": "টেক্সট চ্যাটিং শুরু করুন",
  "typeMessageToPractice": "{{language}} অনুশীলনের জন্য আপনার বার্তা টাইপ করুন...",
  "send": "পাঠান",
  "clearConversation": "কথোপকথন মুছুন",
  "correctGrammar": "ব্যাকরণ সংশোধন",
  
  // Voice chat page
  "freePracticeWithVoice": "ভয়েসের সাথে বিনামূল্যে অনুশীলন",
  "startSpeaking": "কথা বলা শুরু করুন",
  "listeningNow": "এখন শুনছি",
  "youSaid": "আপনি বলেছেন",
  "aiResponse": "AI প্রতিক্রিয়া",
  "conversationStarters": "কথোপকথন শুরুকারী",
  "tryThesePhrases": "কথোপকথন শুরু করতে এই বাক্যগুলো চেষ্টা করুন:",
  "practiceWithVoiceChat": "ভয়েস চ্যাটের সাথে অনুশীলন",
  "useThisTool": "আপনার কথা বলা এবং শোনার দক্ষতা উন্নত করতে এই টুল ব্যবহার করুন। এখানে কিছু টিপস:",
  "askQuestionsAboutTopics": "দৈনন্দিন বিষয় নিয়ে প্রশ্ন করুন",
  "practiceEverydayPhrases": "সাধারণ বাক্য এবং অভিব্যক্তি অনুশীলন করুন", 
  "describeWhatYouSee": "আপনার চারপাশে যা দেখছেন তা বর্ণনা করুন",
  "practiceVocabularyForSpecific": "ভ্রমণ বা খাবারের মতো নির্দিষ্ট বিষয়ের জন্য শব্দভাণ্ডার অনুশীলন করুন",
  "responseSuggestions": "প্রতিক্রিয়া পরামর্শ",
  "clickPlayToHear": "উচ্চারণ শুনতে প্লে ক্লিক করুন",
  "startConversationToSee": "পরামর্শ দেখতে কথোপকথন শুরু করুন",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "লক্ষ্যবদ্ধ অনুশীলনের সাথে আপনার উচ্চারণ দক্ষতা উন্নত করুন",
  "selectComplexityLevel": "জটিলতার স্তর নির্বাচন করুন",
  "chooseDifficultyLevelBasedOn": "আপনার ভাষাগত দক্ষতার ভিত্তিতে অসুবিধার স্তর বেছে নিন", 
  "selectLevelToStart": "অনুশীলন শুরু করতে একটি স্তর নির্বাচন করুন",
  "pronunciationPracticeTips": "উচ্চারণ অনুশীলনের টিপস",
  "listenCarefullyTip": "কথা বলার চেষ্টা করার আগে সাবধানে অডিও শুনুন",
  "payAttentionToStressTip": "চাপ প্যাটার্ন এবং স্বরভঙ্গিতে মনোযোগ দিন",
  "practiceDifficultSoundsTip": "কঠিন শব্দগুলো কয়েকবার অনুশীলন করুন",
  "recordYourselfTip": "নিজেকে রেকর্ড করুন এবং স্থানীয় ভাষাভাষীদের সাথে তুলনা করুন",
  "bePatientTip": "ধৈর্য ধরুন - উচ্চারণ উন্নতি সময় নেয়",
  "novice": "নবিশ",
  "intermediate": "মধ্যম", 
  "advanced": "উন্নত",
  "superior": "উৎকৃষ্ট",
  "startExercise": "অনুশীলন শুরু করুন",
  "speechRate": "কথার গতি",
  
  // Common UI elements
  "loading": "লোড হচ্ছে...",
  "error": "ত্রুটি",
  "cancel": "বাতিল",
  "save": "সংরক্ষণ",
  "back": "পিছনে",
  "continue": "চালিয়ে যান",
  "processing": "প্রক্রিয়াকরণ..."
};

export default bengaliCoreTranslations;
