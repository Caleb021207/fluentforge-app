
import { TranslationRecord } from "../types";

// Clean, focused Nepali translations for core UI elements only
const nepaliCoreTranslations: TranslationRecord = {
  // Navigation elements
  "home": "घर",
  "practice": "अभ्यास", 
  "textPractice": "पाठ अभ्यास",
  "unlimitedVoicePractice": "असीमित आवाज अभ्यास",
  "voiceChat": "आवाज च्याट",
  "pronunciationPractice": "उच्चारण अभ्यास",
  "logout": "लग आउट",
  "login": "लग इन",
  "signIn": "साइन इन",
  "createAccount": "खाता सिर्जना गर्नुहोस्",
  
  // Home page elements
  "welcomeToLanguageLearning": "भाषा सिक्ने कार्यक्रममा स्वागत छ",
  "yourPersonalAICompanion": "भाषा सिक्नको लागि तपाईंको व्यक्तिगत AI साथी", 
  "swipeUpToGetStarted": "सुरु गर्न माथि स्वाइप गर्नुहोस्",
  "getStarted": "सुरु गर्नुहोस्",
  "goToDashboard": "ड्यासबोर्डमा जानुहोस्",
  
  // Text practice page
  "practiceYourLanguage": "तपाईंको {{language}} अभ्यास गर्नुहोस्",
  "chatWithAI": "{{language}} अभ्यास गर्न हाम्रो AI सँग कुरा गर्नुहोस्! AI ले तपाईंको व्याकरण, शब्दावली सुधार गर्न मद्दत गर्नेछ र {{language}} उच्चारण र संस्कृति बारे सल्लाह दिनेछ।",
  "startConversationIn": "{{language}} मा कुराकानी सुरु गर्नुहोस्",
  "practiceGuide": "{{language}} अभ्यास गाइड",
  "practiceGuideDescription": "तपाईंको {{language}} अभ्यासबाट अधिकतम फाइदा लिनको लागि यहाँ केही सुझावहरू छन्:",
  "practiceGuideItem1": "पूर्ण वाक्यहरू बनाउने प्रयास गर्नुहोस्, भले तिनीहरू सरल भएता पनि।",
  "practiceGuideItem2": "गल्तीहरूको चिन्ता नगर्नुहोस् - तिनीहरू सिक्ने भागका हुन्!",
  "practiceGuideItem3": "यदि तपाईंले नबुझेको केही छ भने स्पष्टीकरण सोध्नुहोस्।",
  "practiceGuideItem4": "हालै सिकेका शब्दहरू प्रयोग गर्नुहोस्।",
  "practiceDisclaimer": "हाम्रो AI तपाईंको सीप स्तरसँग मिल्नेछ र बिस्तारै सुधार गर्न मद्दत गर्नेछ।",
  "startTextChatting": "पाठ च्याटिङ सुरु गर्नुहोस्",
  "typeMessageToPractice": "{{language}} अभ्यास गर्न तपाईंको सन्देश टाइप गर्नुहोस्...",
  "send": "पठाउनुहोस्",
  "clearConversation": "कुराकानी सफा गर्नुहोस्",
  "correctGrammar": "व्याकरण सुधार गर्नुहोस्",
  
  // Voice chat page
  "freePracticeWithVoice": "आवाजसँग निःशुल्क अभ्यास",
  "startSpeaking": "बोल्न सुरु गर्नुहोस्",
  "listeningNow": "अहिले सुनिरहेको छ",
  "youSaid": "तपाईंले भन्नुभयो",
  "aiResponse": "AI प्रतिक्रिया",
  "conversationStarters": "कुराकानी सुरुकर्ताहरू",
  "tryThesePhrases": "कुराकानी सुरु गर्न यी वाक्यांशहरू प्रयास गर्नुहोस्:",
  "practiceWithVoiceChat": "आवाज च्याटसँग अभ्यास गर्नुहोस्",
  "useThisTool": "तपाईंको बोल्ने र सुन्ने सीपहरू सुधार गर्न यो उपकरण प्रयोग गर्नुहोस्। यहाँ केही सुझावहरू छन्:",
  "askQuestionsAboutTopics": "दैनिक विषयहरू बारे प्रश्नहरू सोध्नुहोस्",
  "practiceEverydayPhrases": "दैनिक वाक्यांशहरू र अभिव्यक्तिहरू अभ्यास गर्नुहोस्", 
  "describeWhatYouSee": "तपाईंको वरिपरि देख्नुभएको कुराहरू वर्णन गर्नुहोस्",
  "practiceVocabularyForSpecific": "यात्रा वा खाना जस्ता विशेष विषयहरूका लागि शब्दावली अभ्यास गर्नुहोस्",
  "responseSuggestions": "प्रतिक्रिया सुझावहरू",
  "clickPlayToHear": "उच्चारण सुन्न प्ले क्लिक गर्नुहोस्",
  "startConversationToSee": "सुझावहरू हेर्न कुराकानी सुरु गर्नुहोस्",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "लक्षित अभ्यासहरूसँग तपाईंको उच्चारण सीपहरू सुधार गर्नुहोस्",
  "selectComplexityLevel": "जटिलता स्तर चयन गर्नुहोस्",
  "chooseDifficultyLevelBasedOn": "तपाईंको भाषा दक्षताको आधारमा कठिनाई स्तर छान्नुहोस्", 
  "selectLevelToStart": "अभ्यास सुरु गर्न स्तर चयन गर्नुहोस्",
  "pronunciationPracticeTips": "उच्चारण अभ्यास सुझावहरू",
  "listenCarefullyTip": "बोल्ने प्रयास गर्नु अघि अडियो ध्यानपूर्वक सुन्नुहोस्",
  "payAttentionToStressTip": "तनाव ढाँचा र स्वरमा ध्यान दिनुहोस्",
  "practiceDifficultSoundsTip": "कठिन आवाजहरू धेरै पटक अभ्यास गर्नुहोस्",
  "recordYourselfTip": "आफैलाई रेकर्ड गर्नुहोस् र मूल वक्ताहरूसँग तुलना गर्नुहोस्",
  "bePatientTip": "धैर्य राख्नुहोस् - उच्चारण सुधारमा समय लाग्छ",
  "novice": "शुरुवाती",
  "intermediate": "मध्यम", 
  "advanced": "उन्नत",
  "superior": "उत्कृष्ट",
  "startExercise": "अभ्यास सुरु गर्नुहोस्",
  "speechRate": "बोलीको गति",
  
  // Common UI elements
  "loading": "लोड हुँदैछ...",
  "error": "त्रुटि",
  "cancel": "रद्द गर्नुहोस्",
  "save": "बचत गर्नुहोस्",
  "back": "फिर्ता",
  "continue": "जारी राख्नुहोस्",
  "processing": "प्रक्रिया गरिँदै..."
};

export default nepaliCoreTranslations;
