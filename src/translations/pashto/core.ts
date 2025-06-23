
import { TranslationRecord } from "../types";

// Clean, focused Pashto translations for core UI elements only
const pashtoCoreTranslations: TranslationRecord = {
  // Navigation elements
  "home": "کور",
  "practice": "تمرین", 
  "textPractice": "د متن تمرین",
  "unlimitedVoicePractice": "نامحدود غږ تمرین",
  "voiceChat": "غږیز چیټ",
  "pronunciationPractice": "د تلفظ تمرین",
  "logout": "وتل",
  "login": "ننوتل",
  "signIn": "ننوتل",
  "createAccount": "حساب جوړول",
  
  // Home page elements
  "welcomeToLanguageLearning": "د ژبې زده کړې ته ښه راغلاست",
  "yourPersonalAICompanion": "ستاسو د ژبې زده کړې لپاره شخصي AI ملګری", 
  "swipeUpToGetStarted": "د پیل لپاره پورته سکریپ وکړئ",
  "getStarted": "پیل وکړئ",
  "goToDashboard": "ډیش بورډ ته لاړ شئ",
  
  // Text practice page
  "practiceYourLanguage": "خپل {{language}} تمرین وکړئ",
  "chatWithAI": "زموږ د AI سره د {{language}} تمرین لپاره چیټ وکړئ! AI به ستاسو د ګرامر، لغاتو سمولو کې مرسته وکړي او د {{language}} تلفظ او کلتور په اړه مشورې ورکړي.",
  "startConversationIn": "په {{language}} کې د خبرو اترو پیل وکړئ",
  "practiceGuide": "د {{language}} تمرین لارښود",
  "practiceGuideDescription": "دلته ځینې لارښودونه دي چې ستاسو د {{language}} تمرین څخه ډیر ګټه واخلئ:",
  "practiceGuideItem1": "د بشپړو جملو جوړولو هڅه وکړئ، حتی که ساده وي.",
  "practiceGuideItem2": "د تېروتنو په اړه اندېښنه مه کوئ - دا د زده کړې برخه دي!",
  "practiceGuideItem3": "که چېرې ستاسو څه نه پوهېږئ تشریح وغواړئ.",
  "practiceGuideItem4": "هغه کلمې وکاروئ چې دمخه یې زده کړي دي.",
  "practiceDisclaimer": "زموږ AI به ستاسو د مهارتونو کچې سره سم وي او ورو ورو به ستاسو د ښه کولو کې مرسته وکړي.",
  "startTextChatting": "د متن چیټ پیل وکړئ",
  "typeMessageToPractice": "د {{language}} تمرین لپاره خپل پیغام واورئ...",
  "send": "واستوئ",
  "clearConversation": "خبرې اترې پاکې کړئ",
  "correctGrammar": "ګرامر سم کړئ",
  
  // Voice chat page
  "freePracticeWithVoice": "د غږ سره وړیا تمرین",
  "startSpeaking": "د خبرو پیل وکړئ",
  "listeningNow": "اوس اورېدل کیږي",
  "youSaid": "تاسو وویل",
  "aiResponse": "د AI ځواب",
  "conversationStarters": "د خبرو اترو پیل کوونکي",
  "tryThesePhrases": "د خبرو اترو د پیل لپاره دا جملې وازموئ:",
  "practiceWithVoiceChat": "د غږیز چیټ سره تمرین وکړئ",
  "useThisTool": "دا وسیله د خپلو د خبرو او اورېدو مهارتونو د ښه کولو لپاره وکاروئ. دلته ځینې لارښودونه دي:",
  "askQuestionsAboutTopics": "د ورځنیو موضوعاتو په اړه پوښتنې وکړئ",
  "practiceEverydayPhrases": "عام جملې او څرګندونې تمرین وکړئ", 
  "describeWhatYouSee": "هغه څه تشریح کړئ چې ستاسو شاوخوا یې ګورئ",
  "practiceVocabularyForSpecific": "د ځانګړو موضوعاتو لکه سفر یا خواړو لپاره لغاتو تمرین وکړئ",
  "responseSuggestions": "د ځوابونو وړاندیزونه",
  "clickPlayToHear": "د تلفظ د اورېدو لپاره پلې کلیک وکړئ",
  "startConversationToSee": "د وړاندیزونو د لیدو لپاره خبرې اترې پیل وکړئ",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "د هدفي تمریناتو سره د خپل تلفظ مهارتونه ښه کړئ",
  "selectComplexityLevel": "د پیچلتیا کچه وټاکئ",
  "chooseDifficultyLevelBasedOn": "د خپل ژبني وړتیا پر بنسټ د ستونزې کچه وټاکئ", 
  "selectLevelToStart": "د تمرین د پیل لپاره کچه وټاکئ",
  "pronunciationPracticeTips": "د تلفظ تمرین لارښودونه",
  "listenCarefullyTip": "د خبرو د کولو مخکې په دقت سره غږ واورئ",
  "payAttentionToStressTip": "د فشار نمونو او آهنګ ته پاملرنه وکړئ",
  "practiceDifficultSoundsTip": "سخت غږونه څو ځله تمرین وکړئ",
  "recordYourselfTip": "ځان ثبت کړئ او د اصلي ویونکو سره یې پرتله کړئ",
  "bePatientTip": "صبر وکړئ - د تلفظ ښه کول وخت نیسي",
  "novice": "نوی",
  "intermediate": "منځنی", 
  "advanced": "پرمختللی",
  "superior": "غوره",
  "startExercise": "تمرین پیل کړئ",
  "speechRate": "د خبرو کچه",
  
  // Common UI elements
  "loading": "پورته کیږي...",
  "error": "تېروتنه",
  "cancel": "لغوه کړئ",
  "save": "ساتل",
  "back": "بیرته",
  "continue": "دوام ورکړئ",
  "processing": "پروسس کیږي..."
};

export default pashtoCoreTranslations;
