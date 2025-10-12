
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "kuwapa maneno sauti",
  yourPersonalAICompanion: "Msaidizi wako wa AI binafsi",
  startPracticing: "Anza Kujifunza",
  practiceYourLanguageSkills: "Jifunze ujuzi wako wa lugha",
  swipeUpToGetStarted: "Telezesha juu kuanza",
  getStarted: "Anza",
  selectYourLanguagePreferences: "Chagua mapendeleo yako ya lugha",

  // Language selection
  selectNativeLanguage: "Chagua lugha yako ya asili",
  iSpeak: "Ninaongea",
  saveLanguagePreferences: "Hifadhi mapendeleo ya lugha",

  // Auth
  signIn: "Ingia",
  signUp: "Jisajili",
  signInToContinue: "Ingia kuendelea",
  createAccountToGetStarted: "Unda akaunti kuanza",
  email: "Barua pepe",
  password: "Nenosiri",
  accessPasscode: "Nambari ya ufikiaji",
  dontHaveAccount: "Huna akaunti?",
  alreadyHaveAccount: "Tayari una akaunti?",

  // Header
  loggedInAs: "Umeingia kama",
  signedInAs: "Umeingia kama",
  logout: "Toka",
  lightMode: "Hali ya mwanga",

  // Navigation
  home: "Nyumbani",
  practice: "Mazoezi",
  textPractice: "Mazoezi ya maandishi",
  unlimitedVoicePracticeNav: "Mazoezi ya sauti yasiyo na kikomo",
  pronunciationPracticeNav: "Mazoezi ya matamshi",
  aiAnalysis: "Uchambuzi wa AI",
  profile: "Wasifu",
  settings: "Mipangilio",

  // Practice page
  englishPractice: "Mazoezi ya Kiingereza",
  startChatting: "Anza mazungumzo",
  startConversationIn: "Anza mazungumzo kwa {{language}}",
  fixGrammar: "Sahihisha sarufi",
  correctGrammar: "Sahihisha sarufi",
  clearConversation: "Futa mazungumzo",
  startTextChat: "Anza mazungumzo ya maandishi",
  startTextChatting: "Anza mazungumzo ya maandishi",
  typeMessageBelow: "Andika ujumbe hapa chini",
  typeMessageToPractice: "Andika ujumbe ili kufanya mazoezi ya {{language}}...",
  send: "Tuma",

  // Practice Guide
  practiceGuide: "Mwongozo wa Mazoezi ya {{language}}",
  practiceGuideTitle: "Mwongozo wa Mazoezi ya {{language}}",
  practiceGuideDescription: "Hapa kuna vidokezo muhimu vya mazoezi bora ya {{language}}:",
  practiceGuideIntro: "Hapa kuna vidokezo muhimu vya mazoezi bora ya {{language}}:",
  practiceGuideTip1: "Jaribu kutumia sentensi kamili, hata kama ni rahisi.",
  practiceGuideTip2: "Usiogope makosa — ni sehemu ya kujifunza!",
  practiceGuideTip3: "Uliza maelezo ikiwa kuna kitu husielewi.",
  practiceGuideTip4: "Tumia maneno mapya uliyoyajifunza hivi karibuni.",
  practiceGuideTip5: "AI yetu itajibu kulingana na kiwango chako.",

  // Practice tips - using t() keys
  practiceTip1: "Jaribu kutumia sentensi kamili, hata kama ni rahisi.",
  practiceTip2: "Usiogope makosa — ni sehemu ya kujifunza!",
  practiceTip3: "Uliza maelezo ikiwa kuna kitu husielewi.",
  practiceTip4: "Tumia maneno mapya uliyoyajifunza hivi karibuni.",
  practiceTip5: "AI yetu itajibu kulingana na kiwango chako.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "Jaribu kutumia sentensi kamili, hata kama ni rahisi.",
  "Don't worry about mistakes — they're part of learning!": "Usiogope makosa — ni sehemu ya kujifunza!",
  "Ask for explanations if there's something you don't understand.": "Uliza maelezo ikiwa kuna kitu husielewi.",
  "Use words you've learned recently.": "Tumia maneno mapya uliyoyajifunza hivi karibuni.",
  "Our AI will adapt to your skill level and gradually help you improve.": "AI yetu itajibu kulingana na kiwango chako na kukusaidia kuboresha polepole.",
  "Here are some tips to get the most out of your {{language}} practice:": "Hapa kuna vidokezo vya kupata faida zaidi kutoka mazoezi yako ya {{language}}:",

  // Hint button
  suggestionResponses: "Majibu yaliyopendekezwa",
  responseSuggestions: "Majibu yaliyopendekezwa",
  clickPlayToHearPronunciation: "Bonyeza cheza kusikia matamshi",
  startConversationForSuggestions: "Anza mazungumzo kupata mapendekezo",
  startConversationToSeeSuggestions: "Anza mazungumzo kuona mapendekezo",
  getResponseSuggestions: "Pata mapendekezo ya majibu",
  greetings: "Salamu",
  questions: "Maswali",
  error: "Hitilafu",
  couldNotGenerateHints: "Haikuweza kutengeneza vidokezo",
  failedToPlayAudio: "Imeshindwa kucheza sauti",
  play: "Cheza",

  // Voice chat
  unlimitedVoicePractice: "Mazoezi ya sauti yasiyo na kikomo",
  practiceDescription: "Maelezo ya mazoezi",
  aiModelInfo: "Maelezo ya mfano wa AI: OpenAI GPT-4o-mini kwa uelewa na uundaji wa lugha asilia, TTS ya kivinjari kwa majibu ya sauti.",
  practiceLevel: "Kiwango cha mazoezi",
  intermediatePracticeLevel: "Kati — Anaweza kuzungumza kuhusu mada zinazojulikana",
  "Intermediate - Can discuss familiar topics": "Kati — Anaweza kuzungumza kuhusu mada zinazojulikana",

  // CEFR Level Descriptions
  cefrB1Description: "Kati — Anaweza kuzungumza kuhusu mada zinazojulikana",
  cefrA1Description: "Mwanzo — Misemo ya msingi na kauli",
  cefrA2Description: "Msingi — Mazungumzo rahisi ya kila siku",
  cefrB2Description: "Kati Juu — Anaweza kuzungumza kwa urahisi",

  currentLanguage: "Lugha ya sasa",
  practiceLanguage: "Lugha ya mazoezi",
  startSpeaking: "Anza kuzungumza",
  stopListening: "Acha kusikiliza",
  listeningNow: "Inasikiliza sasa",
  youSaid: "Ulisema",
  conversationStarters: "Vianzishi vya mazungumzo",
  howToStartConversation: "Jinsi ya kuanza mazungumzo",
  tryThesePhrases: "Jaribu misemo hii:",
  conversationStarter1: "Habari! Unaendeleaje leo?",
  conversationStarter2: "Hali ya hewa ikoje mahali ulipo?",
  conversationStarter3: "Unaweza kupendekeza mkahawa mzuri?",
  conversationStarter4: "Shughuli zako za burudani ni zipi?",
  conversationStarter5: "Niambie kuhusu kitabu au filamu unayopenda.",
  conversationStarter6: "Ulifanya nini wikendi iliyopita?",
  conversationStarter7: "Mipango yako ya kesho ni nini?",
  conversationStarter8: "Unasemaje... kwa Kihispania/Kiingereza?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "Habari, unaendeleaje leo?",
  "What's the weather like where you are?": "Hali ya hewa ikoje mahali ulipo?",
  "Can you recommend a good restaurant?": "Unaweza kupendekeza mkahawa mzuri?",
  "What are your hobbies and interests?": "Shughuli zako za burudani ni zipi?",
  "Tell me about your favorite book or movie.": "Niambie kuhusu kitabu au filamu unayopenda.",
  "What did you do last weekend?": "Ulifanya nini wikendi iliyopita?",
  "What are your plans for tomorrow?": "Mipango yako ya kesho ni nini?",
  "How do you say... in Spanish/English?": "Unasemaje... kwa Kihispania/Kiingereza?",

  practiceWithVoiceChat: "Fanya mazoezi kwa mazungumzo ya sauti",
  voiceChatTips: "Tumia kifaa hiki kuboresha ustadi wako wa kuzungumza na kusikiliza. Hapa kuna vidokezo:",
  voiceTip1: "Uliza maswali kuhusu mada za kila siku",
  voiceTip2: "Fanya mazoezi ya misemo na maneno ya kawaida",
  voiceTip3: "Eleza vitu unavyoviona karibu nawe",
  voiceTip4: "Fanya mazoezi ya msamiati wa mada mahususi kama safari au chakula",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "Tumia kifaa hiki kuboresha ustadi wako wa kuzungumza na kusikiliza. Hapa kuna vidokezo:",
  "Ask questions about everyday topics": "Uliza maswali kuhusu mada za kila siku",
  "Practice common phrases and expressions": "Fanya mazoezi ya misemo na maneno ya kawaida",
  "Describe what you see around you": "Eleza vitu unavyoviona karibu nawe",
  "Practice vocabulary for specific topics like travel or food": "Fanya mazoezi ya msamiati wa mada mahususi kama safari au chakula",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "Anza kuzungumza kuona maandishi",
  clickMicrophoneToStartRecording: "Bonyeza maikrofoni kuanza kurekodi",

  // Premium Voice Chat
  premiumVoiceChat: "Mazungumzo ya Sauti ya Bei Maalum",
  premiumVoiceChatBenefits: "Faida za Mazungumzo ya Sauti ya Bei Maalum",
  premiumVoiceChatDescription: "Fanya mazoezi ya {{practice}} kwa mazungumzo ya sauti ya asili na mwalimu wa AI wa bei maalum! AI itasaidia kuboresha sarufi, msamiati, na matamshi.",
  premiumVoiceNote: "Mazungumzo ya sauti ya bei maalum yamepunguzwa hadi dakika 10 kwa wiki",
  premiumVoiceNoteWithReset: "Mazungumzo ya sauti ya bei maalum yanaruhusu mazoezi ya dakika 10 kwa wiki. Muda huwekwa upya kila Jumatatu saa 6 asubuhi (Wakati wa Kati).",
  benefitNaturalVoice: "Mazungumzo ya sauti ya asili kama binadamu kutumia teknolojia ya ElevenLabs",
  benefitAccentPronunciation: "Lafudhi na matamshi sahihi kwa kujifunza kwa kina",
  benefitRegularPractice: "Mazoezi ya dakika 10 kwa wiki, yanawekwa upya Jumatatu saa 6 asubuhi",

  // Pronunciation practice
  pronunciationPractice: "Mazoezi ya matamshi",
  improvePronunciationSkillsWith: "Boresha ustadi wa matamshi kwa mazoezi yaliyolengwa",
  selectComplexityLevel: "Chagua kiwango cha uchangamano",
  chooseDifficultyLevelBasedOn: "Chagua kiwango cha ugumu kulingana na uwezo wako wa lugha",
  speechRate: "Kasi ya hotuba",
  selectLevelToStart: "Chagua kiwango kuanza mazoezi",
  startExercise: "Anza zoezi",
  pronunciationPracticeTips: "Vidokezo vya mazoezi ya matamshi",
  listenCarefullyTip: "Sikiliza kwa makini kabla ya kuzungumza",
  payAttentionToStressTip: "Zingatia mkazo na mdundo",
  practiceDifficultSoundsTip: "Fanya mazoezi ya sauti ngumu mara kadhaa",
  recordYourselfTip: "Jirekodi na linganisha na wazungumzaji wa asili",
  bePatientTip: "Kuwa na subira — kuboresha matamshi kunachukua muda",
  practiceExercise: "Zoezi",
  topic: "Mada",
  listenToPhrase: "Sikiliza sentensi",
  clickWordToHear: "Bonyeza neno kusikia",
  yourPronunciation: "Matamshi yako",
  startRecording: "Anza kurekodi",
  clickStartToRecord: "Bonyeza 'Anza' kurekodi",
  tryAgain: "Jaribu tena",
  newPhrase: "Sentensi mpya",
  generatingExercise: "Inatengeneza zoezi",
  generatingNewPhrase: "Inatengeneza sentensi mpya",
  levelDescription: "Maelezo ya kiwango",
  failedToGeneratePhrase: "Imeshindwa kutengeneza sentensi",
  noSpeechDetected: "Hakuna hotuba iliyogunduliwa",
  pleaseTryAgain: "Tafadhali jaribu tena",
  failedToAnalyzePronunciation: "Imeshindwa kuchambua matamshi",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "Maoni ya matamshi",
  accuracyScore: "Alama za usahihi",
  intonationScore: "Alama za mdundo",
  fluencyScore: "Alama za ulaini",
  complexityScore: "Alama za uchangamano",
  wordAnalysis: "Uchambuzi wa neno",
  phonemeAnalysis: "Uchambuzi wa fonemu",
  overallFeedback: "Maoni ya jumla",
  excellent: "Bora sana",
  good: "Nzuri",
  fair: "Wastani",
  needsImprovement: "Inahitaji kuboresha",

  // Additional UI elements
  processing: "Inachakata",
  stopRecording: "Acha kurekodi",
  listeningToYou: "Inakusikiliza",
  realTimeTranscription: "Uandishi wa wakati halisi",
  yourTranscription: "Uandishi wako",
  playing: "Inacheza",

  // Complexity levels
  novice: "Mwanzo",
  intermediate: "Kati",
  advanced: "Juu",
  superior: "Bora",
  noviceLevelDescription: "Anaweza kushughulikia mada za msingi na zinazojulikana",
  intermediateLevelDescription: "Anaweza kuzungumza kuhusu vitu vinavyojulikana",
  advancedLevelDescription: "Anaweza kushughulikia mada changamano kwa ujasiri",
  superiorLevelDescription: "Anaweza kutumia lugha kwa kazi zote",
  noviceLevelShortDescription: "Sentensi rahisi",
  intermediateLevelShortDescription: "Mada zinazojulikana",
  advancedLevelShortDescription: "Mada changamano",
  superiorLevelShortDescription: "Kazi zote",

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
