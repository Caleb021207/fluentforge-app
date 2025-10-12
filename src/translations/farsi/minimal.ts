
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "به یادگیری زبان خوش آمدید",
  yourPersonalAICompanion: "همراه هوش مصنوعی شخصی شما",
  startPracticing: "شروع تمرین",
  practiceYourLanguageSkills: "مهارت‌های زبانی خود را تمرین کنید",
  swipeUpToGetStarted: "برای شروع به بالا بکشید",
  getStarted: "شروع کنید",
  selectYourLanguagePreferences: "ترجیحات زبان خود را انتخاب کنید",

  // Language selection
  selectNativeLanguage: "زبان مادری خود را انتخاب کنید",
  iSpeak: "من صحبت می‌کنم",
  saveLanguagePreferences: "ذخیره ترجیحات زبان",

  // Auth
  signIn: "ورود",
  signUp: "ثبت‌نام",
  signInToContinue: "برای ادامه وارد شوید",
  createAccountToGetStarted: "برای شروع یک حساب بسازید",
  email: "ایمیل",
  password: "رمز عبور",
  accessPasscode: "کد دسترسی",
  dontHaveAccount: "حساب کاربری ندارید؟",
  alreadyHaveAccount: "قبلاً حساب دارید؟",

  // Header
  loggedInAs: "ورود به عنوان",
  signedInAs: "ورود به عنوان",
  logout: "خروج",
  lightMode: "حالت روشن",

  // Navigation
  home: "خانه",
  practice: "تمرین",
  textPractice: "تمرین متنی",
  unlimitedVoicePracticeNav: "تمرین صوتی نامحدود",
  pronunciationPracticeNav: "تمرین تلفظ",
  aiAnalysis: "تحلیل هوش مصنوعی",
  profile: "پروفایل",
  settings: "تنظیمات",

  // Practice page
  englishPractice: "تمرین زبان انگلیسی",
  startChatting: "شروع چت",
  startConversationIn: "شروع مکالمه به {{language}}",
  fixGrammar: "اصلاح دستور زبان",
  correctGrammar: "اصلاح دستور زبان",
  clearConversation: "پاک‌سازی مکالمه",
  startTextChat: "شروع چت متنی",
  startTextChatting: "شروع چت متنی",
  typeMessageBelow: "پیام را در زیر وارد کنید",
  typeMessageToPractice: "برای تمرین {{language}} پیام وارد کنید...",
  send: "ارسال",

  // Practice Guide
  practiceGuide: "راهنمای تمرین {{language}}",
  practiceGuideTitle: "راهنمای تمرین {{language}}",
  practiceGuideDescription: "در اینجا چند نکته مفید برای تمرین {{language}} وجود دارد:",
  practiceGuideIntro: "در اینجا چند نکته مفید برای تمرین {{language}} وجود دارد:",
  practiceGuideTip1: "سعی کنید با جملات کامل صحبت کنید.",
  practiceGuideTip2: "از اشتباه کردن نترسید — بخشی از یادگیری است.",
  practiceGuideTip3: "در صورت عدم درک، سؤال بپرسید.",
  practiceGuideTip4: "از کلمات جدیدی که یاد گرفته‌اید استفاده کنید.",
  practiceGuideTip5: "هوش مصنوعی براساس سطح شما پاسخ می‌دهد.",

  // Practice tips - using t() keys
  practiceTip1: "سعی کنید با جملات کامل صحبت کنید.",
  practiceTip2: "از اشتباه کردن نترسید — بخشی از یادگیری است.",
  practiceTip3: "در صورت عدم درک، سؤال بپرسید.",
  practiceTip4: "از کلمات جدیدی که یاد گرفته‌اید استفاده کنید.",
  practiceTip5: "هوش مصنوعی براساس سطح شما پاسخ می‌دهد.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "سعی کنید با جملات کامل صحبت کنید.",
  "Don't worry about mistakes — they're part of learning!": "از اشتباه کردن نترسید — بخشی از یادگیری است.",
  "Ask for explanations if there's something you don't understand.": "در صورت عدم درک، سؤال بپرسید.",
  "Use words you've learned recently.": "از کلمات جدیدی که یاد گرفته‌اید استفاده کنید.",
  "Our AI will adapt to your skill level and gradually help you improve.": "هوش مصنوعی براساس سطح شما پاسخ می‌دهد و تدریجاً به بهبودتان کمک می‌کند.",
  "Here are some tips to get the most out of your {{language}} practice:": "در اینجا چند نکته برای بهره‌برداری بهتر از تمرین {{language}} وجود دارد:",

  // Hint button
  suggestionResponses: "پیشنهادات پاسخ",
  responseSuggestions: "پیشنهادات پاسخ",
  clickPlayToHearPronunciation: "برای شنیدن تلفظ روی پخش کلیک کنید",
  startConversationForSuggestions: "برای دریافت پیشنهادات مکالمه‌ای را شروع کنید",
  startConversationToSeeSuggestions: "برای مشاهده پیشنهادات، مکالمه‌ای را شروع کنید",
  getResponseSuggestions: "دریافت پیشنهادات پاسخ",
  greetings: "سلام‌ها",
  questions: "سؤالات",
  error: "خطا",
  couldNotGenerateHints: "امکان تولید راهنمایی وجود ندارد",
  failedToPlayAudio: "پخش صدا انجام نشد",
  play: "پخش",

  // Voice chat
  unlimitedVoicePractice: "تمرین صوتی نامحدود",
  practiceDescription: "توضیحات تمرین",
  aiModelInfo: "اطلاعات مدل هوش مصنوعی: OpenAI GPT-4o-mini برای درک و تولید زبان طبیعی، سنتز گفتار مرورگر برای پاسخ‌های صوتی.",
  practiceLevel: "سطح تمرین",
  intermediatePracticeLevel: "متوسط — گفتگو در مورد موضوعات آشنا",
  "Intermediate - Can discuss familiar topics": "متوسط — گفتگو در مورد موضوعات آشنا",

  // CEFR Level Descriptions
  cefrB1Description: "متوسط — گفتگو در مورد موضوعات آشنا",
  cefrA1Description: "مبتدی — عبارات و تعبیرات پایه",
  cefrA2Description: "پایه — ارتباط ساده روزمره",
  cefrB2Description: "متوسط بالا — ارتباط روان",

  currentLanguage: "زبان فعلی",
  practiceLanguage: "زبان تمرین",
  startSpeaking: "شروع به صحبت",
  stopListening: "توقف شنیدن",
  listeningNow: "در حال شنیدن",
  youSaid: "شما گفتید",
  conversationStarters: "شروع‌کننده‌های مکالمه",
  howToStartConversation: "چگونه مکالمه را شروع کنیم",
  tryThesePhrases: "این عبارات را امتحان کنید:",
  conversationStarter1: "سلام! حالتان چطور است؟",
  conversationStarter2: "امروز هوا چطور است؟",
  conversationStarter3: "آیا می‌توانید رستوران خوبی را پیشنهاد دهید؟",
  conversationStarter4: "سرگرمی و علایق شما چیست؟",
  conversationStarter5: "درباره کتاب یا فیلم مورد علاقه‌تان بگویید.",
  conversationStarter6: "آخر هفته چه کردید؟",
  conversationStarter7: "برنامه فردای شما چیست؟",
  conversationStarter8: "چگونه ... را به اسپانیایی/انگلیسی می‌گویند؟",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "سلام! امروز حالتان چطور است؟",
  "What's the weather like where you are?": "آب و هوای محل شما چگونه است؟",
  "Can you recommend a good restaurant?": "آیا می‌توانید رستوران خوبی را پیشنهاد دهید؟",
  "What are your hobbies and interests?": "سرگرمی و علایق شما چیست؟",
  "Tell me about your favorite book or movie.": "درباره کتاب یا فیلم مورد علاقه‌تان بگویید.",
  "What did you do last weekend?": "آخر هفته چه کردید؟",
  "What are your plans for tomorrow?": "برنامه فردای شما چیست؟",
  "How do you say... in Spanish/English?": "چگونه ... را به اسپانیایی/انگلیسی می‌گویند؟",

  practiceWithVoiceChat: "تمرین با چت صوتی",
  voiceChatTips: "از این ابزار برای بهبود مهارت‌های گفتاری و شنیداری استفاده کنید. چند نکته:",
  voiceTip1: "درباره موضوعات روزمره سؤال بپرسید",
  voiceTip2: "عبارات و تعبیرات رایج را تمرین کنید",
  voiceTip3: "آنچه را در اطراف می‌بینید توصیف کنید",
  voiceTip4: "واژگان موضوعات خاص مانند سفر یا غذا را تمرین کنید",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "از این ابزار برای بهبود مهارت‌های گفتاری و شنیداری استفاده کنید. چند نکته:",
  "Ask questions about everyday topics": "درباره موضوعات روزمره سؤال بپرسید",
  "Practice common phrases and expressions": "عبارات و تعبیرات رایج را تمرین کنید",
  "Describe what you see around you": "آنچه را در اطراف می‌بینید توصیف کنید",
  "Practice vocabulary for specific topics like travel or food": "واژگان موضوعات خاص مانند سفر یا غذا را تمرین کنید",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "برای مشاهده رونوشت شروع به صحبت کنید",
  clickMicrophoneToStartRecording: "برای شروع ضبط روی میکروفون کلیک کنید",

  // Premium Voice Chat
  premiumVoiceChat: "چت صوتی ویژه",
  premiumVoiceChatBenefits: "مزایای چت صوتی ویژه",
  premiumVoiceChatDescription: "{{practice}} را از طریق مکالمات صوتی طبیعی با مربی هوش مصنوعی ویژه تمرین کنید! هوش مصنوعی در بهبود دستور زبان، واژگان و تلفظ کمک خواهد کرد.",
  premiumVoiceNote: "چت صوتی ویژه به ۱۰ دقیقه در هفته محدود است",
  premiumVoiceNoteWithReset: "چت صوتی ویژه ۱۰ دقیقه تمرین در هفته امکان دارد. زمان هر دوشنبه ساعت ۶ صبح (وقت مرکزی) بازنشانی می‌شود.",
  benefitNaturalVoice: "تعامل صوتی طبیعی شبیه انسان با استفاده از فناوری ElevenLabs",
  benefitAccentPronunciation: "لهجه و تلفظ دقیق برای یادگیری عمیق",
  benefitRegularPractice: "۱۰ دقیقه تمرین در هفته، بازنشانی دوشنبه ساعت ۶ صبح",

  // Pronunciation practice
  pronunciationPractice: "تمرین تلفظ",
  improvePronunciationSkillsWith: "بهبود مهارت‌های تلفظ با تمرین هدفمند",
  selectComplexityLevel: "سطح پیچیدگی را انتخاب کنید",
  chooseDifficultyLevelBasedOn: "براساس توانایی زبانی خود سطح سختی را انتخاب کنید",
  speechRate: "سرعت گفتار",
  selectLevelToStart: "برای شروع تمرین سطحی را انتخاب کنید",
  startExercise: "شروع تمرین",
  pronunciationPracticeTips: "نکات تمرین تلفظ",
  listenCarefullyTip: "قبل از صحبت با دقت گوش دهید",
  payAttentionToStressTip: "به تکیه و آهنگ توجه کنید",
  practiceDifficultSoundsTip: "صداهای سخت را بارها تمرین کنید",
  recordYourselfTip: "صدای خود را ضبط کنید و با گویندگان بومی مقایسه کنید",
  bePatientTip: "صبور باشید — بهبود تلفظ زمان می‌برد",
  practiceExercise: "تمرین",
  topic: "موضوع",
  listenToPhrase: "به عبارت گوش دهید",
  clickWordToHear: "برای شنیدن روی کلمه کلیک کنید",
  yourPronunciation: "تلفظ شما",
  startRecording: "شروع ضبط",
  clickStartToRecord: "برای ضبط روی 'شروع' کلیک کنید",
  tryAgain: "دوباره تلاش کنید",
  newPhrase: "عبارت جدید",
  generatingExercise: "در حال تولید تمرین",
  generatingNewPhrase: "در حال تولید عبارت جدید",
  levelDescription: "توضیحات سطح",
  failedToGeneratePhrase: "تولید عبارت انجام نشد",
  noSpeechDetected: "هیچ گفتاری تشخیص داده نشد",
  pleaseTryAgain: "لطفاً دوباره تلاش کنید",
  failedToAnalyzePronunciation: "تجزیه و تحلیل تلفظ انجام نشد",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "بازخورد تلفظ",
  accuracyScore: "امتیاز دقت",
  intonationScore: "امتیاز آهنگ",
  fluencyScore: "امتیاز روانی",
  complexityScore: "امتیاز پیچیدگی",
  wordAnalysis: "تحلیل کلمه",
  phonemeAnalysis: "تحلیل واج",
  overallFeedback: "بازخورد کلی",
  excellent: "عالی",
  good: "خوب",
  fair: "متوسط",
  needsImprovement: "نیاز به بهبود",

  // Additional UI elements
  processing: "در حال پردازش",
  stopRecording: "توقف ضبط",
  listeningToYou: "در حال گوش دادن به شما",
  realTimeTranscription: "رونویسی بلادرنگ",
  yourTranscription: "رونوشت شما",
  playing: "در حال پخش",

  // Complexity levels
  novice: "مبتدی",
  intermediate: "متوسط",
  advanced: "پیشرفته",
  superior: "عالی",
  noviceLevelDescription: "قادر به مدیریت موضوعات اساسی و آشنا",
  intermediateLevelDescription: "قادر به بحث در مورد موضوعات آشنا",
  advancedLevelDescription: "قادر به مدیریت موضوعات پیچیده با اعتماد به نفس",
  superiorLevelDescription: "قادر به انجام همه وظایف زبانی",
  noviceLevelShortDescription: "عبارات ساده",
  intermediateLevelShortDescription: "موضوعات آشنا",
  advancedLevelShortDescription: "موضوعات پیچیده",
  superiorLevelShortDescription: "همه وظایف",

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
