
import { TranslationRecord } from "../types";

// Clean, focused Pashto translations for core UI elements only
const pashtoCoreTranslations: TranslationRecord = {
  // Navigation elements
  "home": "کور",
  "practice": "تمرین", 
  "textPractice": "د متن تمرین",
  "unlimitedVoicePractice": "د غږ بې حده تمرین",
  "voiceChat": "د غږ چټ",
  "pronunciationPractice": "د تلفظ تمرین",
  "logout": "وتل",
  "login": "ننوتل",
  "signIn": "ننوتل",
  "createAccount": "حساب جوړول",
  
  // Home page elements
  "welcomeToLanguageLearning": "د ژبې زده کړې ته ښه راغلاست",
  "yourPersonalAICompanion": "ستاسو د ژبې زده کړې لپاره شخصي AI ملګری", 
  "swipeUpToGetStarted": "د پیل لپاره پورته وګرځئ",
  "getStarted": "پیل وکړئ",
  "goToDashboard": "ډشبورډ ته لاړ شئ",
  
  // Text practice page
  "practiceYourLanguage": "خپل {{language}} تمرین وکړئ",
  "chatWithAI": "زموږ د AI سره د {{language}} تمرین لپاره چټ وکړئ! AI به ستاسو د ګرامر، لغاتو سمولو کې مرسته وکړي او د {{language}} تلفظ او کلتور په اړه مشورې ورکړي.",
  "startConversationIn": "په {{language}} کې خبرې پیل کړئ",
  "practiceGuide": "د {{language}} تمرین لارښود",
  "practiceGuideDescription": "دلته د خپل {{language}} تمرین څخه د اعظمي ګټې اخیستلو لپاره ځینې لارښوونې دي:",
  "practiceGuideItem1": "هڅه وکړئ بشپړې جملې جوړې کړئ، که څه هم ساده وي.",
  "practiceGuideItem2": "د تېروتنو په اړه اندېښنه مه کوئ - دا د زده کړې برخه دي!",
  "practiceGuideItem3": "که کومه پوښتنه نه پوهېږئ توضیحات وغواړئ.",
  "practiceGuideItem4": "هغه کلمې وکاروئ چې پدې وروستیو کې یې زده کړي.",
  "practiceDisclaimer": "زموږ AI به ستاسو د مهارتونو کچې سره سمون ولري او په تدریجي ډول به د ښېوالي کې مرسته وکړي.",
  "startTextChatting": "د متن چټ پیل کړئ",
  "typeMessageToPractice": "د {{language}} تمرین لپاره خپل پیغام ولیکئ...",
  "send": "واستوئ",
  "clearConversation": "خبرې پاکې کړئ",
  "correctGrammar": "ګرامر سم کړئ",
  
  // Voice chat page
  "freePracticeWithVoice": "د غږ سره وړیا تمرین",
  "startSpeaking": "خبرې پیل کړئ",
  "listeningNow": "اوس اورېدل کېږي",
  "youSaid": "تاسو وویل",
  "aiResponse": "د AI ځواب",
  "conversationStarters": "د خبرو پیلوونکي",
  "tryThesePhrases": "د خبرو د پیل لپاره دا جملې وآزمویئ:",
  "practiceWithVoiceChat": "د غږ چټ سره تمرین وکړئ",
  "useThisTool": "دا وسیله د خپلو د خبرو کولو او اورېدلو مهارتونو ښېوالي لپاره وکاروئ. دلته ځینې لارښوونې:",
  "askQuestionsAboutTopics": "د ورځنیو موضوعاتو په اړه پوښتنې وکړئ",
  "practiceEverydayPhrases": "عام جملې او بیانونه تمرین وکړئ", 
  "describeWhatYouSee": "هغه څه تشریح کړئ چې ستاسو شاوخوا یې ګورئ",
  "practiceVocabularyForSpecific": "د ځانګړو موضوعاتو لکه سفر یا خواړو لپاره لغات تمرین وکړئ",
  "responseSuggestions": "د ځواب وړاندیزونه",
  "clickPlayToHear": "د تلفظ اورېدلو لپاره play ته کلیک وکړئ",
  "startConversationToSee": "د وړاندیزونو لیدلو لپاره خبرې پیل کړئ",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "د هدفمندو تمریناتو سره د خپل تلفظ مهارتونه ښه کړئ",
  "selectComplexityLevel": "د پیچلتیا کچه غوره کړئ",
  "chooseDifficultyLevelBasedOn": "د خپل ژبني وړتیا پراساس د ستونزې کچه غوره کړئ", 
  "selectLevelToStart": "د تمرین پیل لپاره یوه کچه غوره کړئ",
  "pronunciationPracticeTips": "د تلفظ تمرین لارښوونې",
  "listenCarefullyTip": "د خبرو کولو هڅه کولو دمخه په دقت سره غږ واورئ",
  "payAttentionToStressTip": "د فشار نمونو او غږ ته پاملرنه وکړئ",
  "practiceDifficultSoundsTip": "ستونزمن غږونه څو ځله تمرین وکړئ",
  "recordYourselfTip": "خپل ځان ثبت کړئ او د اصلي ویونکو سره یې پرتله کړئ",
  "bePatientTip": "صبر وکړئ - د تلفظ ښېوالي وخت غواړي",
  "novice": "نوی",
  "intermediate": "منځنی", 
  "advanced": "پرمختللی",
  "superior": "غوره",
  "startExercise": "تمرین پیل کړئ",
  "speechRate": "د خبرو سرعت",
  
  // Common UI elements
  "loading": "بارېدل کېږي...",
  "error": "تېروتنه",
  "cancel": "لغوه کول",
  "save": "ساتل",
  "back": "بیرته",
  "continue": "دوام ورکول",
  "processing": "پروسېسنګ..."
};

export default pashtoCoreTranslations;
