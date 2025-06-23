
import { TranslationRecord } from "../types";

// Clean, focused Burmese translations for core UI elements only
const burmeseCoreTranslations: TranslationRecord = {
  // Navigation elements
  "home": "အိမ်",
  "practice": "လေ့ကျင့်ခန်း", 
  "textPractice": "စာသား လေ့ကျင့်ခန်း",
  "unlimitedVoicePractice": "အကန့်အသတ်မရှိ အသံ လေ့ကျင့်ခန်း",
  "voiceChat": "အသံ စကားပြော",
  "pronunciationPractice": "အသံထွက် လေ့ကျင့်ခန်း",
  "logout": "ထွက်ရန်",
  "login": "ဝင်ရန်",
  "signIn": "ဝင်ရောက်ရန်",
  "createAccount": "အကောင့်ဖွင့်ရန်",
  
  // Home page elements
  "welcomeToLanguageLearning": "ဘာသာစကား သင်ယူခြင်းသို့ ကြိုဆိုပါတယ်",
  "yourPersonalAICompanion": "ဘာသာစကား သင်ယူရန်အတွက် သင့်ရဲ့ ကိုယ်ပိုင် AI မိတ်ဆွေ", 
  "swipeUpToGetStarted": "စတင်ရန် အပေါ်သို့ ပွတ်ဆွဲပါ",
  "getStarted": "စတင်ရန်",
  "goToDashboard": "ဒက်ရှ်ဘုတ်သို့ သွားရန်",
  
  // Text practice page
  "practiceYourLanguage": "သင့်ရဲ့ {{language}} ကို လေ့ကျင့်ပါ",
  "chatWithAI": "{{language}} လေ့ကျင့်ရန် ကျွန်ုပ်တို့ရဲ့ AI နှင့် စကားပြောပါ! AI က သင့်ရဲ့ သဒ္ဒါ၊ စာလုံးအီအိုင်များကို ပြင်ဆင်ပေးပြီး {{language}} အသံထွက်နှင့် ယဉ်ကျေးမှုအကြောင်း အကြံပြုချက်များ ပေးပါလိမ့်မည်။",
  "startConversationIn": "{{language}} ဖြင့် စကားပြောခြင်း စတင်ပါ",
  "practiceGuide": "{{language}} လေ့ကျင့်ခန်း လမ်းညွှန်",
  "practiceGuideDescription": "သင့်ရဲ့ {{language}} လေ့ကျင့်ခန်းမှ အများဆုံး အကျိုးရရှိရန် ဤနည်းလမ်းများ ရှိပါတယ်:",
  "practiceGuideItem1": "ရိုးရှင်းတယ်ဆိုပေမယ့် စာကြောင်းပြည့်စုံများ ဖွဲ့နွဲ့ကြိုးစားပါ။",
  "practiceGuideItem2": "အမှားများအတွက် စိုးရိမ်မနေပါနဲ့ - သူတို့က သင်ယူခြင်းရဲ့ အစိတ်အပိုင်းဖြစ်ပါတယ်!",
  "practiceGuideItem3": "နားမလည်တဲ့ အရာရှိရင် ရှင်းလင်းချက် တောင်းပါ။",
  "practiceGuideItem4": "မကြာသေးမီက သင်ယူခဲ့တဲ့ စာလုံးများကို အသုံးပြုပါ။",
  "practiceDisclaimer": "ကျွန်ုပ်တို့ရဲ့ AI က သင့်ရဲ့ ကျွမ်းကျင်မှု အဆင့်နှင့် လိုက်ဖက်ပြီး တဖြည်းဖြည်း တိုးတက်အောင် ကူညီပါလိမ့်မည်။",
  "startTextChatting": "စာသား စကားပြောခြင်း စတင်ပါ",
  "typeMessageToPractice": "{{language}} လေ့ကျင့်ရန် သင့်ရဲ့ စာကို ရိုက်ထည့်ပါ...",
  "send": "ပို့ပါ",
  "clearConversation": "စကားပြောခြင်း ရှင်းလင်းပါ",
  "correctGrammar": "သဒ္ဒါ ပြင်ဆင်ပါ",
  
  // Voice chat page
  "freePracticeWithVoice": "အသံဖြင့် အခမဲ့ လေ့ကျင့်ခန်း",
  "startSpeaking": "စကားပြော စတင်ပါ",
  "listeningNow": "အခုအချိန် နားထောင်နေ",
  "youSaid": "သင် ပြောသည်",
  "aiResponse": "AI တုံ့ပြန်ချက်",
  "conversationStarters": "စကားပြောခြင်း စတင်သူများ",
  "tryThesePhrases": "စကားပြောခြင်း စတင်ရန် ဤစကားလုံးများကို စမ်းကြည့်ပါ:",
  "practiceWithVoiceChat": "အသံ စကားပြောခြင်းဖြင့် လေ့ကျင့်ပါ",
  "useThisTool": "သင့်ရဲ့ စကားပြောခြင်းနှင့် နားထောင်ခြင်း ကျွမ်းကျင်မှုများ တိုးတက်စေရန် ဤကိရိယာကို အသုံးပြုပါ။ အကြံပြုချက်များမှာ:",
  "askQuestionsAboutTopics": "နေ့စဉ် အကြောင်းအရာများ အကြောင်း မေးခွန်းများ မေးပါ",
  "practiceEverydayPhrases": "နေ့စဉ် စကားလုံးများနှင့် အသုံးအနှုန်းများ လေ့ကျင့်ပါ", 
  "describeWhatYouSee": "သင့်ပတ်ဝန်းကျင်မှာ မြင်တွေ့ရတာများကို ဖော်ပြပါ",
  "practiceVocabularyForSpecific": "ခရီးသွားခြင်း သို့မဟုတ် အစားအစာ ကဲ့သို့သော သီးခြား အကြောင်းအရာများအတွက် စာလုံးများ လေ့ကျင့်ပါ",
  "responseSuggestions": "တုံ့ပြန်ချက် အကြံပြုချက်များ",
  "clickPlayToHear": "အသံထွက် ကြားရန် ဖွင့်ခလုတ် နှိပ်ပါ",
  "startConversationToSee": "အကြံပြုချက်များ မြင်ရန် စကားပြောခြင်း စတင်ပါ",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "ပစ်မှတ်ထားတဲ့ လေ့ကျင့်ခန်းများဖြင့် သင့်ရဲ့ အသံထွက် ကျွမ်းကျင်မှုများ တိုးတက်စေပါ",
  "selectComplexityLevel": "ရှုပ်ထွေးမှု အဆင့် ရွေးချယ်ပါ",
  "chooseDifficultyLevelBasedOn": "သင့်ရဲ့ ဘာသာစကား ကျွမ်းကျင်မှု အပေါ် အခြေခံပြီး ခက်ခဲမှု အဆင့် ရွေးချယ်ပါ", 
  "selectLevelToStart": "လေ့ကျင့်ခန်း စတင်ရန် အဆင့် ရွေးချယ်ပါ",
  "pronunciationPracticeTips": "အသံထွက် လေ့ကျင့်ခန်း နည်းလမ်းများ",
  "listenCarefullyTip": "စကားပြော ကြိုးစားမယ့် အစား အသံကို ဂရုတစိုက် နားထောင်ပါ",
  "payAttentionToStressTip": "ဖိအား ပုံစံများနှင့် လေယူလေသိမ်း ကို ဂရုစိုက်ပါ",
  "practiceDifficultSoundsTip": "ခက်ခဲတဲ့ အသံများကို အကြိမ်ကြိမ် လေ့ကျင့်ပါ",
  "recordYourselfTip": "သင့်ကိုယ်သင် မှတ်တမ်းတင်ပြီး မူလ စကားပြောသူများနှင့် နှိုင်းယှဉ်ပါ",
  "bePatientTip": "စိတ်ရှည်ပါ - အသံထွက် တိုးတက်မှုက အချိန် ယူပါတယ်",
  "novice": "အစပြုသူ",
  "intermediate": "အလယ်အလတ်", 
  "advanced": "အဆင့်မြင့်",
  "superior": "အကောင်းဆုံး",
  "startExercise": "လေ့ကျင့်ခန်း စတင်ပါ",
  "speechRate": "စကားပြောမှု နှုန်း",
  
  // Common UI elements
  "loading": "ရနေသည်...",
  "error": "အမှား",
  "cancel": "ပယ်ဖျက်ပါ",
  "save": "သိမ်းဆည်းပါ",
  "back": "ပြန်ရန်",
  "continue": "ဆက်လက်",
  "processing": "လုပ်ငန်းစဉ်လုပ်နေ..."
};

export default burmeseCoreTranslations;
