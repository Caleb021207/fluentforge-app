
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "ভাষা শেখায় স্বাগতম",
  yourPersonalAICompanion: "আপনার ব্যক্তিগত AI সহায়ক",
  startPracticing: "অনুশীলন শুরূ করুন",
  practiceYourLanguageSkills: "আপনার ভাষা দক্ষতা অনুশীলন করুন",
  swipeUpToGetStarted: "শুরু করতে উপরে সোয়াইপ করুন",
  getStarted: "শুরু করুন",
  selectYourLanguagePreferences: "আপনার ভাষার পছন্দ নির্বাচন করুন",

  // Language selection
  selectNativeLanguage: "আপনার মাতৃভাষা নির্বাচন করুন",
  iSpeak: "আমি বলি",
  saveLanguagePreferences: "ভাষার পছন্দ সংরক্ষণ করুন",

  // Auth
  signIn: "সাইন ইন",
  signUp: "সাইন আপ",
  signInToContinue: "চালিয়ে যেতে সাইন ইন করুন",
  createAccountToGetStarted: "শুরু করতে একটি অ্যাকাউন্ট তৈরি করুন",
  email: "ইমেইল",
  password: "পাসওয়ার্ড",
  accessPasscode: "অ্যাক্সেস কোড",
  dontHaveAccount: "অ্যাকাউন্ট নেই?",
  alreadyHaveAccount: "আগেই অ্যাকাউন্ট আছে?",

  // Header
  loggedInAs: "সাইন ইন করেছেন",
  signedInAs: "সাইন ইন করেছেন",
  logout: "সাইন আউট",
  lightMode: "হালকা মোড",

  // Navigation
  home: "হোম",
  practice: "অনুশীলন",
  textPractice: "টেক্সট প্র্যাকটিস",
  unlimitedVoicePracticeNav: "আনলিমিটেড ভয়েস প্র্যাকটিস",
  pronunciationPracticeNav: "উচ্চারণ অনুশীলন",
  aiAnalysis: "AI বিশ্লেষণ",
  profile: "প্রোফাইল",
  settings: "সেটিংস",

  // Practice page
  englishPractice: "ইংরেজি অনুশীলন",
  startChatting: "চ্যাট শুরু করুন",
  startConversationIn: "{{language}} এ কথোপকথন শুরু করুন",
  fixGrammar: "ব্যাকরণ ঠিক করুন",
  correctGrammar: "ব্যাকরণ ঠিক করুন",
  clearConversation: "কথোপকথন মুছুন",
  startTextChat: "টেক্সট চ্যাট শুরু করুন",
  startTextChatting: "টেক্সট চ্যাট শুরু করুন",
  typeMessageBelow: "নিচে বার্তা লিখুন",
  typeMessageToPractice: "{{language}} অনুশীলনের জন্য বার্তা লিখুন...",
  send: "পাঠান",

  // Practice Guide
  practiceGuide: "{{language}} অনুশীলন গাইড",
  practiceGuideTitle: "{{language}} অনুশীলন গাইড",
  practiceGuideDescription: "{{language}} কার্যকর অনুশীলনের জন্য এখানে কিছু টিপস রয়েছে:",
  practiceGuideIntro: "{{language}} কার্যকর অনুশীলনের জন্য এখানে কিছু টিপস রয়েছে:",
  practiceGuideTip1: "সহজ হলেও সম্পূর্ণ বাক্য গঠনের চেষ্টা করুন।",
  practiceGuideTip2: "ভুল করতে ভয় পাবেন না — এটি শেখার অংশ!",
  practiceGuideTip3: "কিছু না বুঝলে ব্যাখ্যা চান।",
  practiceGuideTip4: "আপনার সম্প্রতি শেখা শব্দগুলি ব্যবহার করুন।",
  practiceGuideTip5: "আমাদের AI আপনার দক্ষতার স্তরের সাথে মানিয়ে নেবে।",

  // Practice tips - using t() keys
  practiceTip1: "সহজ হলেও সম্পূর্ণ বাক্য গঠনের চেষ্টা করুন।",
  practiceTip2: "ভুল করতে ভয় পাবেন না — এটি শেখার অংশ!",
  practiceTip3: "কিছু না বুঝলে ব্যাখ্যা চান।",
  practiceTip4: "আপনার সম্প্রতি শেখা শব্দগুলি ব্যবহার করুন।",
  practiceTip5: "আমাদের AI আপনার দক্ষতার স্তরের সাথে মানিয়ে নেবে।",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "সহজ হলেও সম্পূর্ণ বাক্য গঠনের চেষ্টা করুন।",
  "Don't worry about mistakes — they're part of learning!": "ভুল করতে ভয় পাবেন না — এটি শেখার অংশ!",
  "Ask for explanations if there's something you don't understand.": "কিছু না বুঝলে ব্যাখ্যা চান।",
  "Use words you've learned recently.": "আপনার সম্প্রতি শেখা শব্দগুলি ব্যবহার করুন।",
  "Our AI will adapt to your skill level and gradually help you improve.": "আমাদের AI আপনার দক্ষতার স্তরের সাথে মানিয়ে নিয়ে ধীরে ধীরে আপনাকে উন্নতি করতে সাহায্য করবে।",
  "Here are some tips to get the most out of your {{language}} practice:": "আপনার {{language}} অনুশীলন থেকে সর্বোচ্চ ফলাফল পেতে এখানে কিছু টিপস রয়েছে:",

  // Hint button
  suggestionResponses: "প্রস্তাবিত উত্তর",
  responseSuggestions: "প্রস্তাবিত উত্তর",
  clickPlayToHearPronunciation: "উচ্চারণ শুনতে প্লে ক্লিক করুন",
  startConversationForSuggestions: "পরামর্শের জন্য কথোপকথন শুরু করুন",
  startConversationToSeeSuggestions: "পরামর্শ দেখতে কথোপকথন শুরু করুন",
  getResponseSuggestions: "প্রতিক্রিয়া পরামর্শ পান",
  greetings: "শুভেচ্ছা",
  questions: "প্রশ্ন",
  error: "ত্রুটি",
  couldNotGenerateHints: "ইঙ্গিত তৈরি করতে পারেনি",
  failedToPlayAudio: "অডিও চালাতে ব্যর্থ",
  play: "চালান",

  // Voice chat
  unlimitedVoicePractice: "আনলিমিটেড ভয়েস প্র্যাকটিস",
  practiceDescription: "অনুশীলনের বিবরণ",
  aiModelInfo: "AI মডেল তথ্য: প্রাকৃতিক ভাষা বোঝার ও তৈরির জন্য OpenAI GPT-4o-mini, ভয়েস প্রতিক্রিয়ার জন্য ব্রাউজার speech synthesis।",
  practiceLevel: "অনুশীলনের স্তর",
  intermediatePracticeLevel: "মধ্যম — পরিচিত বিষয়ে আলোচনা করতে পারে",
  "Intermediate - Can discuss familiar topics": "মধ্যম — পরিচিত বিষয়ে আলোচনা করতে পারে",

  // CEFR Level Descriptions
  cefrB1Description: "মধ্যম — পরিচিত বিষয়ে আলোচনা করতে পারে",
  cefrA1Description: "প্রাথমিক — মৌলিক বাক্য ও অভিব্যক্তি",
  cefrA2Description: "মৌলিক — সহজ দৈনন্দিন কথোপকথন",
  cefrB2Description: "উচ্চ মধ্যম — সাবলীলভাবে যোগাযোগ করতে পারে",

  currentLanguage: "বর্তমান ভাষা",
  practiceLanguage: "অনুশীলনের ভাষা",
  startSpeaking: "কথা বলা শুরু করুন",
  stopListening: "শোনা বন্ধ করুন",
  listeningNow: "এখন শুনছে",
  youSaid: "আপনি বলেছেন",
  conversationStarters: "কথোপকথনের শুরু",
  howToStartConversation: "কথোপকথন কীভাবে শুরু করবেন",
  tryThesePhrases: "এই বাক্যগুলো চেষ্টা করুন:",
  conversationStarter1: "হ্যালো! আজ আপনি কেমন আছেন?",
  conversationStarter2: "আজ আবহাওয়া কেমন?",
  conversationStarter3: "আপনি কি একটি ভাল রেস্তোরাঁর সুপারিশ করতে পারেন?",
  conversationStarter4: "আপনার শখ এবং আগ্রহ কী?",
  conversationStarter5: "আপনার প্রিয় বই বা সিনেমা সম্পর্কে বলুন।",
  conversationStarter6: "গত সপ্তাহান্তে আপনি কী করেছিলেন?",
  conversationStarter7: "আগামীকালের জন্য আপনার পরিকল্পনা কী?",
  conversationStarter8: "স্প্যানিশ/ইংরেজিতে... কীভাবে বলেন?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "হ্যালো, আজ আপনি কেমন আছেন?",
  "What's the weather like where you are?": "আপনার সেখানে আবহাওয়া কেমন?",
  "Can you recommend a good restaurant?": "আপনি কি একটি ভাল রেস্তোরাঁর সুপারিশ করতে পারেন?",
  "What are your hobbies and interests?": "আপনার শখ এবং আগ্রহ কী?",
  "Tell me about your favorite book or movie.": "আপনার প্রিয় বই বা সিনেমা সম্পর্কে বলুন।",
  "What did you do last weekend?": "গত সপ্তাহান্তে আপনি কী করেছিলেন?",
  "What are your plans for tomorrow?": "আগামীকালের জন্য আপনার পরিকল্পনা কী?",
  "How do you say... in Spanish/English?": "স্প্যানিশ/ইংরেজিতে... কীভাবে বলেন?",

  practiceWithVoiceChat: "ভয়েস চ্যাটের সাথে অনুশীলন করুন",
  voiceChatTips: "আপনার কথা বলা এবং শোনার দক্ষতা উন্নত করতে এই টুলটি ব্যবহার করুন। এখানে কিছু টিপস রয়েছে:",
  voiceTip1: "দৈনন্দিন বিষয় নিয়ে প্রশ্ন করুন",
  voiceTip2: "সাধারণ বাক্য এবং অভিব্যক্তি অনুশীলন করুন",
  voiceTip3: "আপনার চারপাশে যা দেখছেন তা বর্ণনা করুন",
  voiceTip4: "ভ্রমণ বা খাবারের মতো নির্দিষ্ট বিষয়ের শব্দভাণ্ডার অনুশীলন করুন",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "আপনার কথা বলা এবং শোনার দক্ষতা উন্নত করতে এই টুলটি ব্যবহার করুন। এখানে কিছু টিপস রয়েছে:",
  "Ask questions about everyday topics": "দৈনন্দিন বিষয় নিয়ে প্রশ্ন করুন",
  "Practice common phrases and expressions": "সাধারণ বাক্য এবং অভিব্যক্তি অনুশীলন করুন",
  "Describe what you see around you": "আপনার চারপাশে যা দেখছেন তা বর্ণনা করুন",
  "Practice vocabulary for specific topics like travel or food": "ভ্রমণ বা খাবারের মতো নির্দিষ্ট বিষয়ের শব্দভাণ্ডার অনুশীলন করুন",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "ট্রান্সক্রিপ্ট দেখতে কথা বলা শুরু করুন",
  clickMicrophoneToStartRecording: "রেকর্ডিং শুরু করতে মাইক্রোফোনে ক্লিক করুন",

  // Premium Voice Chat
  premiumVoiceChat: "প্রিমিয়াম ভয়েস চ্যাট",
  premiumVoiceChatBenefits: "প্রিমিয়াম ভয়েস চ্যাটের সুবিধা",
  premiumVoiceChatDescription: "প্রিমিয়াম AI টিউটরের সাথে প্রাকৃতিক ভয়েস কথোপকথনের মাধ্যমে {{practice}} অনুশীলন করুন! AI ব্যাকরণ, শব্দভাণ্ডার এবং উচ্চারণ উন্নত করতে সাহায্য করবে।",
  premiumVoiceNote: "প্রিমিয়াম ভয়েস চ্যাট প্রতি সপ্তাহে 10 মিনিটে সীমাবদ্ধ",
  premiumVoiceNoteWithReset: "প্রিমিয়াম ভয়েস চ্যাট প্রতি সপ্তাহে 10 মিনিটের অনুশীলনের অনুমতি দেয়। সময় প্রতি সোমবার সকাল 6টায় (কেন্দ্রীয় সময়) রিসেট হয়।",
  benefitNaturalVoice: "ElevenLabs প্রযুক্তি ব্যবহার করে মানুষের মতো প্রাকৃতিক ভয়েস ইন্টারঅ্যাকশন",
  benefitAccentPronunciation: "গভীর শিক্ষার জন্য সঠিক উচ্চারণ এবং উচ্চারণভঙ্গি",
  benefitRegularPractice: "সপ্তাহে 10 মিনিট অনুশীলন, সোমবার সকাল 6টায় রিসেট",

  // Pronunciation practice
  pronunciationPractice: "উচ্চারণ অনুশীলন",
  improvePronunciationSkillsWith: "লক্ষ্যবদ্ধ অনুশীলনের সাথে উচ্চারণ দক্ষতা উন্নত করুন",
  selectComplexityLevel: "জটিলতার স্তর নির্বাচন করুন",
  chooseDifficultyLevelBasedOn: "আপনার ভাষা দক্ষতার উপর ভিত্তি করে কঠিনতার স্তর বেছে নিন",
  speechRate: "কথার হার",
  selectLevelToStart: "অনুশীলন শুরু করতে স্তর নির্বাচন করুন",
  startExercise: "অনুশীলন শুরু করুন",
  pronunciationPracticeTips: "উচ্চারণ অনুশীলনের টিপস",
  listenCarefullyTip: "কথা বলার আগে সাবধানে শুনুন",
  payAttentionToStressTip: "চাপ এবং স্বরভঙ্গিতে মনোযোগ দিন",
  practiceDifficultSoundsTip: "কঠিন শব্দগুলি বেশ কয়েকবার অনুশীলন করুন",
  recordYourselfTip: "নিজেকে রেকর্ড করুন এবং নেটিভ স্পিকারদের সাথে তুলনা করুন",
  bePatientTip: "ধৈর্য ধরুন — উচ্চারণ উন্নতি সময় নেয়",
  practiceExercise: "অনুশীলন",
  topic: "বিষয়",
  listenToPhrase: "বাক্য শুনুন",
  clickWordToHear: "শুনতে শব্দে ক্লিক করুন",
  yourPronunciation: "আপনার উচ্চারণ",
  startRecording: "রেকর্ডিং শুরু করুন",
  clickStartToRecord: "রেকর্ড করতে 'শুরু' ক্লিক করুন",
  tryAgain: "আবার চেষ্টা করুন",
  newPhrase: "নতুন বাক্য",
  generatingExercise: "অনুশীলন তৈরি হচ্ছে",
  generatingNewPhrase: "নতুন বাক্য তৈরি হচ্ছে",
  levelDescription: "স্তরের বিবরণ",
  failedToGeneratePhrase: "বাক্য তৈরি করতে ব্যর্থ",
  noSpeechDetected: "কোনো কথা শনাক্ত হয়নি",
  pleaseTryAgain: "অনুগ্রহ করে আবার চেষ্টা করুন",
  failedToAnalyzePronunciation: "উচ্চারণ বিশ্লেষণ করতে ব্যর্থ",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "উচ্চারণ প্রতিক্রিয়া",
  accuracyScore: "নির্ভুলতার স্কোর",
  intonationScore: "স্বরভঙ্গির স্কোর",
  fluencyScore: "সাবলীলতার স্কোর",
  complexityScore: "জটিলতার স্কোর",
  wordAnalysis: "শব্দ বিশ্লেষণ",
  phonemeAnalysis: "ফোনিম বিশ্লেষণ",
  overallFeedback: "সামগ্রিক প্রতিক্রিয়া",
  excellent: "চমৎকার",
  good: "ভাল",
  fair: "মোটামুটি",
  needsImprovement: "উন্নতি প্রয়োজন",

  // Additional UI elements
  processing: "প্রক্রিয়াকরণ",
  stopRecording: "রেকর্ডিং বন্ধ করুন",
  listeningToYou: "আপনার কথা শুনছে",
  realTimeTranscription: "রিয়েল টাইম ট্রান্সক্রিপশন",
  yourTranscription: "আপনার ট্রান্সক্রিপশন",
  playing: "চালু হচ্ছে",

  // Complexity levels
  novice: "শিক্ষানবিস",
  intermediate: "মধ্যম",
  advanced: "উন্নত",
  superior: "উচ্চতর",
  noviceLevelDescription: "মৌলিক এবং পরিচিত বিষয়গুলি পরিচালনা করতে পারে",
  intermediateLevelDescription: "পরিচিত বিষয়গুলি নিয়ে আলোচনা করতে পারে",
  advancedLevelDescription: "আত্মবিশ্বাসের সাথে জটিল বিষয়গুলি পরিচালনা করতে পারে",
  superiorLevelDescription: "সমস্ত ভাষা ফাংশন সম্পাদন করতে পারে",
  noviceLevelShortDescription: "সহজ বাক্য",
  intermediateLevelShortDescription: "পরিচিত বিষয়",
  advancedLevelShortDescription: "জটিল বিষয়",
  superiorLevelShortDescription: "সব ফাংশন",

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
