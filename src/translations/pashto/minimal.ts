
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "د ژبې زده کړې ته ښه راغلاست",
  yourPersonalAICompanion: "ستاسو شخصي مصنوعي ذهانت ملګری",
  startPracticing: "تمرین پیل کړئ",
  practiceYourLanguageSkills: "خپلې ژبې مهارتونه تمرین کړئ",
  swipeUpToGetStarted: "د پیل لپاره پورته سوایپ کړئ",
  getStarted: "پیل کړئ",
  selectYourLanguagePreferences: "خپلې ژبنۍ خوښې انتخاب کړئ",

  // Language selection
  selectNativeLanguage: "خپله مورنۍ ژبه انتخاب کړئ",
  iSpeak: "زه خبرې کوم",
  saveLanguagePreferences: "ژبنۍ خوښې خوندي کړئ",

  // Auth
  signIn: "ننوتل",
  signUp: "راجستر شئ",
  signInToContinue: "د دوام لپاره ننوتل",
  createAccountToGetStarted: "د پیل لپاره حساب جوړ کړئ",
  email: "ایمیل",
  password: "پټ نوم",
  accessPasscode: "د لاسرسي کوډ",
  dontHaveAccount: "حساب نه لرئ؟",
  alreadyHaveAccount: "له مخکې حساب لرئ؟",

  // Header
  loggedInAs: "ننوتی د",
  signedInAs: "ننوتی د",
  logout: "وتل",
  lightMode: "روښانه حالت",

  // Navigation
  home: "کور",
  practice: "تمرین",
  textPractice: "متني تمرین",
  unlimitedVoicePracticeNav: "بې حده غږیز تمرین",
  pronunciationPracticeNav: "د تلفظ تمرین",
  aiAnalysis: "AI تحلیل",
  profile: "پروفایل",
  settings: "تنظیمات",

  // Practice page
  englishPractice: "د انګلیسي تمرین",
  startChatting: "چټ شروع کړئ",
  startConversationIn: "په {{language}} کې مکالمه پیل کړئ",
  fixGrammar: "ګرامر سم کړئ",
  correctGrammar: "ګرامر سم کړئ",
  clearConversation: "مکالمه پاکه کړئ",
  startTextChat: "متني چټ پیل کړئ",
  startTextChatting: "متني چټ پیل کړئ",
  typeMessageBelow: "پیغام دلته ولیکئ",
  typeMessageToPractice: "د {{language}} تمرین لپاره پیغام ولیکئ...",
  send: "ولیږئ",

  // Practice Guide
  practiceGuide: "د {{language}} تمرین لارښود",
  practiceGuideTitle: "د {{language}} تمرین لارښود",
  practiceGuideDescription: "دلته د {{language}} مؤثر تمرین لپاره ځینې مشورې دي:",
  practiceGuideIntro: "دلته د {{language}} مؤثر تمرین لپاره ځینې مشورې دي:",
  practiceGuideTip1: "هڅه وکړئ بشپړ جملې وکاروئ، که څه هم ساده وي.",
  practiceGuideTip2: "د غلطۍ کولو ویره مه کوئ — دا د زده کړې برخه ده!",
  practiceGuideTip3: "که څه نه پوهېږئ، پوښتنه وکړئ.",
  practiceGuideTip4: "نوي لغاتونه وکاروئ چې مو زده کړي دي.",
  practiceGuideTip5: "زموږ AI به ستاسو د مهارت کچې سره سمون ولري.",

  // Practice tips - using t() keys
  practiceTip1: "هڅه وکړئ بشپړ جملې وکاروئ، که څه هم ساده وي.",
  practiceTip2: "د غلطۍ کولو ویره مه کوئ — دا د زده کړې برخه ده!",
  practiceTip3: "که څه نه پوهېږئ، پوښتنه وکړئ.",
  practiceTip4: "نوي لغاتونه وکاروئ چې مو زده کړي دي.",
  practiceTip5: "زموږ AI به ستاسو د مهارت کچې سره سمون ولري.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "هڅه وکړئ بشپړ جملې وکاروئ، که څه هم ساده وي.",
  "Don't worry about mistakes — they're part of learning!": "د غلطۍ کولو ویره مه کوئ — دا د زده کړې برخه ده!",
  "Ask for explanations if there's something you don't understand.": "که څه نه پوهېږئ، پوښتنه وکړئ.",
  "Use words you've learned recently.": "نوي لغاتونه وکاروئ چې مو زده کړي دي.",
  "Our AI will adapt to your skill level and gradually help you improve.": "زموږ AI به ستاسو د مهارت کچې سره سمون ولري او په تدریجي ډول به د پرمختګ سره مرسته وکړي.",
  "Here are some tips to get the most out of your {{language}} practice:": "دلته د {{language}} تمرین څخه ډېر ګټه اخیستو لپاره ځینې مشورې دي:",

  // Hint button
  suggestionResponses: "سپارښتنې ځوابونه",
  responseSuggestions: "سپارښتنې ځوابونه",
  clickPlayToHearPronunciation: "د تلفظ د اورېدو لپاره پلی کلیک کړئ",
  startConversationForSuggestions: "د وړاندیزونو لپاره مکالمه پیل کړئ",
  startConversationToSeeSuggestions: "د وړاندیزونو لیدو لپاره مکالمه پیل کړئ",
  getResponseSuggestions: "د ځواب سپارښتنې ترلاسه کړئ",
  greetings: "سلامونه",
  questions: "پوښتنې",
  error: "تېروتنه",
  couldNotGenerateHints: "نشکارې اشارې رامینځته کړای",
  failedToPlayAudio: "غږ پلی کول ناکام شو",
  play: "پلی",

  // Voice chat
  unlimitedVoicePractice: "بې حده غږیز تمرین",
  practiceDescription: "د تمرین توضیحات",
  aiModelInfo: "د AI ماډل معلومات: OpenAI GPT-4o-mini د طبیعي ژبې د پوهاوي او تولید لپاره، د غږیزو ځوابونو لپاره د براوزر speech synthesis.",
  practiceLevel: "د تمرین کچه",
  intermediatePracticeLevel: "منځنۍ — د اشنا موضوعاتو په اړه خبرې کولی شي",
  "Intermediate - Can discuss familiar topics": "منځنۍ — د اشنا موضوعاتو په اړه خبرې کولی شي",

  // CEFR Level Descriptions
  cefrB1Description: "منځنۍ — د اشنا موضوعاتو په اړه خبرې کولی شي",
  cefrA1Description: "ابتدایی — بنسټیز عبارات او بیانونه",
  cefrA2Description: "لومړني — ساده ورځني اړیکې",
  cefrB2Description: "لوړ منځنی — په روانۍ سره اړیکه ټینګولی شي",

  currentLanguage: "اوسنۍ ژبه",
  practiceLanguage: "د تمرین ژبه",
  startSpeaking: "خبرو ته شروع ورکړئ",
  stopListening: "اورېدل ودرولئ",
  listeningNow: "اوس اورېدل کېږي",
  youSaid: "تاسو وویل",
  conversationStarters: "د خبرو پیل",
  howToStartConversation: "خبرې څنګه پیل کړو",
  tryThesePhrases: "دا جملې وازمویئ:",
  conversationStarter1: "سلام! نن څنګه یې؟",
  conversationStarter2: "نن موسم څنګه دی؟",
  conversationStarter3: "آیا کولی شئ یو ښه رستورانت وړاندیز کړئ؟",
  conversationStarter4: "ستاسو تفریحات او علایق څه دي؟",
  conversationStarter5: "زموږ ته د خپل غوره کتاب یا فلم په اړه ووایاست.",
  conversationStarter6: "تاسو په تېره اونۍ کې څه وکړل؟",
  conversationStarter7: "ستاسو د سبا پلانونه څه دي؟",
  conversationStarter8: "په هسپانوي/انګلیسي کې ... څنګه وايي؟",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "سلام، نن څنګه یې؟",
  "What's the weather like where you are?": "د تاسو هلته موسم څنګه دی؟",
  "Can you recommend a good restaurant?": "آیا کولی شئ یو ښه رستورانت وړاندیز کړئ؟",
  "What are your hobbies and interests?": "ستاسو تفریحات او علایق څه دي؟",
  "Tell me about your favorite book or movie.": "زموږ ته د خپل غوره کتاب یا فلم په اړه ووایاست.",
  "What did you do last weekend?": "تاسو په تېره اونۍ کې څه وکړل؟",
  "What are your plans for tomorrow?": "ستاسو د سبا پلانونه څه دي؟",
  "How do you say... in Spanish/English?": "په هسپانوي/انګلیسي کې ... څنګه وايي؟",

  practiceWithVoiceChat: "د غږیز چټ سره تمرین وکړئ",
  voiceChatTips: "دا وسیله د خبرو او اورېدو مهارتونو د ښه کولو لپاره وکاروئ. دلته ځینې مشورې دي:",
  voiceTip1: "د ورځني موضوعاتو په اړه پوښتنې وکړئ",
  voiceTip2: "عام عبارات او بیانونه تمرین کړئ",
  voiceTip3: "د خپل شاوخوا د لیدل شویو شیانو توصیف وکړئ",
  voiceTip4: "د ځانګړو موضوعاتو لکه سفر یا خواړو لپاره لغاتونه تمرین کړئ",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "دا وسیله د خبرو او اورېدو مهارتونو د ښه کولو لپاره وکاروئ. دلته ځینې مشورې دي:",
  "Ask questions about everyday topics": "د ورځني موضوعاتو په اړه پوښتنې وکړئ",
  "Practice common phrases and expressions": "عام عبارات او بیانونه تمرین کړئ",
  "Describe what you see around you": "د خپل شاوخوا د لیدل شویو شیانو توصیف وکړئ",
  "Practice vocabulary for specific topics like travel or food": "د ځانګړو موضوعاتو لکه سفر یا خواړو لپاره لغاتونه تمرین کړئ",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "د لیکنې د لیدو لپاره خبرو ته پیل ورکړئ",
  clickMicrophoneToStartRecording: "د ثبت د پیل لپاره په مایکروفون کلیک وکړئ",

  // Premium Voice Chat
  premiumVoiceChat: "پریمیم غږیز چټ",
  premiumVoiceChatBenefits: "د پریمیم غږیز چټ ګټې",
  premiumVoiceChatDescription: "د پریمیم AI ښوونکي سره د طبیعي غږیز خبرو له لارې {{practice}} تمرین وکړئ! AI به د ګرامر، لغاتو او تلفظ د ښه کولو سره مرسته وکړي.",
  premiumVoiceNote: "پریمیم غږیز چټ په اونۍ کې 10 دقیقو ته محدود دی",
  premiumVoiceNoteWithReset: "پریمیم غږیز چټ په اونۍ کې 10 دقیقې تمرین ته اجازه ورکوي. وخت هره دوشنبه د سهار 6 بجې (مرکزي وخت) بیرته ټاکل کېږي.",
  benefitNaturalVoice: "د ElevenLabs ټکنالوژۍ په کارولو سره د انسان ورته طبیعي غږیز تعامل",
  benefitAccentPronunciation: "د ژورې زده کړې لپاره سمه لهجه او تلفظ",
  benefitRegularPractice: "په اونۍ کې 10 دقیقې تمرین، دوشنبه د سهار 6 بجې بیرته ټاکل",

  // Pronunciation practice
  pronunciationPractice: "د تلفظ تمرین",
  improvePronunciationSkillsWith: "د هدفمند تمرین سره د تلفظ مهارتونه ښه کړئ",
  selectComplexityLevel: "د پیچلتیا کچه انتخاب کړئ",
  chooseDifficultyLevelBasedOn: "د خپل د ژبې وړتیا پر بنسټ د ستونزمنۍ کچه انتخاب کړئ",
  speechRate: "د خبرو کړنې سرعت",
  selectLevelToStart: "د تمرین د پیل لپاره کچه انتخاب کړئ",
  startExercise: "تمرین پیل کړئ",
  pronunciationPracticeTips: "د تلفظ تمرین مشورې",
  listenCarefullyTip: "د خبرو مخکې په دقت واورئ",
  payAttentionToStressTip: "stress او intonation ته پام ورکړئ",
  practiceDifficultSoundsTip: "ستونزمن غږونه څو ځله تمرین کړئ",
  recordYourselfTip: "خپل غږ ثبت کړئ او د native speakers سره یې پرتله کړئ",
  bePatientTip: "صبر وکړئ — د تلفظ ښه کول وخت نیسي",
  practiceExercise: "تمرین",
  topic: "موضوع",
  listenToPhrase: "عبارت واورئ",
  clickWordToHear: "د اورېدو لپاره په کلمه کلیک وکړئ",
  yourPronunciation: "ستاسو تلفظ",
  startRecording: "ثبت پیل کړئ",
  clickStartToRecord: "د ثبت لپاره 'پیل' کلیک کړئ",
  tryAgain: "بیا هڅه وکړئ",
  newPhrase: "نوې عبارت",
  generatingExercise: "تمرین چمتو کېږي",
  generatingNewPhrase: "نوې عبارت چمتو کېږي",
  levelDescription: "د کچې توضیحات",
  failedToGeneratePhrase: "عبارت چمتو کول ناکام شو",
  noSpeechDetected: "هیڅ خبرې ونه موندل شوې",
  pleaseTryAgain: "مهرباني وکړئ بیا هڅه وکړئ",
  failedToAnalyzePronunciation: "د تلفظ تحلیل ناکام شو",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "د تلفظ بیاځوابونه",
  accuracyScore: "د دقت نمرې",
  intonationScore: "د intonation نمرې",
  fluencyScore: "د روانۍ نمرې",
  complexityScore: "د پیچلتیا نمرې",
  wordAnalysis: "د کلمې تحلیل",
  phonemeAnalysis: "د phoneme تحلیل",
  overallFeedback: "ټولیز بیاځوابونه",
  excellent: "غوره",
  good: "ښه",
  fair: "مناسب",
  needsImprovement: "د ښه کولو ضرورت",

  // Additional UI elements
  processing: "پروسس کېږي",
  stopRecording: "ثبت ودرولئ",
  listeningToYou: "تاسو ته اورېدل کېږي",
  realTimeTranscription: "د ریښتیني وخت لیکنه",
  yourTranscription: "ستاسو لیکنه",
  playing: "لوبول کېږي",

  // Complexity levels
  novice: "ابتدایی",
  intermediate: "منځنی",
  advanced: "پرمختللی",
  superior: "غوره",
  noviceLevelDescription: "د بنسټیزو او اشنا موضوعاتو اداره کولی شي",
  intermediateLevelDescription: "د اشنا شیانو په اړه بحث کولی شي",
  advancedLevelDescription: "د پیچلو موضوعاتو د اعتماد سره اداره کولی شي",
  superiorLevelDescription: "د ژبې ټول دندې ترسره کولی شي",
  noviceLevelShortDescription: "ساده عبارات",
  intermediateLevelShortDescription: "اشنا موضوعات",
  advancedLevelShortDescription: "پیچلي موضوعات",
  superiorLevelShortDescription: "ټولې دندې",

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
