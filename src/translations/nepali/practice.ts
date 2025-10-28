
import { TranslationRecord } from "../types";

const practiceTranslations: TranslationRecord = {
  // Practice page core
  practice: "अभ्यास",
  practiceWithAI: "AI सँग अभ्यास गर्नुहोस्",
  startChatting: "च्याट सुरु गर्नुहोस्",
  clearConversation: "कुराकानी सफा गर्नुहोस्",
  correctGrammar: "व्याकरण सुधार गर्नुहोस्",
  
  // Chat interface with proper interpolation
  startConversationIn: "{{language}} मा कुराकानी सुरु गर्नुहोस्",
  startTextChatting: "पाठ च्याट सुरु गर्नुहोस्",
  
  // Practice guide with proper interpolation
  practiceGuide: "{{language}} अभ्यास गाइड",
  practiceGuideDescription: "{{language}} सिक्ने यात्रालाई सरल बनाउन यी सुझावहरू पालना गर्नुहोस्:",
  practiceTip1: "पूरा वाक्यहरू बनाउने कोशिश गर्नुहोस्, चाहे ती सरल भए पनि।",
  practiceTip2: "गल्तीहरूको चिन्ता नगर्नुहोस् — ती सिकाइका भाग हुन्!",
  practiceTip3: "यदि तपाईंले केही बुझ्नुभएन भने व्याख्याको लागि सोध्नुहोस्।",
  practiceTip4: "तपाईंले भर्खरै सिकेका शब्दहरू प्रयोग गर्नुहोस्।",
  practiceTip5: "हाम्रो AI तपाईंको सीप स्तरमा अनुकूल हुनेछ र बिस्तारै सुधार गर्न मद्दत गर्नेछ।",
  
  // Chat interface
  typeYourMessageHere: "तपाईंको सन्देश यहाँ टाइप गर्नुहोस्...",
  typeMessageBelow: "तल सन्देश टाइप गर्नुहोस्",
  chatPlaceholder: "{{targetLanguage}} अभ्यास गर्न आफ्नो सन्देश टाइप गर्नुहोस्...",
  practicePrompt: "नमस्ते! म {{targetLanguage}} कुराकानीको अभ्यास गर्न चाहन्छु। कृपया मेरो {{targetLanguage}} व्याकरण, शब्दावली र प्रयोग सुधार गर्न मद्दत गर्नुहोस्। के हामी आधारभूत कुराकानीबाट सुरु गर्न सक्छौं?",
  
  // Pronunciation practice
  pronunciationPractice: "उच्चारण अभ्यास",
  improvePronunciationSkillsWith: "लक्षित अभ्यासहरूका साथ आफ्नो उच्चारण सीप सुधार गर्नुहोस्",
  selectComplexityLevel: "जटिलता स्तर छान्नुहोस्",
  chooseDifficultyLevelBasedOn: "तपाईंको भाषा दक्षताका आधारमा कठिनाई स्तर छान्नुहोस्",
  selectLevelToStart: "अभ्यास सुरु गर्न स्तर छान्नुहोस्",
  pronunciationPracticeTips: "उच्चारण अभ्यास सुझावहरू",
  speechRate: "बोली दर",
  
  // Pronunciation tips
  listenCarefullyTip: "बोल्ने प्रयास गर्नु अघि ध्यानपूर्वक सुन्नुहोस्",
  payAttentionToStressTip: "तनाव ढाँचा र स्वरमा ध्यान दिनुहोस्",
  practiceDifficultSoundsTip: "कठिन आवाजहरू धेरै पटक अभ्यास गर्नुहोस्",
  recordYourselfTip: "आफूलाई रेकर्ड गर्नुहोस् र मूल भाषीहरूसँग तुलना गर्नुहोस्",
  bePatientTip: "धैर्य राख्नुहोस् - उच्चारण सुधार गर्न समय लाग्छ",
  
  // Pronunciation exercise interface
  practiceExercise: "अभ्यास अभ्यास",
  topic: "विषय",
  listenToPhrase: "वाक्यांश सुन्नुहोस्",
  playing: "बजाउँदै",
  clickWordToHear: "सुन्न शब्दमा क्लिक गर्नुहोस्",
  tryAgain: "फेरि प्रयास गर्नुहोस्",
  newPhrase: "नयाँ वाक्यांश",
  generatingNewPhrase: "नयाँ वाक्यांश उत्पन्न गर्दै",
  startExercise: "अभ्यास सुरु गर्नुहोस्",
  generatingExercise: "अभ्यास उत्पन्न गर्दै",
  levelDescription: "स्तर विवरण",
  
  // Pronunciation recording and feedback
  yourPronunciation: "तपाईंको उच्चारण",
  startRecording: "रेकर्डिङ सुरु गर्नुहोस्",
  clickStartToRecord: "रेकर्ड गर्न सुरु गर्न क्लिक गर्नुहोस्",
  listeningToYou: "तपाईंलाई सुन्दै",
  processing: "प्रक्रिया गर्दै",
  realTimeTranscription: "वास्तविक समय ट्रान्सक्रिप्शन",
  yourTranscription: "तपाईंको ट्रान्सक्रिप्शन",
  
  // Pronunciation feedback scores
  excellent: "उत्कृष्ट",
  good: "राम्रो",
  fair: "ठीक",
  needsImprovement: "सुधार आवश्यक",
  accuracyScore: "शुद्धता स्कोर",
  intonationScore: "स्वर स्कोर",
  fluencyScore: "प्रवाहता स्कोर",
  complexityScore: "जटिलता स्कोर",
  wordAnalysis: "शब्द विश्लेषण",
  phonemeAnalysis: "ध्वनि विश्लेषण",
  overallFeedback: "समग्र प्रतिक्रिया",
  
  // Complexity levels
  novice: "नयाँ",
  intermediate: "मध्यम",
  advanced: "उन्नत",
  superior: "उत्कृष्ट",
  noviceLevelShortDescription: "आधारभूत शब्दहरू र वाक्यांशहरू",
  intermediateLevelShortDescription: "सरल वाक्यहरू र कुराकानी",
  advancedLevelShortDescription: "जटिल अभिव्यक्ति र विचारहरू",
  superiorLevelShortDescription: "परिष्कृत भाषा प्रयोग",
  
  // Voice chat
  startVoiceConversation: "आवाज कुराकानी सुरु गर्नुहोस्",
  endVoiceConversation: "आवाज कुराकानी समाप्त गर्नुहोस्",
  voiceChatActive: "आवाज च्याट सक्रिय",
  
  // Progress and analysis
  aiProgressAnalysis: "AI प्रगति विश्लेषण",
  uploadLanguageTestTranscripts: "भाषा परीक्षा ट्रान्सक्रिप्ट अपलोड गर्नुहोस्",
  totalAnalyses: "कुल विश्लेषणहरू",
  currentLevel: "हालको स्तर",
  latestScore: "भर्खरको अंक",
  uploadAndAnalyze: "अपलोड र विश्लेषण गर्नुहोस्",
  analysisResults: "विश्लेषण परिणामहरू",
  progressTimeline: "प्रगति समयरेखा",
  uploadTestTranscript: "परीक्षा ट्रान्सक्रिप्ट अपलोड गर्नुहोस्",
  uploadLanguageTestScoreReport: "भाषा परीक्षा स्कोर रिपोर्ट अपलोड गर्नुहोस्",
  noFileChosen: "कुनै फाइल छानिएको छैन",
  dragDropOrClickToUpload: "तान्नुहोस् र छोड्नुहोस् वा अपलोड गर्न क्लिक गर्नुहोस्",
  supportsFileFormats: "JPEG, PNG, WebP र PDF फाइलहरू १०MB सम्म समर्थित",
  selectFile: "फाइल छान्नुहोस्",
  whatOurAiCanAnalyze: "हाम्रो AI ले के विश्लेषण गर्न सक्छ:",
  overallScoresAndCefrLevels: "• समग्र स्कोर र CEFR स्तरहरू",
  individualSkillBreakdowns: "• व्यक्तिगत सीप विभाजन",
  strengthsAndAreasForImprovement: "• बलियो क्षेत्र र सुधारका क्षेत्रहरू",
  progressTrackingOverTime: "• समयसँगै प्रगति ट्र्याकिङ",
  
  // Analysis page specific translations
  latestAnalysisResults: "भर्खरको विश्लेषण परिणामहरू",
  detailedAnalysis: "विस्तृत विश्लेषण",
  analysisBreakdown: "विश्लेषण विभाजन",
  strengths: "शक्तिहरू",
  areasForImprovement: "सुधारका क्षेत्रहरू",
  aiRecommendations: "AI सुझावहरू",
  analysisHistory: "विश्लेषण इतिहास",
  yourPreviousAnalysisResults: "तपाईंका अघिल्ला विश्लेषण परिणामहरू",
  analysisComplete: "विश्लेषण पूरा भयो",
  transcriptAnalyzedSuccessfully: "तपाईंको ट्रान्सक्रिप्ट सफलतापूर्वक विश्लेषण गरिएको छ!",
  
  // Hint button interface translations
  responseSuggestions: "जवाफ सुझावहरू",
  clickPlayToHearPronunciation: "उच्चारण सुन्न प्ले मा क्लिक गर्नुहोस्",
  startConversationForSuggestions: "सुझावहरू हेर्न कुराकानी सुरु गर्नुहोस्",
  getResponseSuggestions: "जवाफ सुझावहरू प्राप्त गर्नुहोस्",
  analyzeConversation: "कुराकानी विश्लेषण गर्नुहोस्",
  analyzing: "विश्लेषण गर्दै",
  analysisLimitReached: "विश्लेषण सीमा पुगेको छ",
  canOnlyAnalyzeOncePerSession: "XP फार्मिङ रोक्न तपाईं प्रति सत्र एक पटक मात्र कुराकानी विश्लेषण गर्न सक्नुहुन्छ। फेरि विश्लेषण गर्न नयाँ अभ्यास सत्र सुरु गर्नुहोस्।",
  conversationAnalysis: "कुराकानी विश्लेषण",
  grammarAccuracy: "व्याकरण शुद्धता",
  complexity: "जटिलता",
  
  // Skill names (standardized)
  reading: "पढाइ",
  writing: "लेखाइ",
  speaking: "बोलाइ",
  listening: "सुनाइ",
  overallLevel: "समग्र स्तर",
  
  // Practice mode selection
  startPracticing: "अभ्यास सुरु गर्नुहोस्",
  practiceYourLanguageSkills: "आफ्नो भाषा सीप अभ्यास गर्नुहोस्",
  choosePracticeMode: "अभ्यास मोड छान्नुहोस्",
  typeAndChat: "आफ्नो AI ट्युटरसँग टाइप र कुराकानी गर्नुहोस्",
  speakAndListen: "प्राकृतिक कुराकानीमा बोल्नुहोस् र सुन्नुहोस्",
  improvePronunciation: "लक्षित अभ्यासहरूसँग आफ्नो उच्चारण सुधार गर्नुहोस्"
};

export default practiceTranslations;
