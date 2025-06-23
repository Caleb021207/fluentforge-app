
import { TranslationRecord } from "../types";

// Clean, focused Amharic translations for core UI elements only
const amharicCoreTranslations: TranslationRecord = {
  // Navigation elements
  "home": "ቤት",
  "practice": "ልምምድ", 
  "textPractice": "የጽሑፍ ልምምድ",
  "unlimitedVoicePractice": "ያልተወሰነ የድምጽ ልምምድ",
  "voiceChat": "የድምጽ ውይይት",
  "pronunciationPractice": "የአነባበብ ልምምድ",
  "logout": "ውጣ",
  "login": "ግባ",
  "signIn": "ግባ",
  "createAccount": "መለያ ፍጠር",
  
  // Home page elements
  "welcomeToLanguageLearning": "ወደ ቋንቋ ማጥናት እንኳን በደህና መጡ",
  "yourPersonalAICompanion": "ለቋንቋ ማጥናት የግል AI ባልደረባዎ", 
  "swipeUpToGetStarted": "ለመጀመር ወደ ላይ ይጣሉ",
  "getStarted": "ጀምር",
  "goToDashboard": "ወደ ዳሽቦርድ ሄድ",
  
  // Text practice page
  "practiceYourLanguage": "የ{{language}} ዎን ይለማመዱ",
  "chatWithAI": "{{language}} ን ለመለማመድ ከኤአይ ጋር ይወያዩ! ኤአይ ሰዋሰውዎን፣ የቃላት ዝርዝርዎን ለማስተካከል ይረዳል እና ስለ {{language}} አነባበብ እና ባህል ምክር ይሰጣል።",
  "startConversationIn": "በ{{language}} ውይይት ጀምር",
  "practiceGuide": "የ{{language}} ልምምድ መምሪያ",
  "practiceGuideDescription": "ከ{{language}} ልምምድዎ ብዙ ለማግኘት አንዳንድ ምክሮች እነሆ:",
  "practiceGuideItem1": "ቀላል ቢሆኑም ሙሉ ዓረፍተ ነገሮችን ለመመስረት ይሞክሩ።",
  "practiceGuideItem2": "ስለ ስህተቶች አይጨነቁ - ተመማሪነት አካል ናቸው!",
  "practiceGuideItem3": "ያልተረዱት ነገር ካለ ማብራሪያ ይጠይቁ።",
  "practiceGuideItem4": "በቅርቡ የተማሩትን ቃላት ይጠቀሙ።",
  "practiceDisclaimer": "ኤአይ ከክህሎት ደረጃዎ ጋር ይጣጣማል እና ቀስ በቀስ እንዲሻሻሉ ይረዳዎታል።",
  "startTextChatting": "የፅሑፍ ውይይት ጀምር",
  "typeMessageToPractice": "{{language}} ን ለመለማመድ መልእክትዎን ይፃፉ...",
  "send": "ላክ",
  "clearConversation": "ውይይት አጽዳ",
  "correctGrammar": "ሰዋሰው አስተካክል",
  
  // Voice chat page
  "freePracticeWithVoice": "በድምጽ ነፃ ልምምድ",
  "startSpeaking": "መናገር ጀምር",
  "listeningNow": "አሁን እያዳመጠ",
  "youSaid": "አንተ ያልከው",
  "aiResponse": "የኤአይ ምላሽ",
  "conversationStarters": "የውይይት ጀማሪዎች",
  "tryThesePhrases": "ውይይት ለመጀመር እነዚህን ሀረጎች ይሞክሩ:",
  "practiceWithVoiceChat": "በድምጽ ውይይት ልማድ",
  "useThisTool": "የመናገር እና የማዳመጥ ክህሎቶችዎን ለማሻሻል ይህንን መሳሪያ ይጠቀሙ። አንዳንድ ምክሮች:",
  "askQuestionsAboutTopics": "ስለ ዕለት ተዕለት ጉዳዮች ጥያቄዎችን ይጠይቁ",
  "practiceEverydayPhrases": "የዕለት ተዕለት ሀረጎችን እና መግለጫዎችን ይለማመዱ", 
  "describeWhatYouSee": "በዙሪያዎ የሚያዩትን ይግለጹ",
  "practiceVocabularyForSpecific": "እንደ ጉዞ ወይም ምግብ ላሉ ተወሳሺ ጉዳዮች የቃላት ዝርዝር ይለማመዱ",
  "responseSuggestions": "የምላሽ ጥቆማዎች",
  "clickPlayToHear": "አነባበብ ለመስማት ተጫውት ይንኩ",
  "startConversationToSee": "ጥቆማዎችን ለማየት ውይይት ጀምር",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "በተዘጋጁ ልምዶች የአነባበብ ክህሎቶችዎን ያሻሽሉ",
  "selectComplexityLevel": "የውስብስብነት ደረጃ ይምረጡ",
  "chooseDifficultyLevelBasedOn": "በቋንቋ ብቃትዎ ላይ በመመርኮዝ የችግር ደረጃ ይምረጡ", 
  "selectLevelToStart": "ልምምድ ለመጀመር ደረጃ ይምረጡ",
  "pronunciationPracticeTips": "የአነባበብ ልምምድ ምክሮች",
  "listenCarefullyTip": "ለመናገር ከመሞከርዎ በፊት ድምጹን በጥንቃቄ ይስሙ",
  "payAttentionToStressTip": "የውጥረት ንድፎችን እና ውጥንነትን ይጠቁሙ",
  "practiceDifficultSoundsTip": "አስቸጋሪ ድምጾችን ብዙ ጊዜ ይለማመዱ",
  "recordYourselfTip": "ራስዎን ይመዝግቡ እና ከተወላጅ ተናጋሪዎች ጋር ያወዳድሩ",
  "bePatientTip": "ትዕግስት ይኑርዎ - የአነባበብ መሻሻል ጊዜ ይወስዳል",
  "novice": "ጀማሪ",
  "intermediate": "መካከለኛ", 
  "advanced": "የከፍተኛ ደረጃ",
  "superior": "ላቀ",
  "startExercise": "ልምምድ ጀምር",
  "speechRate": "የንግግር ፍጥነት",
  
  // Common UI elements
  "loading": "እየጸጋ...",
  "error": "ስህተት",
  "cancel": "ሰርዝ",
  "save": "አስቀምጥ",
  "back": "ተመለስ",
  "continue": "ቀጥል",
  "processing": "እየሰራ..."
};

export default amharicCoreTranslations;
