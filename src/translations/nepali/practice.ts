
import { TranslationRecord } from "../types";

const practiceTranslations: TranslationRecord = {
  // Core practice functionality
  practice: "अभ्यास",
  practiceYourLanguage: "तपाईंको भाषाको अभ्यास गर्नुहोस्",
  chatWithAI: "AI सँग कुराकानी गर्नुहोस्",
  startConversation: "कुराकानी सुरु गर्नुहोस्",
  startChatting: "च्याट सुरु गर्नुहोस्",
  startConversationIn: "{{language}} मा कुराकानी सुरु गर्नुहोस्",
  typeMessageIn: "{{language}} मा सन्देश टाइप गर्नुहोस्",
  
  // Practice guide
  practiceGuide: "अभ्यास गाइड",
  practiceGuideDescription: "भाषा सिक्ने यात्रालाई सरल बनाउन यी सुझावहरू पालना गर्नुहोस्:",
  practiceGuideItem1: "• दैनिक कम्तिमा १५ मिनेट अभ्यास गर्नुहोस्",
  practiceGuideItem2: "• विभिन्न विषयहरूमा कुराकानी गर्नुहोस्",
  practiceGuideItem3: "• तपाईंका गल्तीहरूबाट सिक्नुहोस्",
  practiceGuideItem4: "• धैर्य राख्नुहोस् र निरन्तर अभ्यास गर्नुहोस्",
  practiceDisclaimer: "नोट: AI ले सधैं सही जानकारी प्रदान गर्दैन। महत्वपूर्ण जानकारीका लागि अन्य स्रोतहरू जाँच गर्नुहोस्।",
  
  // Chat interface
  chatPlaceholder: "तपाईंको सन्देश यहाँ टाइप गर्नुहोस्...",
  typeYourMessage: "तपाईंको सन्देश टाइप गर्नुहोस्",
  chatInputPlaceholder: "सन्देश टाइप गर्नुहोस्...",
  typeMessageBelow: "तल सन्देश टाइप गर्नुहोस्",
  
  // Message handling
  errorSendingMessage: "सन्देश पठाउन त्रुटि",
  emptyMessage: "खाली सन्देश",
  sendingMessage: "सन्देश पठाउँदै",
  messageCouldNotBeSent: "सन्देश पठाउन सकिएन",
  pleaseTypeMessage: "कृपया सन्देश टाइप गर्नुहोस्",
  messageIsBeingSent: "सन्देश पठाइँदै छ",
  
  // Translation features
  translationNotAvailable: "अनुवाद उपलब्ध छैन",
  contentFiltered: "सामग्री फिल्टर गरियो",
  failedToGetTranslation: "अनुवाद प्राप्त गर्न असफल",
  translationError: "अनुवाद त्रुटि",
  showTranslation: "अनुवाद देखाउनुहोस्",
  hideTranslation: "अनुवाद लुकाउनुहोस्",
  translationUnavailable: "अनुवाद उपलब्ध छैन",
  translationFailed: "अनुवाद असफल",
  
  // Voice features
  startVoiceChat: "आवाज च्याट सुरु गर्नुहोस्",
  stopVoiceChat: "आवाज च्याट रोक्नुहोस्",
  voiceChatActive: "आवाज च्याट सक्रिय",
  voiceChatInactive: "आवाज च्याट निष्क्रिय",
  clickToStartVoice: "आवाज सुरु गर्न क्लिक गर्नुहोस्",
  voiceChatNotSupported: "आवाज च्याट समर्थित छैन",
  voiceRecognitionError: "आवाज पहिचान त्रुटि",
  
  // Audio functionality
  play: "प्ले गर्नुहोस्",
  playAudio: "अडियो प्ले गर्नुहोस्",
  playTargetLanguageAudio: "लक्ष्य भाषाको अडियो प्ले गर्नुहोस्",
  playNativeLanguageAudio: "मातृभाषाको अडियो प्ले गर्नुहोस्",
  failedToPlayAudio: "अडियो प्ले गर्न असफल",
  audioNotSupported: "अडियो समर्थित छैन",
  ttsError: "TTS त्रुटि",
  
  // Grammar correction
  correctGrammar: "व्याकरण सुधार गर्नुहोस्",
  grammarCorrectionEnabled: "व्याकरण सुधार सक्षम गरियो",
  grammarCorrectionDisabled: "व्याकरण सुधार असक्षम गरियो",
  
  // Conversation management
  clearConversation: "कुराकानी खाली गर्नुहोस्",
  conversationCleared: "कुराकानी खाली गरियो",
  
  // Language metrics
  viewLanguageMetrics: "भाषा मेट्रिक्स हेर्नुहोस्",
  hideMetrics: "मेट्रिक्स लुकाउनुहोस्",
  languageMetrics: "भाषा मेट्रिक्स",
  grammarAccuracy: "व्याकरण शुद्धता",
  conversationComplexity: "कुराकानी जटिलता",
  vocabularyDiversity: "शब्दकोश विविधता",
  basedOnMessagesCount: "{{count}} सन्देशहरूको आधारमा",
  
  // Analysis features
  analyzeConversation: "कुराकानी विश्लेषण गर्नुहोस्",
  analyzing: "विश्लेषण गर्दै",
  analyzingConversation: "कुराकानी विश्लेषण गर्दै",
  noLanguageDataYet: "अहिलेसम्म कुनै भाषा डाटा छैन",
  notEnoughMessages: "पर्याप्त सन्देशहरू छैन",
  needMoreMessagesToAnalyze: "विश्लेषणका लागि थप सन्देशहरू चाहिन्छ",
  failedToAnalyzeConversation: "कुराकानी विश्लेषण गर्न असफल",
  
  // Error handling
  networkConnectionIssue: "नेटवर्क जडान समस्या",
  authRequired: "प्रमाणीकरण आवश्यक",
  pleaseLoginToAccessThisFeature: "यो सुविधा पहुँच गर्न कृपया लगइन गर्नुहोस्",
  emptyMessageReceived: "खाली सन्देश प्राप्त भयो",
  someContentWasFiltered: "केही सामग्री फिल्टर गरियो",
  
  // Status indicators
  connecting: "जडान गर्दै",
  thinking: "सोच्दै",
  generating: "उत्पादन गर्दै",
  retrying: "पुनः प्रयास गर्दै",
  
  // Hint system
  getResponseSuggestions: "प्रतिक्रिया सुझावहरू प्राप्त गर्नुहोस्",
  responseSuggestions: "प्रतिक्रिया सुझावहरू",
  clickPlayToHearPronunciation: "उच्चारण सुन्न प्ले क्लिक गर्नुहोस्",
  startConversationForSuggestions: "सुझावहरूका लागि कुराकानी सुरु गर्नुहोस्",
  greetings: "अभिवादनहरू",
  questions: "प्रश्नहरू",
  responses: "प्रतिक्रियाहरू",
  topics: "विषयहरू",
  couldNotGenerateHints: "संकेतहरू उत्पन्न गर्न सकिएन",
  hintGenerationFailed: "संकेत उत्पादन असफल",
  
  // Practice prompts
  practicePrompt: "अभ्यास प्रम्प्ट",
  sendPracticePrompt: "अभ्यास प्रम्प्ट पठाउनुहोस्",
  languageLearningPrompt: "भाषा सिक्ने प्रम्प्ट",
  conversationStarters: "कुराकानी सुरुकर्ताहरू",
  topicSuggestions: "विषय सुझावहरू",
  
  // Text-based practice
  startTextChatting: "पाठ च्याट सुरु गर्नुहोस्",
  practiceWithTextChat: "पाठ च्याटसँग अभ्यास गर्नुहोस्",
  textConversationPractice: "पाठ कुराकानी अभ्यास",
  noticeTextBasedPractice: "नोटिस: यो पाठ-आधारित अभ्यास हो",
  
  // Practice tips and guidance
  sendEnglishPracticePrompt: "अंग्रेजी अभ्यास प्रम्प्ट पठाउनुहोस्",
  askAboutGrammarRules: "व्याकरण नियमहरूको बारेमा सोध्नुहोस्",
  practiceConversationsDifferentSituations: "विभिन्न परिस्थितिहरूमा कुराकानी अभ्यास गर्नुहोस्",
  learnNewVocabulary: "नयाँ शब्दकोश सिक्नुहोस्",
  discussCulturalTopics: "सांस्कृतिक विषयहरूमा छलफल गर्नुहोस्",
  practiceConversation: "कुराकानी अभ्यास गर्नुहोस्",
  
  // Real-time features
  realTimeTranscription: "वास्तविक समय ट्रान्सक्रिप्शन",
  
  // Session management
  practiceSession: "अभ्यास सत्र",
  practiceComplete: "अभ्यास पूरा",
  practiceScore: "अभ्यास अंक",
  practiceTime: "अभ्यास समय",
  practiceProgress: "अभ्यास प्रगति",
  sessionSaved: "सत्र सेभ गरियो",
  sessionEnded: "सत्र समाप्त भयो"
};

export default practiceTranslations;
