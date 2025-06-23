
import { TranslationRecord } from "../types";

// Clean, focused Hindi translations for core UI elements only
const hindiCoreTranslations: TranslationRecord = {
  // Navigation elements
  "home": "होम",
  "practice": "अभ्यास", 
  "textPractice": "टेक्स्ट अभ्यास",
  "unlimitedVoicePractice": "असीमित वॉयस अभ्यास",
  "voiceChat": "वॉयस चैट",
  "pronunciationPractice": "उच्चारण अभ्यास",
  "logout": "लॉगआउट",
  "login": "लॉगिन",
  "signIn": "साइन इन",
  "createAccount": "खाता बनाएं",
  
  // Home page elements
  "welcomeToLanguageLearning": "भाषा सीखने में आपका स्वागत है",
  "yourPersonalAICompanion": "भाषा सीखने के लिए आपका व्यक्तिगत AI साथी", 
  "swipeUpToGetStarted": "शुरू करने के लिए ऊपर स्वाइप करें",
  "getStarted": "शुरू करें",
  "goToDashboard": "डैशबोर्ड पर जाएं",
  
  // Text practice page
  "practiceYourLanguage": "अपनी {{language}} का अभ्यास करें",
  "chatWithAI": "{{language}} का अभ्यास करने के लिए हमारे AI के साथ चैट करें! AI आपके व्याकरण, शब्दावली को सुधारने में मदद करेगा और {{language}} उच्चारण और संस्कृति के बारे में सलाह देगा।",
  "startConversationIn": "{{language}} में बातचीत शुरू करें",
  "practiceGuide": "{{language}} अभ्यास गाइड",
  "practiceGuideDescription": "{{language}} अभ्यास का अधिकतम लाभ उठाने के लिए यहां कुछ सुझाव हैं:",
  "practiceGuideItem1": "पूरे वाक्य बनाने की कोशिश करें, भले ही वे सरल हों।",
  "practiceGuideItem2": "गलतियों की चिंता न करें - वे सीखने का हिस्सा हैं!",
  "practiceGuideItem3": "यदि आप कुछ नहीं समझते हैं तो स्पष्टीकरण मांगें।",
  "practiceGuideItem4": "हाल ही में सीखे गए शब्दों का उपयोग करें।",
  "practiceDisclaimer": "हमारा AI आपके कौशल स्तर के अनुकूल होगा और धीरे-धीरे सुधार में मदद करेगा।",
  "startTextChatting": "टेक्स्ट चैटिंग शुरू करें",
  "typeMessageToPractice": "{{language}} का अभ्यास करने के लिए अपना संदेश टाइप करें...",
  "send": "भेजें",
  "clearConversation": "बातचीत साफ़ करें",
  "correctGrammar": "व्याकरण सुधारें",
  
  // Voice chat page
  "freePracticeWithVoice": "आवाज के साथ मुफ्त अभ्यास",
  "startSpeaking": "बोलना शुरू करें",
  "listeningNow": "अब सुन रहा है",
  "youSaid": "आपने कहा",
  "aiResponse": "AI प्रतिक्रिया",
  "conversationStarters": "बातचीत शुरू करने वाले",
  "tryThesePhrases": "बातचीत शुरू करने के लिए इन वाक्यों को आज़माएं:",
  "practiceWithVoiceChat": "वॉयस चैट के साथ अभ्यास करें",
  "useThisTool": "अपने बोलने और सुनने के कौशल में सुधार के लिए इस उपकरण का उपयोग करें। यहां कुछ सुझाव हैं:",
  "askQuestionsAboutTopics": "रोजमर्रा के विषयों के बारे में प्रश्न पूछें",
  "practiceEverydayPhrases": "सामान्य वाक्यों और अभिव्यक्तियों का अभ्यास करें", 
  "describeWhatYouSee": "अपने आसपास जो कुछ देखते हैं उसका वर्णन करें",
  "practiceVocabularyForSpecific": "यात्रा या भोजन जैसे विशिष्ट विषयों के लिए शब्दावली का अभ्यास करें",
  "responseSuggestions": "प्रतिक्रिया सुझाव",
  "clickPlayToHear": "उच्चारण सुनने के लिए प्ले पर क्लिक करें",
  "startConversationToSee": "सुझाव देखने के लिए बातचीत शुरू करें",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "लक्षित अभ्यास के साथ अपने उच्चारण कौशल में सुधार करें",
  "selectComplexityLevel": "जटिलता स्तर चुनें",
  "chooseDifficultyLevelBasedOn": "अपनी भाषा प्रवीणता के आधार पर कठिनाई स्तर चुनें", 
  "selectLevelToStart": "अभ्यास शुरू करने के लिए एक स्तर चुनें",
  "pronunciationPracticeTips": "उच्चारण अभ्यास सुझाव",
  "listenCarefullyTip": "बोलने की कोशिश करने से पहले ऑडियो को ध्यान से सुनें",
  "payAttentionToStressTip": "तनाव पैटर्न और स्वर पर ध्यान दें",
  "practiceDifficultSoundsTip": "कठिन ध्वनियों का कई बार अभ्यास करें",
  "recordYourselfTip": "खुद को रिकॉर्ड करें और मूल भाषी लोगों से तुलना करें",
  "bePatientTip": "धैर्य रखें - उच्चारण सुधार में समय लगता है",
  "novice": "नौसिखिया",
  "intermediate": "मध्यम", 
  "advanced": "उन्नत",
  "superior": "श्रेष्ठ",
  "startExercise": "अभ्यास शुरू करें",
  "speechRate": "बोलने की गति",
  
  // Common UI elements
  "loading": "लोड हो रहा है...",
  "error": "त्रुटि",
  "cancel": "रद्द करें",
  "save": "सेव करें",
  "back": "वापस",
  "continue": "जारी रखें",
  "processing": "प्रसंस्करण..."
};

export default hindiCoreTranslations;
