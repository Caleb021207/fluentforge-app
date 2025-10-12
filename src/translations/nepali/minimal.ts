
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "भाषा सिकाइमा स्वागत छ",
  yourPersonalAICompanion: "तपाईंको व्यक्तिगत AI सहायक भाषा सिक्नका लागि",
  startPracticing: "अभ्यास सुरु गर्नुहोस्",
  practiceYourLanguageSkills: "आफ्नो भाषा कौशल अभ्यास गर्नुहोस्",
  swipeUpToGetStarted: "सुरु गर्न माथि स्वाइप गर्नुहोस्",
  getStarted: "सुरु गर्नुहोस्",
  selectYourLanguagePreferences: "आफ्नो भाषा प्राथमिकताहरू चयन गर्नुहोस्",

  // Language selection
  selectNativeLanguage: "आफ्नो मातृभाषा चयन गर्नुहोस्",
  iSpeak: "म बोल्छु",
  saveLanguagePreferences: "भाषा प्राथमिकताहरू सुरक्षित गर्नुहोस्",

  // Auth
  signIn: "साइन इन गर्नुहोस्",
  signUp: "साइन अप गर्नुहोस्",
  signInToContinue: "जारी राख्न साइन इन गर्नुहोस्",
  createAccountToGetStarted: "सुरु गर्न खाता सिर्जना गर्नुहोस्",
  email: "इमेल",
  password: "पासवर्ड",
  accessPasscode: "पहुँच कोड",
  dontHaveAccount: "खाता छैन?",
  alreadyHaveAccount: "पहिले नै खाता छ?",

  // Header
  loggedInAs: "यस रूपमा लग इन गरिएको",
  signedInAs: "यस रूपमा साइन इन गरिएको",
  logout: "लग आउट",
  lightMode: "उज्यालो मोड",

  // Navigation
  home: "घर",
  practice: "अभ्यास",
  textPractice: "पाठ अभ्यास",
  unlimitedVoicePracticeNav: "असीमित आवाज अभ्यास",
  pronunciationPracticeNav: "उच्चारण अभ्यास",
  aiAnalysis: "AI विश्लेषण",
  profile: "प्रोफाइल",
  settings: "सेटिङहरू",

  // Practice page
  englishPractice: "अंग्रेजी अभ्यास",
  startChatting: "च्याट सुरु गर्नुहोस्",
  startConversationIn: "{{language}} मा कुराकानी सुरु गर्नुहोस्",
  fixGrammar: "व्याकरण सुधार गर्नुहोस्",
  correctGrammar: "व्याकरण सही गर्नुहोस्",
  clearConversation: "कुराकानी खाली गर्नुहोस्",
  startTextChat: "पाठ च्याट सुरु गर्नुहोस्",
  startTextChatting: "पाठ च्यातिङ सुरु गर्नुहोस्",
  typeMessageBelow: "तल सन्देश टाइप गर्नुहोस्",
  typeMessageToPractice: "{{language}} मा अभ्यास गर्न सन्देश टाइप गर्नुहोस्...",
  send: "पठाउनुहोस्",

  // Practice Guide
  practiceGuide: "{{language}} अभ्यास गाइड",
  practiceGuideTitle: "{{language}} अभ्यास गाइड",
  practiceGuideDescription: "प्रभावकारी {{language}} अभ्यासका लागि उपयोगी सुझावहरू:",
  practiceGuideIntro: "प्रभावकारी {{language}} अभ्यासका लागि उपयोगी सुझावहरू:",
  practiceGuideTip1: "सरल भए पनि पूरा वाक्यहरू बनाउने प्रयास गर्नुहोस्।",
  practiceGuideTip2: "गल्तीहरूको चिन्ता नगर्नुहोस् — ती सिकाइको भाग हुन्!",
  practiceGuideTip3: "नबुझेको कुरा छ भने व्याख्या माग्नुहोस्।",
  practiceGuideTip4: "हालै सिकेका शब्दहरू प्रयोग गर्नुहोस्।",
  practiceGuideTip5: "हाम्रो AI तपाईंको सीप स्तरमा अनुकूल हुनेछ।",

  // Practice tips - using t() keys
  practiceTip1: "सरल भए पनि पूरा वाक्यहरू बनाउने प्रयास गर्नुहोस्।",
  practiceTip2: "गल्तीहरूको चिन्ता नगर्नुहोस् — ती सिकाइको भाग हुन्!",
  practiceTip3: "नबुझेको कुरा छ भने व्याख्या माग्नुहोस्।",
  practiceTip4: "हालै सिकेका शब्दहरू प्रयोग गर्नुहोस्।",
  practiceTip5: "हाम्रो AI तपाईंको सीप स्तरमा अनुकूल हुनेछ।",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "सरल भए पनि पूरा वाक्यहरू बनाउने प्रयास गर्नुहोस्।",
  "Don't worry about mistakes — they're part of learning!": "गल्तीहरूको चिन्ता नगर्नुहोस् — ती सिकाइको भाग हुन्!",
  "Ask for explanations if there's something you don't understand.": "नबुझेको कुरा छ भने व्याख्या माग्नुहोस्।",
  "Use words you've learned recently.": "हालै सिकेका शब्दहरू प्रयोग गर्नुहोस्।",
  "Our AI will adapt to your skill level and gradually help you improve.": "हाम्रो AI तपाईंको सीप स्तरमा अनुकूल हुनेछ र क्रमशः सुधार गर्न मद्दत गर्नेछ।",
  "Here are some tips to get the most out of your {{language}} practice:": "तपाईंको {{language}} अभ्यासबाट सबैभन्दा बढी फाइदा लिनका लागि यहाँ केही सुझावहरू छन्:",

  // Hint button
  suggestionResponses: "सुझाव गरिएका जवाफहरू",
  responseSuggestions: "जवाफ सुझावहरू",
  clickPlayToHearPronunciation: "उच्चारण सुन्न प्ले क्लिक गर्नुहोस्",
  startConversationForSuggestions: "सुझावहरू हेर्न कुराकानी सुरु गर्नुहोस्",
  startConversationToSeeSuggestions: "सुझावहरू हेर्न कुराकानी सुरु गर्नुहोस्",
  getResponseSuggestions: "जवाफ सुझावहरू प्राप्त गर्नुहोस्",
  greetings: "अभिवादनहरू",
  questions: "प्रश्नहरू",
  error: "त्रुटि",
  couldNotGenerateHints: "संकेतहरू उत्पन्न गर्न सकिएन",
  failedToPlayAudio: "अडियो बजाउन असफल",
  play: "बजाउनुहोस्",

  // Voice chat
  unlimitedVoicePractice: "असीमित आवाज अभ्यास",
  practiceDescription: "अभ्यास विवरण",
  aiModelInfo: "AI मोडेल जानकारी: प्राकृतिक भाषा बुझाइ र उत्पादनका लागि OpenAI GPT-4o-mini, आवाज जवाफका लागि ब्राउजर TTS।",
  practiceLevel: "अभ्यास स्तर",
  intermediatePracticeLevel: "मध्यम — परिचित विषयहरूमा छलफल गर्न सक्छ",
  "Intermediate - Can discuss familiar topics": "मध्यम — परिचित विषयहरूमा छलफल गर्न सक्छ",

  // CEFR Level Descriptions
  cefrB1Description: "मध्यम — परिचित विषयहरूमा छलफल गर्न सक्छ",
  cefrA1Description: "शुरुवाती — आधारभूत वाक्य र अभिव्यक्तिहरू",
  cefrA2Description: "प्राथमिक — सरल दैनिक कुराकानी",
  cefrB2Description: "उच्च मध्यम — सजिलैसँग सञ्चार गर्न सक्छ",

  currentLanguage: "हालको भाषा",
  practiceLanguage: "अभ्यास भाषा",
  startSpeaking: "बोल्न सुरु गर्नुहोस्",
  stopListening: "सुन्न बन्द गर्नुहोस्",
  listeningNow: "अहिले सुन्दै",
  youSaid: "तपाईंले भन्नुभयो",
  conversationStarters: "कुराकानी सुरुवातकर्ताहरू",
  howToStartConversation: "कुराकानी कसरी सुरु गर्ने",
  tryThesePhrases: "यी वाक्यांशहरू प्रयास गर्नुहोस्:",
  conversationStarter1: "नमस्ते! आज तपाईं कस्तो हुनुहुन्छ?",
  conversationStarter2: "तपाईं जहाँ हुनुहुन्छ त्यहाँ मौसम कस्तो छ?",
  conversationStarter3: "के तपाईं राम्रो रेस्टुरेन्ट सिफारिस गर्न सक्नुहुन्छ?",
  conversationStarter4: "तपाईंका शौक र रुचिहरू के के हुन्?",
  conversationStarter5: "तपाईंको मनपर्ने किताब वा चलचित्रको बारेमा बताउनुहोस्।",
  conversationStarter6: "गत सप्ताहन्तमा तपाईंले के गर्नुभयो?",
  conversationStarter7: "भोलिका लागि तपाईंका योजनाहरू के छन्?",
  conversationStarter8: "स्पेनिश/अंग्रेजीमा ... कसरी भन्छन्?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "नमस्ते, आज तपाईं कस्तो हुनुहुन्छ?",
  "What's the weather like where you are?": "तपाईं जहाँ हुनुहुन्छ त्यहाँ मौसम कस्तो छ?",
  "Can you recommend a good restaurant?": "के तपाईं राम्रो रेस्टुरेन्ट सिफारिस गर्न सक्नुहुन्छ?",
  "What are your hobbies and interests?": "तपाईंका शौक र रुचिहरू के के हुन्?",
  "Tell me about your favorite book or movie.": "तपाईंको मनपर्ने किताब वा चलचित्रको बारेमा बताउनुहोस्।",
  "What did you do last weekend?": "गत सप्ताहन्तमा तपाईंले के गर्नुभयो?",
  "What are your plans for tomorrow?": "भोलिका लागि तपाईंका योजनाहरू के छन्?",
  "How do you say... in Spanish/English?": "स्पेनिश/अंग्रेजीमा ... कसरी भन्छन्?",

  practiceWithVoiceChat: "आवाज च्यातसँग अभ्यास गर्नुहोस्",
  voiceChatTips: "तपाईंको बोल्ने र सुन्ने सीपहरू सुधार गर्न यो उपकरण प्रयोग गर्नुहोस्। यहाँ केही सुझावहरू छन्:",
  voiceTip1: "दैनिक विषयहरूका बारेमा प्रश्नहरू सोध्नुहोस्",
  voiceTip2: "सामान्य वाक्य र अभिव्यक्तिहरूको अभ्यास गर्नुहोस्",
  voiceTip3: "तपाईंको वरिपरि देख्नुभएका कुराहरूको वर्णन गर्नुहोस्",
  voiceTip4: "यात्रा वा खाना जस्ता विशेष विषयहरूका लागि शब्दावलीको अभ्यास गर्नुहोस्",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "तपाईंको बोल्ने र सुन्ने सीपहरू सुधार गर्न यो उपकरण प्रयोग गर्नुहोस्। यहाँ केही सुझावहरू छन्:",
  "Ask questions about everyday topics": "दैनिक विषयहरूका बारेमा प्रश्नहरू सोध्नुहोस्",
  "Practice common phrases and expressions": "सामान्य वाक्य र अभिव्यक्तिहरूको अभ्यास गर्नुहोस्",
  "Describe what you see around you": "तपाईंको वरिपरि देख्नुभएका कुराहरूको वर्णन गर्नुहोस्",
  "Practice vocabulary for specific topics like travel or food": "यात्रा वा खाना जस्ता विशेष विषयहरूका लागि शब्दावलीको अभ्यास गर्नुहोस्",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "ट्रान्सक्रिप्ट हेर्न बोल्न सुरु गर्नुहोस्",
  clickMicrophoneToStartRecording: "रेकर्डिङ सुरु गर्न माइक्रोफोन क्लिक गर्नुहोस्",

  // Premium Voice Chat
  premiumVoiceChat: "प्रिमियम आवाज च्याट",
  premiumVoiceChatBenefits: "प्रिमियम आवाज च्यातका फाइदाहरू",
  premiumVoiceChatDescription: "प्रिमियम AI ट्यूटरसँग प्राकृतिक आवाज कुराकानीमा {{practice}} अभ्यास गर्नुहोस्! AI ले तपाईंको व्याकरण, शब्दावली र उच्चारण सुधार गर्न मद्दत गर्नेछ।",
  premiumVoiceNote: "प्रिमियम आवाज च्याट हप्तामा १० मिनेटमा सीमित छ",
  premiumVoiceNoteWithReset: "प्रिमियम आवाज च्यातले हप्तामा १० मिनेट अभ्यास प्रदान गर्छ। समय हरेक सोमबार बिहान ६:०० बजे (केन्द्रीय समय) रिसेट हुन्छ।",
  benefitNaturalVoice: "ElevenLabs प्रविधिको साथ प्राकृतिक मानव-जस्तै आवाज अन्तरक्रिया",
  benefitAccentPronunciation: "गहिरो सिकाइका लागि सटीक उच्चारण र उच्चारण",
  benefitRegularPractice: "हप्तामा १० मिनेट अभ्यास, हरेक सोमबार बिहान ६:०० बजे रिसेट",

  // Pronunciation practice
  pronunciationPractice: "उच्चारण अभ्यास",
  improvePronunciationSkillsWith: "लक्षित अभ्यासहरूको साथ तपाईंको उच्चारण सीपहरू सुधार गर्नुहोस्",
  selectComplexityLevel: "जटिलता स्तर चयन गर्नुहोस्",
  chooseDifficultyLevelBasedOn: "तपाईंको भाषा प्रवाहताको आधारमा कठिनाई स्तर छनोट गर्नुहोस्",
  speechRate: "बोल्ने दर",
  selectLevelToStart: "अभ्यास सुरु गर्न स्तर चयन गर्नुहोस्",
  startExercise: "अभ्यास सुरु गर्नुहोस्",
  pronunciationPracticeTips: "उच्चारण अभ्यास सुझावहरू",
  listenCarefullyTip: "बोल्ने प्रयास गर्नु अघि ध्यानपूर्वक सुन्नुहोस्",
  payAttentionToStressTip: "तनाव र स्वरमा ध्यान दिनुहोस्",
  practiceDifficultSoundsTip: "कठिन आवाजहरू धेरै पटक अभ्यास गर्नुहोस्",
  recordYourselfTip: "आफैलाई रेकर्ड गर्नुहोस् र मूल वक्ताहरूसँग तुलना गर्नुहोस्",
  bePatientTip: "धैर्य राख्नुहोस् — उच्चारण सुधार गर्न समय लाग्छ",
  practiceExercise: "अभ्यास अभ्यास",
  topic: "विषय",
  listenToPhrase: "वाक्यांश सुन्नुहोस्",
  clickWordToHear: "सुन्न शब्द क्लिक गर्नुहोस्",
  yourPronunciation: "तपाईंको उच्चारण",
  startRecording: "रेकर्डिङ सुरु गर्नुहोस्",
  clickStartToRecord: "रेकर्ड गर्न 'सुरु' क्लिक गर्नुहोस्",
  tryAgain: "फेरि प्रयास गर्नुहोस्",
  newPhrase: "नयाँ वाक्यांश",
  generatingExercise: "अभ्यास उत्पन्न गर्दै",
  generatingNewPhrase: "नयाँ वाक्यांश उत्पन्न गर्दै",
  levelDescription: "स्तर विवरण",
  failedToGeneratePhrase: "वाक्यांश उत्पन्न गर्न असफल",
  noSpeechDetected: "कुनै बोली पत्ता लागेन",
  pleaseTryAgain: "कृपया फेरि प्रयास गर्नुहोस्",
  failedToAnalyzePronunciation: "उच्चारण विश्लेषण गर्न असफल",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "उच्चारण प्रतिक्रिया",
  accuracyScore: "शुद्धता स्कोर",
  intonationScore: "स्वर स्कोर",
  fluencyScore: "प्रवाहता स्कोर",
  complexityScore: "जटिलता स्कोर",
  wordAnalysis: "शब्द विश्लेषण",
  phonemeAnalysis: "ध्वनि विश्लेषण",
  overallFeedback: "समग्र प्रतिक्रिया",
  excellent: "उत्कृष्ट",
  good: "राम्रो",
  fair: "उचित",
  needsImprovement: "सुधार आवश्यक",

  // Additional UI elements
  processing: "प्रशोधन गर्दै",
  stopRecording: "रेकर्डिङ रोक्नुहोस्",
  listeningToYou: "तपाईंलाई सुन्दै",
  realTimeTranscription: "वास्तविक समय ट्रान्सक्रिप्शन",
  yourTranscription: "तपाईंको ट्रान्सक्रिप्शन",
  playing: "बजाउँदै",

  // Complexity levels
  novice: "नौसिखिया",
  intermediate: "मध्यम",
  advanced: "उन्नत",
  superior: "श्रेष्ठ",
  noviceLevelDescription: "सरल, परिचित विषयहरू ह्यान्डल गर्न सक्छ",
  intermediateLevelDescription: "परिचित विषयहरूमा छलफल गर्न सक्छ",
  advancedLevelDescription: "आत्मविश्वासका साथ जटिल विषयहरू ह्यान्डल गर्न सक्छ",
  superiorLevelDescription: "सबै भाषा कार्यहरू प्रदर्शन गर्न सक्छ",
  noviceLevelShortDescription: "सरल वाक्यहरू",
  intermediateLevelShortDescription: "परिचित विषयहरू",
  advancedLevelShortDescription: "जटिल विषयहरू",
  superiorLevelShortDescription: "सबै कार्यहरू",

  // Transcript Analysis - English placeholders as requested
  progressOverview: "Progress Overview",
  trackLanguageLearningJourney: "Track Language Learning Journey",
  aiProgressAnalysis: "AI Progress Analysis",
  uploadLanguageTestTranscripts: "Upload language test transcripts",
  totalAnalyses: "Total Analyses",
  currentLevel: "Current Level",
  latestScore: "Latest Score",
  uploadAndAnalyze: "Upload and Analyze",
  analysisResults: "Analysis Results",
  progressTimeline: "Progress Timeline",
  firstTest: "First Test",
  latestTest: "Latest Test",
  improvement: "Improvement"
};

export default minimalTranslations;
