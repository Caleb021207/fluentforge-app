
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "زبان سیکھنے میں خوش آمدید",
  yourPersonalAICompanion: "آپ کا ذاتی اے آئی ساتھی",
  startPracticing: "مشق شروع کریں",
  practiceYourLanguageSkills: "اپنی زبان کی مہارتوں کی مشق کریں",
  swipeUpToGetStarted: "شروع کرنے کے لیے اوپر سوائپ کریں",
  getStarted: "شروع کریں",
  selectYourLanguagePreferences: "اپنی زبان کی ترجیحات منتخب کریں",

  // Language selection
  selectNativeLanguage: "اپنی مادری زبان منتخب کریں",
  iSpeak: "میں بولتا ہوں",
  saveLanguagePreferences: "زبان کی ترجیحات محفوظ کریں",

  // Auth
  signIn: "سائن ان کریں",
  signUp: "رجسٹر کریں",
  signInToContinue: "جاری رکھنے کے لیے سائن ان کریں",
  createAccountToGetStarted: "شروع کرنے کے لیے اکاؤنٹ بنائیں",
  email: "ای میل",
  password: "پاس ورڈ",
  accessPasscode: "رسائی کا کوڈ",
  dontHaveAccount: "اکاؤنٹ نہیں ہے؟",
  alreadyHaveAccount: "پہلے سے اکاؤنٹ ہے؟",

  // Header
  loggedInAs: "بطور لاگ ان",
  signedInAs: "بطور سائن ان",
  logout: "لاگ آؤٹ",
  lightMode: "روشن موڈ",

  // Navigation
  home: "ہوم",
  practice: "مشق",
  textPractice: "متنی مشق",
  unlimitedVoicePracticeNav: "لامحدود آواز کی مشق",
  pronunciationPracticeNav: "ادائیگی کی مشق",
  aiAnalysis: "اے آئی تجزیہ",
  profile: "پروفائل",
  settings: "ترتیبات",

  // Practice page
  englishPractice: "انگریزی کی مشق",
  startChatting: "چیٹ شروع کریں",
  startConversationIn: "{{language}} میں گفتگو شروع کریں",
  fixGrammar: "گرامر درست کریں",
  correctGrammar: "گرامر درست کریں",
  clearConversation: "گفتگو صاف کریں",
  startTextChat: "متنی چیٹ شروع کریں",
  startTextChatting: "متنی چیٹ شروع کریں",
  typeMessageBelow: "نیچے پیغام لکھیں",
  typeMessageToPractice: "{{language}} کی مشق کے لیے پیغام لکھیں...",
  send: "بھیجیں",

  // Practice Guide
  practiceGuide: "{{language}} مشق کی رہنمائی",
  practiceGuideTitle: "{{language}} مشق کی رہنمائی",
  practiceGuideDescription: "یہاں {{language}} کی مؤثر مشق کے لیے کچھ تجاویز ہیں:",
  practiceGuideIntro: "یہاں {{language}} کی مؤثر مشق کے لیے کچھ تجاویز ہیں:",
  practiceGuideTip1: "مکمل جملے بولنے کی کوشش کریں، چاہے وہ آسان ہوں۔",
  practiceGuideTip2: "غلطیوں سے نہ گھبرائیں — یہ سیکھنے کا حصہ ہے!",
  practiceGuideTip3: "اگر کچھ سمجھ نہ آئے تو وضاحت مانگیں۔",
  practiceGuideTip4: "حال ہی میں سیکھے گئے الفاظ استعمال کریں۔",
  practiceGuideTip5: "ہمارا اے آئی آپ کی مہارت کی سطح کے مطابق ڈھل جائے گا۔",

  // Practice tips - using t() keys
  practiceTip1: "مکمل جملے بولنے کی کوشش کریں، چاہے وہ آسان ہوں۔",
  practiceTip2: "غلطیوں سے نہ گھبرائیں — یہ سیکھنے کا حصہ ہے!",
  practiceTip3: "اگر کچھ سمجھ نہ آئے تو وضاحت مانگیں۔",
  practiceTip4: "حال ہی میں سیکھے گئے الفاظ استعمال کریں۔",
  practiceTip5: "ہمارا اے آئی آپ کی مہارت کی سطح کے مطابق ڈھل جائے گا۔",

  // Practice Guide - using exact same keys as shown in the UI  
  "Try to form complete sentences, even if they're simple.": "مکمل جملے بولنے کی کوشش کریں، چاہے وہ آسان ہوں۔",
  "Don't worry about mistakes — they're part of learning!": "غلطیوں سے نہ گھبرائیں — یہ سیکھنے کا حصہ ہے!",
  "Ask for explanations if there's something you don't understand.": "اگر کچھ سمجھ نہ آئے تو وضاحت مانگیں۔",
  "Use words you've learned recently.": "حال ہی میں سیکھے گئے الفاظ استعمال کریں۔",
  "Our AI will adapt to your skill level and gradually help you improve.": "ہمارا اے آئی آپ کی مہارت کی سطح کے مطابق ڈھل کر آہستہ آہستہ بہتری میں مدد کرے گا۔",
  "Here are some tips to get the most out of your {{language}} practice:": "یہاں آپ کی {{language}} مشق سے زیادہ سے زیادہ فائدہ اٹھانے کے لیے کچھ تجاویز ہیں:",

  // Hint button
  suggestionResponses: "جواب کی تجاویز",
  responseSuggestions: "جواب کی تجاویز",
  clickPlayToHearPronunciation: "ادائیگی سننے کے لیے پلے پر کلک کریں",
  startConversationForSuggestions: "تجاویز حاصل کرنے کے لیے گفتگو شروع کریں",
  startConversationToSeeSuggestions: "تجاویز دیکھنے کے لیے گفتگو شروع کریں",
  getResponseSuggestions: "جواب کی تجاویز حاصل کریں",
  greetings: "سلام",
  questions: "سوالات",
  error: "خرابی",
  couldNotGenerateHints: "اشارے پیدا نہیں کر سکے",
  failedToPlayAudio: "آڈیو چلانے میں ناکام",
  play: "چلائیں",

  // Voice chat
  unlimitedVoicePractice: "لامحدود آواز کی مشق",
  practiceDescription: "مشق کی تفصیل",
  aiModelInfo: "اے آئی ماڈل کی معلومات: OpenAI GPT-4o-mini قدرتی زبان کی سمجھ اور تخلیق کے لیے، آواز کے جوابات کے لیے براؤزر speech synthesis۔",
  practiceLevel: "مشق کی سطح",
  intermediatePracticeLevel: "درمیانی — مانوس موضوعات پر بحث کر سکتے ہیں",
  "Intermediate - Can discuss familiar topics": "درمیانی — مانوس موضوعات پر بحث کر سکتے ہیں",

  // CEFR Level Descriptions
  cefrB1Description: "درمیانی — مانوس موضوعات پر بحث کر سکتے ہیں",
  cefrA1Description: "ابتدائی — بنیادی فقرے اور تاثرات",
  cefrA2Description: "بنیادی — آسان روزمرہ بات چیت",
  cefrB2Description: "اعلیٰ درمیانی — روانی سے بات چیت کر سکتے ہیں",

  currentLanguage: "موجودہ زبان",
  practiceLanguage: "مشق کی زبان",
  startSpeaking: "بولنا شروع کریں",
  stopListening: "سننا بند کریں",
  listeningNow: "اب سن رہا ہے",
  youSaid: "آپ نے کہا",
  conversationStarters: "گفتگو کے آغازکار",
  howToStartConversation: "گفتگو کیسے شروع کریں",
  tryThesePhrases: "یہ فقرے آزمائیں:",
  conversationStarter1: "ہیلو! آج آپ کیسے ہیں؟",
  conversationStarter2: "آج موسم کیسا ہے؟",
  conversationStarter3: "کیا آپ کوئی اچھا ریستوراں تجویز کر سکتے ہیں؟",
  conversationStarter4: "آپ کے مشاغل اور دلچسپیاں کیا ہیں؟",
  conversationStarter5: "اپنی پسندیدہ کتاب یا فلم کے بارے میں بتائیں۔",
  conversationStarter6: "آپ نے گزشتہ ہفتے کے آخر میں کیا کیا؟",
  conversationStarter7: "کل کے لیے آپ کے کیا منصوبے ہیں؟",
  conversationStarter8: "اسپینش/انگریزی میں... کیسے کہتے ہیں؟",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "ہیلو، آج آپ کیسے ہیں؟",
  "What's the weather like where you are?": "آپ کے یہاں موسم کیسا ہے؟",
  "Can you recommend a good restaurant?": "کیا آپ کوئی اچھا ریستوراں تجویز کر سکتے ہیں؟",
  "What are your hobbies and interests?": "آپ کے مشاغل اور دلچسپیاں کیا ہیں؟",
  "Tell me about your favorite book or movie.": "اپنی پسندیدہ کتاب یا فلم کے بارے میں بتائیں۔",
  "What did you do last weekend?": "آپ نے گزشتہ ہفتے کے آخر میں کیا کیا؟",
  "What are your plans for tomorrow?": "کل کے لیے آپ کے کیا منصوبے ہیں؟",
  "How do you say... in Spanish/English?": "اسپینش/انگریزی میں... کیسے کہتے ہیں؟",

  practiceWithVoiceChat: "آواز کی چیٹ سے مشق کریں",
  voiceChatTips: "اس ٹول کو اپنی بولنے اور سننے کی مہارت بہتر بنانے کے لیے استعمال کریں۔ یہاں کچھ تجاویز ہیں:",
  voiceTip1: "روزمرہ کے موضوعات کے بارے میں سوال پوچھیں",
  voiceTip2: "عام فقروں اور تاثرات کی مشق کریں",
  voiceTip3: "اپنے ارد گرد جو کچھ نظر آئے اس کی تفصیل بیان کریں",
  voiceTip4: "سفر یا کھانے جیسے مخصوص موضوعات کی vocabulary کی مشق کریں",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "اس ٹول کو اپنی بولنے اور سننے کی مہارت بہتر بنانے کے لیے استعمال کریں۔ یہاں کچھ تجاویز ہیں:",
  "Ask questions about everyday topics": "روزمرہ کے موضوعات کے بارے میں سوال پوچھیں",
  "Practice common phrases and expressions": "عام فقروں اور تاثرات کی مشق کریں",
  "Describe what you see around you": "اپنے ارد گرد جو کچھ نظر آئے اس کی تفصیل بیان کریں",
  "Practice vocabulary for specific topics like travel or food": "سفر یا کھانے جیسے مخصوص موضوعات کی vocabulary کی مشق کریں",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "ٹرانسکرپٹ دیکھنے کے لیے بولنا شروع کریں",
  clickMicrophoneToStartRecording: "ریکارڈنگ شروع کرنے کے لیے مائیکروفون پر کلک کریں",

  // Premium Voice Chat
  premiumVoiceChat: "پریمیم آواز چیٹ",
  premiumVoiceChatBenefits: "پریمیم آواز چیٹ کے فوائد",
  premiumVoiceChatDescription: "پریمیم اے آئی ٹیوٹر کے ساتھ قدرتی آواز گفتگو کے ذریعے {{practice}} کی مشق کریں! اے آئی گرامر، vocabulary، اور تلفظ بہتر بنانے میں مدد کرے گا۔",
  premiumVoiceNote: "پریمیم آواز چیٹ ہفتے میں 10 منٹ تک محدود ہے",
  premiumVoiceNoteWithReset: "پریمیم آواز چیٹ ہفتے میں 10 منٹ مشق کی اجازت دیتا ہے۔ وقت ہر پیر کو صبح 6 بجے (Central Time) ری سیٹ ہوتا ہے۔",
  benefitNaturalVoice: "ElevenLabs ٹیکنالوجی استعمال کرتے ہوئے انسان جیسی قدرتی آواز کا تعامل",
  benefitAccentPronunciation: "گہری سیکھائی کے لیے درست لہجہ اور تلفظ",
  benefitRegularPractice: "ہفتے میں 10 منٹ مشق، پیر کو صبح 6 بجے ری سیٹ",

  // Pronunciation practice
  pronunciationPractice: "تلفظ کی مشق",
  improvePronunciationSkillsWith: "ٹارگٹڈ مشق کے ساتھ تلفظ کی مہارت بہتر بنائیں",
  selectComplexityLevel: "پیچیدگی کی سطح منتخب کریں",
  chooseDifficultyLevelBasedOn: "اپنی زبان کی صلاحیت کی بنیاد پر دشواری کی سطح منتخب کریں",
  speechRate: "تقریر کی رفتار",
  selectLevelToStart: "مشق شروع کرنے کے لیے سطح منتخب کریں",
  startExercise: "مشق شروع کریں",
  pronunciationPracticeTips: "تلفظ کی مشق کی تجاویز",
  listenCarefullyTip: "بولنے سے پہلے احتیاط سے سنیں",
  payAttentionToStressTip: "stress اور intonation پر توجہ دیں",
  practiceDifficultSoundsTip: "مشکل آوازوں کو بار بار مشق کریں",
  recordYourselfTip: "اپنی آواز ریکارڈ کریں اور native speakers سے موازنہ کریں",
  bePatientTip: "صبر رکھیں — تلفظ کی بہتری میں وقت لگتا ہے",
  practiceExercise: "مشق",
  topic: "موضوع",
  listenToPhrase: "فقرہ سنیں",
  clickWordToHear: "سننے کے لیے لفظ پر کلک کریں",
  yourPronunciation: "آپ کا تلفظ",
  startRecording: "ریکارڈنگ شروع کریں",
  clickStartToRecord: "ریکارڈ کرنے کے لیے 'شروع' پر کلک کریں",
  tryAgain: "دوبارہ کوشش کریں",
  newPhrase: "نیا فقرہ",
  generatingExercise: "مشق تیار کی جا رہی ہے",
  generatingNewPhrase: "نیا فقرہ تیار کیا جا رہا ہے",
  levelDescription: "سطح کی تفصیل",
  failedToGeneratePhrase: "فقرہ تیار کرنے میں ناکام",
  noSpeechDetected: "کوئی آواز کا پتا نہیں چلا",
  pleaseTryAgain: "براہ کرم دوبارہ کوشش کریں",
  failedToAnalyzePronunciation: "تلفظ کا تجزیہ کرنے میں ناکام",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "تلفظ کی رائے",
  accuracyScore: "درستگی کا اسکور",
  intonationScore: "intonation کا اسکور",
  fluencyScore: "روانی کا اسکور",
  complexityScore: "پیچیدگی کا اسکور",
  wordAnalysis: "لفظ کا تجزیہ",
  phonemeAnalysis: "phoneme کا تجزیہ",
  overallFeedback: "مجموعی رائے",
  excellent: "بہترین",
  good: "اچھا",
  fair: "ٹھیک",
  needsImprovement: "بہتری کی ضرورت",

  // Additional UI elements
  processing: "عمل جاری ہے",
  stopRecording: "ریکارڈنگ بند کریں",
  listeningToYou: "آپ کو سن رہا ہے",
  realTimeTranscription: "حقیقی وقت کا ٹرانسکرپشن",
  yourTranscription: "آپ کا ٹرانسکرپشن",
  playing: "چل رہا ہے",

  // Complexity levels
  novice: "ابتدائی",
  intermediate: "درمیانی",
  advanced: "اعلیٰ",
  superior: "اعلیٰ ترین",
  noviceLevelDescription: "بنیادی اور مانوس موضوعات سنبھال سکتے ہیں",
  intermediateLevelDescription: "مانوس چیزوں پر بحث کر سکتے ہیں",
  advancedLevelDescription: "اعتماد کے ساتھ پیچیدہ موضوعات سنبھال سکتے ہیں",
  superiorLevelDescription: "تمام زبان کے کام انجام دے سکتے ہیں",
  noviceLevelShortDescription: "آسان فقرے",
  intermediateLevelShortDescription: "مانوس موضوعات",
  advancedLevelShortDescription: "پیچیدہ موضوعات",
  superiorLevelShortDescription: "تمام کام",

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
