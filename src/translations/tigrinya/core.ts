
import { TranslationRecord } from "../types";

// Clean, focused Tigrinya translations for core UI elements only
const tigrinyaCoreTranslations: TranslationRecord = {
  // Navigation elements
  "home": "ቤት",
  "practice": "ልምምድ", 
  "textPractice": "ናይ ጽሑፍ ልምምድ",
  "unlimitedVoicePractice": "ዘይተውሰነ ናይ ድምጺ ልምምድ",
  "voiceChat": "ናይ ድምጺ ዝርርብ",
  "pronunciationPractice": "ናይ ንባብ ልምምድ",
  "logout": "ውጻእ",
  "login": "እቶ",
  "signIn": "እቶ",
  "createAccount": "ሒሳብ ፍጠር",
  
  // Home page elements
  "welcomeToLanguageLearning": "ናብ ቋንቋ ትምህርቲ እንቋዕ መጻእኩም",
  "yourPersonalAICompanion": "ናይ ቋንቋ ትምህርቲ ውልቀ AI መሓዙትኩም", 
  "swipeUpToGetStarted": "ንምጅማር ንላዕሊ ሳሕቡ",
  "getStarted": "ጀምሩ",
  "goToDashboard": "ናብ ዳሽቦርድ ኸዱ",
  
  // Text practice page
  "practiceYourLanguage": "{{language}} ኹም ተማሩ",
  "chatWithAI": "{{language}} ንምልማድ ምስ AI ና ተዛረቡ! AI ሰዋስውኩምን ቃላትኩምን ከእርም የሕግዘኩም እሞ ብዛዕባ {{language}} ንባብን ባህልን ምኽሪ ይህበኩም።",
  "startConversationIn": "ብ{{language}} ዝርርብ ጀምሩ",
  "practiceGuide": "ናይ {{language}} ልምምድ መምርሒ",
  "practiceGuideDescription": "ካብ {{language}} ልምምድኩም ዝበዝሐ ንምምላስ ገለ ምኽሪታት:",
  "practiceGuideItem1": "ቀሊል ኰይኑ እንተዀነ ምሉእ ሓረጋት ንምፍጣር ፈትኑ።",
  "practiceGuideItem2": "ብዛዕባ ጌጋታት ኣይትጨንቁ - ናይ ትምህርቲ ክፋል እዮም!",
  "practiceGuideItem3": "ዘይተረዲእኩም ነገር እንተሎ ምትሕት ሓቱ።",
  "practiceGuideItem4": "ብቐረባ ዝተማሃርኩም ቃላት ተጠቐሙ።",
  "practiceDisclaimer": "AI ና ምስ ደረጃ ክእለትኩም ይሰማምዕ እሞ ቀስ ብቀስ ከማሕይሸኩም ይሕግዝ።",
  "startTextChatting": "ናይ ጽሑፍ ዝርርብ ጀምሩ",
  "typeMessageToPractice": "{{language}} ንምልማድ መልእኽትኩም ጽሓፉ...",
  "send": "ለኣኹ",
  "clearConversation": "ዝርርብ ጸዳ",
  "correctGrammar": "ሰዋስው አርም",
  
  // Voice chat page
  "freePracticeWithVoice": "ብድምጺ ናጻ ልምምድ",
  "startSpeaking": "ዛረብ ጀምሩ",
  "listeningNow": "ሕጂ ይሰምዕ ኣሎ",
  "youSaid": "እንተበልኩም",
  "aiResponse": "ናይ AI መልሲ",
  "conversationStarters": "ናይ ዝርርብ ጀማሪ",
  "tryThesePhrases": "ዝርርብ ንምጅማር እዞም ሓረጋት ፈትኑ:",
  "practiceWithVoiceChat": "ብድምጺ ዝርርብ ተማሩ",
  "useThisTool": "ናይ ዛረባን ስምዓትን ክእለትኩም ንምምሕያሽ እዚ መሳርሒ ተጠቐሙ። ገለ ምኽሪታት:",
  "askQuestionsAboutTopics": "ብዛዕባ መዓልታዊ ዛዕባታት ሕተቱ",
  "practiceEverydayPhrases": "መዓልታዊ ሓረጋትን መግለጺታትን ተማሩ", 
  "describeWhatYouSee": "ኣብ ከባቢኹም ዝርእዩዎ ግለጹ",
  "practiceVocabularyForSpecific": "ከም ጉዕዞ ወይ መግቢ ዝኣመሰሉ ፍሉይ ዛዕባታት ቃላት ተማሩ",
  "responseSuggestions": "ናይ መልሲ ሓሳባት",
  "clickPlayToHear": "ንባብ ንምስማዕ ጸወት ጠውቑ",
  "startConversationToSee": "ሓሳባት ንምርኣይ ዝርርብ ጀምሩ",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "ብዝተዘመረ ልምምድ ናይ ንባብ ክእለትኩም ማሕይሹ",
  "selectComplexityLevel": "ደረጃ ምሕላፍ ምረጹ",
  "chooseDifficultyLevelBasedOn": "ብመሰረት ናይ ቋንቋ ብቃትኩም ደረጃ ጸገም ምረጹ", 
  "selectLevelToStart": "ልምምድ ንምጅማር ደረጃ ምረጹ",
  "pronunciationPracticeTips": "ናይ ንባብ ልምምድ ምኽሪታት",
  "listenCarefullyTip": "ክትዛረቡ ቅድሚ ምፍታንኩም ድምጺ ብጥንቃቐ ስሙዑ",
  "payAttentionToStressTip": "ናይ ጸቕጢ ኣዘራርባን ድምጺ ምስጋርን ተወከሱ",
  "practiceDifficultSoundsTip": "ኣጸጋሚ ድምጽታት ብዙሕ ጊዜ ተማሩ",
  "recordYourselfTip": "ንነብስኹም ቀዲድኩም ምስ ቋንቋ ወለዶም ኣነፃፅሩ",
  "bePatientTip": "ትዕግስቶ ሃልዩ - ናይ ንባብ ምምሕያሽ ግዜ ይወስድ",
  "novice": "ጀማሪ",
  "intermediate": "ማእከላይ", 
  "advanced": "ላዕለዋይ",
  "superior": "በላሒ",
  "startExercise": "ልምምድ ጀምሩ",
  "speechRate": "ናይ ዛረባ ቅልጣፈ",
  
  // Common UI elements
  "loading": "ይጸዓን ኣሎ...",
  "error": "ጌጋ",
  "cancel": "ስሕበት",
  "save": "ዓቅብ",
  "back": "ተመለስ",
  "continue": "ቀጽል",
  "processing": "ይሰርሕ ኣሎ..."
};

export default tigrinyaCoreTranslations;
