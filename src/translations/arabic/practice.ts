
import { TranslationRecord } from "../types";

const practiceTranslations: TranslationRecord = {
  // Practice page core
  practice: "ممارسة",
  practiceWithAI: "ممارسة مع الذكاء الاصطناعي",
  startChatting: "بدء المحادثة",
  clearConversation: "مسح المحادثة",
  correctGrammar: "تصحيح القواعد",
  
  // Chat interface with proper interpolation
  startConversationIn: "بدء محادثة باللغة {{language}}",
  startTextChatting: "بدء المحادثة النصية",
  
  // Practice guide with proper interpolation
  practiceGuide: "دليل ممارسة {{language}}",
  practiceGuideDescription: "اتبع هذه النصائح لجعل رحلة تعلم {{language}} أسهل:",
  practiceTip1: "حاول تكوين جمل كاملة، حتى لو كانت بسيطة.",
  practiceTip2: "لا تقلق بشأن الأخطاء — فهي جزء من التعلم!",
  practiceTip3: "اطلب توضيحات إذا كنت لا تفهم شيئًا.",
  practiceTip4: "استخدم الكلمات التي تعلمتها مؤخرًا.",
  practiceTip5: "سيتكيف الذكاء الاصطناعي مع مستوى مهارتك وسيساعدك تدريجيًا على التحسن.",
  
  // Chat interface
  typeYourMessageHere: "اكتب رسالتك هنا...",
  typeMessageBelow: "اكتب رسالة أدناه",
  chatPlaceholder: "اكتب رسالتك لممارسة {{targetLanguage}}...",
  practicePrompt: "مرحبًا! أود ممارسة المحادثة باللغة {{targetLanguage}}. يرجى مساعدتي من خلال تصحيح قواعد {{targetLanguage}} والمفردات والاستخدام. هل يمكننا البدء بمحادثة أساسية؟",
  
  // Pronunciation practice
  pronunciationPractice: "ممارسة النطق",
  improvePronunciationSkillsWith: "حسن مهارات النطق بتمارين موجهة",
  selectComplexityLevel: "اختر مستوى التعقيد",
  chooseDifficultyLevelBasedOn: "اختر مستوى الصعوبة بناءً على كفاءتك اللغوية",
  selectLevelToStart: "اختر مستوى لبدء الممارسة",
  pronunciationPracticeTips: "نصائح ممارسة النطق",
  speechRate: "معدل الكلام",
  
  // Pronunciation tips
  listenCarefullyTip: "استمع بعناية للصوت قبل محاولة التحدث",
  payAttentionToStressTip: "انتبه لأنماط النبرة والتنغيم",
  practiceDifficultSoundsTip: "مارس الأصوات الصعبة عدة مرات",
  recordYourselfTip: "سجل نفسك وقارن مع المتحدثين الأصليين",
  bePatientTip: "كن صبورًا - تحسين النطق يستغرق وقتًا",
  
  // Pronunciation exercise interface
  practiceExercise: "تمرين ممارسة",
  topic: "موضوع",
  listenToPhrase: "استمع للعبارة",
  playing: "تشغيل",
  clickWordToHear: "انقر على الكلمة للاستماع",
  tryAgain: "حاول مرة أخرى",
  newPhrase: "عبارة جديدة",
  generatingNewPhrase: "إنشاء عبارة جديدة",
  startExercise: "بدء التمرين",
  generatingExercise: "إنشاء التمرين",
  levelDescription: "وصف المستوى",
  
  // Pronunciation recording and feedback
  yourPronunciation: "نطقك",
  startRecording: "بدء التسجيل",
  clickStartToRecord: "انقر للبدء في التسجيل",
  listeningToYou: "أستمع إليك",
  processing: "معالجة",
  realTimeTranscription: "نسخ في الوقت الفعلي",
  yourTranscription: "نسختك",
  
  // Pronunciation feedback scores
  excellent: "ممتاز",
  good: "جيد",
  fair: "مقبول",
  needsImprovement: "يحتاج تحسين",
  accuracyScore: "نقاط الدقة",
  intonationScore: "نقاط التنغيم",
  fluencyScore: "نقاط الطلاقة",
  complexityScore: "نقاط التعقيد",
  wordAnalysis: "تحليل الكلمات",
  phonemeAnalysis: "تحليل الأصوات",
  overallFeedback: "التعليقات العامة",
  
  // Complexity levels
  novice: "مبتدئ",
  intermediate: "متوسط",
  advanced: "متقدم",
  superior: "متفوق",
  noviceLevelShortDescription: "كلمات وعبارات أساسية",
  intermediateLevelShortDescription: "جمل بسيطة ومحادثات",
  advancedLevelShortDescription: "تعبيرات وأفكار معقدة",
  superiorLevelShortDescription: "استخدام متطور للغة",
  
  // Voice chat
  startVoiceConversation: "بدء محادثة صوتية",
  endVoiceConversation: "إنهاء المحادثة الصوتية",
  voiceChatActive: "المحادثة الصوتية نشطة",
  
  // Progress and analysis
  aiProgressAnalysis: "تحليل التقدم بالذكاء الاصطناعي",
  uploadLanguageTestTranscripts: "رفع نصوص اختبارات اللغة",
  totalAnalyses: "التحليلات الإجمالية",
  currentLevel: "المستوى الحالي",
  latestScore: "أحدث نقاط",
  uploadAndAnalyze: "رفع وتحليل",
  analysisResults: "نتائج التحليل",
  progressTimeline: "الجدول الزمني للتقدم",
  uploadTestTranscript: "رفع نص الاختبار",
  uploadLanguageTestScoreReport: "رفع تقرير نقاط اختبار اللغة",
  noFileChosen: "لم يتم اختيار ملف",
  dragDropOrClickToUpload: "اسحب وأفلت أو انقر للرفع",
  supportsFileFormats: "يدعم ملفات JPEG وPNG وWebP وPDF حتى 10 ميجابايت",
  selectFile: "اختر ملف",
  whatOurAiCanAnalyze: "ما يمكن لذكائنا الاصطناعي تحليله:",
  overallScoresAndCefrLevels: "• النقاط الإجمالية ومستويات CEFR",
  individualSkillBreakdowns: "• تفصيل المهارات الفردية",
  strengthsAndAreasForImprovement: "• نقاط القوة ومجالات التحسين",
  progressTrackingOverTime: "• تتبع التقدم عبر الزمن",
  
  // Analysis page specific translations
  latestAnalysisResults: "نتائج التحليل الأحدث",
  detailedAnalysis: "تحليل مفصل",
  analysisBreakdown: "تفصيل التحليل",
  strengths: "نقاط القوة",
  areasForImprovement: "مجالات التحسين",
  aiRecommendations: "توصيات الذكاء الاصطناعي",
  analysisHistory: "تاريخ التحليلات",
  yourPreviousAnalysisResults: "نتائج تحليلاتك السابقة",
  analysisComplete: "التحليل مكتمل",
  transcriptAnalyzedSuccessfully: "تم تحليل نصك بنجاح!",
  
  // Hint button interface translations
  responseSuggestions: "اقتراحات الرد",
  clickPlayToHearPronunciation: "انقر على التشغيل لسماع النطق",
  startConversationForSuggestions: "ابدأ محادثة لرؤية الاقتراحات",
  getResponseSuggestions: "احصل على اقتراحات الرد",
  analyzeConversation: "تحليل المحادثة",
  analyzing: "جاري التحليل",
  analysisLimitReached: "تم الوصول إلى حد التحليل",
  canOnlyAnalyzeOncePerSession: "يمكنك تحليل المحادثة مرة واحدة فقط في كل جلسة لمنع تكديس النقاط. ابدأ جلسة تدريب جديدة للتحليل مرة أخرى.",
  conversationAnalysis: "تحليل المحادثة",
  grammarAccuracy: "دقة القواعد",
  complexity: "التعقيد",
  
  // Skill names (standardized)
  reading: "القراءة",
  writing: "الكتابة",
  speaking: "التحدث",
  listening: "الاستماع",
  overallLevel: "المستوى العام",
  
  // Practice mode selection
  startPracticing: "ابدأ الممارسة",
  practiceYourLanguageSkills: "مارس مهاراتك اللغوية",
  choosePracticeMode: "اختر وضع الممارسة",
  typeAndChat: "اكتب وتحدث مع مدرسك الذكي",
  speakAndListen: "تحدث واستمع في محادثات طبيعية",
  improvePronunciation: "حسّن نطقك بتمارين موجهة"
};

export default practiceTranslations;
