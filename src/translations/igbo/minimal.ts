
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "Nnọọ na mmụta asụsụ",
  yourPersonalAICompanion: "Onye enyemaka AI gị maka ịmụ asụsụ",
  startPracticing: "Malite imegharị",
  practiceYourLanguageSkills: "Mee ihe ọmụma asụsụ gị",
  swipeUpToGetStarted: "Gbaa aka elu ka ị bido",
  getStarted: "Bido",
  selectYourLanguagePreferences: "Họrọ mmasị asụsụ gị",

  // Language selection
  selectNativeLanguage: "Họrọ asụsụ nne na nna gị",
  iSpeak: "Ekwuru m",
  saveLanguagePreferences: "Chekwaa nhọrọ asụsụ",

  // Auth
  signIn: "Banye",
  signUp: "Debanye aha",
  signInToContinue: "Banye ka ị gaa n'ihu",
  createAccountToGetStarted: "Mepụta akaụntụ ka ị bido",
  email: "Email",
  password: "Okwuntughe",
  accessPasscode: "Koodu ntinye",
  dontHaveAccount: "Ị nweghị akaụntụ?",
  alreadyHaveAccount: "Ị nwere akaụntụ?",

  // Header
  loggedInAs: "Abanye dị ka",
  signedInAs: "Abanye dị ka",
  logout: "Pụọ",
  lightMode: "Ọnọdụ ìhè",

  // Navigation
  home: "Ụlọ",
  practice: "Omume",
  textPractice: "Mmegide ederede",
  unlimitedVoicePracticeNav: "Omume olu na-enweghị oke",
  pronunciationPracticeNav: "Omume nkọwa asụsụ",
  aiAnalysis: "Nyocha AI",
  profile: "Nkọwapụta",
  settings: "Ntọala",

  // Practice page
  englishPractice: "Omume Bekee",
  startChatting: "Bido mkparịta ụka",
  startConversationIn: "Bido mkparịta ụka n'asụsụ {{language}}",
  fixGrammar: "Dozie asụsụ",
  correctGrammar: "Dozie asụsụ",
  clearConversation: "Hichapụ mkparịta ụka",
  startTextChat: "Bido mkparịta ụka ederede",
  startTextChatting: "Bido mkparịta ụka ederede",
  typeMessageBelow: "Tinye ozi gị n'okpuru",
  typeMessageToPractice: "Tinye ozi iji mee omumu n'asụsụ {{language}}...",
  send: "Zipu",

  // Practice Guide
  practiceGuide: "Ntuziaka omume {{language}}",
  practiceGuideTitle: "Ntuziaka omume {{language}}",
  practiceGuideDescription: "Ndụmọdụ bara uru maka omume {{language}} dị irè:",
  practiceGuideIntro: "Ndụmọdụ bara uru maka omume {{language}} dị irè:",
  practiceGuideTip1: "Gbalịa ịmepụta ahịrịokwu zuru ezu, ọ bụrụ na ha dị mfe.",
  practiceGuideTip2: "Echegbula onwe gị maka njehie - ha bụ akụkụ nke mmụta!",
  practiceGuideTip3: "Rịọ ka akọwara gị ma ọ bụrụ na enwere ihe ị na-aghọtaghị.",
  practiceGuideTip4: "Jiri okwu ndị ị mụtara na nso nso a.",
  practiceGuideTip5: "AI anyị ga-agbanwe ka ọ dabara na ọkwa nkà gị.",

  // Practice tips - using t() keys
  practiceTip1: "Gbalịa ịmepụta ahịrịokwu zuru ezu, ọ bụrụ na ha dị mfe.",
  practiceTip2: "Echegbula onwe gị maka njehie - ha bụ akụkụ nke mmụta!",
  practiceTip3: "Rịọ ka akọwara gị ma ọ bụrụ na enwere ihe ị na-aghọtaghị.",
  practiceTip4: "Jiri okwu ndị ị mụtara na nso nso a.",
  practiceTip5: "AI anyị ga-agbanwe ka ọ dabara na ọkwa nkà gị.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "Gbalịa ịmepụta ahịrịokwu zuru ezu, ọ bụrụ na ha dị mfe.",
  "Don't worry about mistakes — they're part of learning!": "Echegbula onwe gị maka njehie — ha bụ akụkụ nke mmụta!",
  "Ask for explanations if there's something you don't understand.": "Rịọ ka akọwara gị ma ọ bụrụ na enwere ihe ị na-aghọtaghị.",
  "Use words you've learned recently.": "Jiri okwu ndị ị mụtara na nso nso a.",
  "Our AI will adapt to your skill level and gradually help you improve.": "AI anyị ga-agbanwe ka ọ dabara na ọkwa nkà gị ma nyere gị aka nwayọọ nwayọọ ka ị ka mma.",
  "Here are some tips to get the most out of your {{language}} practice:": "Nke a bụ ndụmọdụ ụfọdụ iji nweta ọtụtụ site na omume {{language}} gị:",

  // Hint button
  suggestionResponses: "Azịza tụrụ aro",
  responseSuggestions: "Aro azịza",
  clickPlayToHearPronunciation: "Pịa igwu egwu ka ị nụ nkọwa okwu",
  startConversationForSuggestions: "Bido mkparịta ụka ka ị hụ aro",
  startConversationToSeeSuggestions: "Bido mkparịta ụka ka ị hụ aro",
  getResponseSuggestions: "Nweta aro azịza",
  greetings: "Ndewo",
  questions: "Ajụjụ",
  error: "Njehie",
  couldNotGenerateHints: "Enweghị ike ịmepụta ndụmọdụ",
  failedToPlayAudio: "Enweghị ike ịkpọ olu",
  play: "Kpọọ",

  // Voice chat
  unlimitedVoicePractice: "Omume olu na-enweghị oke",
  practiceDescription: "Nkọwa nke omumu",
  aiModelInfo: "Ozi Nlereanya AI: OpenAI GPT-4o-mini maka nghọta na imepụta asụsụ eke, TTS nchọgharị maka azịza olu.",
  practiceLevel: "Ọkwa omumu",
  intermediatePracticeLevel: "Ọkara — nwere ike ikwu maka isiokwu ama ama",
  "Intermediate - Can discuss familiar topics": "Ọkara — nwere ike ikwu maka isiokwu ama ama",

  // CEFR Level Descriptions
  cefrB1Description: "Ọkara — nwere ike ikwu maka isiokwu ama ama",
  cefrA1Description: "Mbido — ahịrịokwu na nkwupụta ndị bụ isi",
  cefrA2Description: "Isi — mkparịta ụka dị mfe kwa ụbọchị",
  cefrB2Description: "Ọkara dị elu — nwere ike ikwurịta okwu ngwa ngwa",

  currentLanguage: "Asụsụ ugbu a",
  practiceLanguage: "Asụsụ omumu",
  startSpeaking: "Bido ikwu okwu",
  stopListening: "Kwụsị ige ntị",
  listeningNow: "Na-ege ntị ugbu a",
  youSaid: "Ị kwuru",
  conversationStarters: "Mmụta mkparịta ụka",
  howToStartConversation: "Otu esi amalite mkparịta ụka",
  tryThesePhrases: "Nwaa okwu ndị a:",
  conversationStarter1: "Kedu! Kedu ka ị mere taa?",
  conversationStarter2: "Kedu ka ihu igwe dị ebe ị nọ?",
  conversationStarter3: "Ị nwere ike ịkwado ezi ụlọ oriri?",
  conversationStarter4: "Kedu ihe omume ntụrụndụ na mmasị gị?",
  conversationStarter5: "Gwa m maka akwụkwọ ma ọ bụ fim kacha amasị gị.",
  conversationStarter6: "Kedu ihe i mere izu ụka gara aga?",
  conversationStarter7: "Kedu atụmatụ gị maka echi?",
  conversationStarter8: "Kedu ka esi kwuo... n'asụsụ Mkpụrụedemede/Bekee?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "Kedu, kedu ka ị mere taa?",
  "What's the weather like where you are?": "Kedu ka ihu igwe dị ebe ị nọ?",
  "Can you recommend a good restaurant?": "Ị nwere ike ịkwado ezi ụlọ oriri?",
  "What are your hobbies and interests?": "Kedu ihe omume ntụrụndụ na mmasị gị?",
  "Tell me about your favorite book or movie.": "Gwa m maka akwụkwọ ma ọ bụ fim kacha amasị gị.",
  "What did you do last weekend?": "Kedu ihe i mere izu ụka gara aga?",
  "What are your plans for tomorrow?": "Kedu atụmatụ gị maka echi?",
  "How do you say... in Spanish/English?": "Kedu ka esi kwuo... n'asụsụ Mkpụrụedemede/Bekee?",

  practiceWithVoiceChat: "Mee omumu site na mkparịta ụka olu",
  voiceChatTips: "Jiri ngwá ọrụ a ka ị kwalite nkà ikwu okwu na ige ntị gị. Nke a bụ ndụmọdụ ụfọdụ:",
  voiceTip1: "Jụọ ajụjụ gbasara isiokwu kwa ụbọchị",
  voiceTip2: "Mee omumu okwu na nkwupụta a na-ahụkarị",
  voiceTip3: "Kọwaa ihe ị na-ahụ gburugburu gị",
  voiceTip4: "Mee omumu okwu maka isiokwu ụfọdụ dị ka njem ma ọ bụ nri",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "Jiri ngwá ọrụ a ka ị kwalite nkà ikwu okwu na ige ntị gị. Nke a bụ ndụmọdụ ụfọdụ:",
  "Ask questions about everyday topics": "Jụọ ajụjụ gbasara isiokwu kwa ụbọchị",
  "Practice common phrases and expressions": "Mee omumu okwu na nkwupụta a na-ahụkarị",
  "Describe what you see around you": "Kọwaa ihe ị na-ahụ gburugburu gị",
  "Practice vocabulary for specific topics like travel or food": "Mee omumu okwu maka isiokwu ụfọdụ dị ka njem ma ọ bụ nri",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "Bido ikwu okwu ka ị hụ ndekọ",
  clickMicrophoneToStartRecording: "Pịa igwe okwu ka ị bido idekọ",

  // Premium Voice Chat
  premiumVoiceChat: "Mkparịta Ụka Olu Premium",
  premiumVoiceChatBenefits: "Uru Mkparịta Ụka Olu Premium",
  premiumVoiceChatDescription: "Mee omumu {{practice}} na mkparịta ụka olu eke na onye nkuzi AI premium! AI ga-enyere gị aka imee ka ụtọ asụsụ, okwu na nkọwa okwu gị ka mma.",
  premiumVoiceNote: "Mkparịta Ụka Olu Premium nwere oke nkeji 10 kwa izu",
  premiumVoiceNoteWithReset: "Mkparịta Ụka Olu Premium na-enye ohere omumu nkeji 10 kwa izu. Oge na-amalitegharị kwa Mọnde n'elekere 6:00 nke ụtụtụ (Central Time).",
  benefitNaturalVoice: "Mmekọrịta olu eke dị ka mmadụ site na teknụzụ ElevenLabs",
  benefitAccentPronunciation: "Nkọwa okwu na ụda olu ziri ezi maka mmụta miri emi",
  benefitRegularPractice: "Omumu nkeji 10 kwa izu, na-amalitegharị Mọnde n'elekere 6:00 nke ụtụtụ",

  // Pronunciation practice
  pronunciationPractice: "Omume nkọwa okwu",
  improvePronunciationSkillsWith: "Mee ka nkọwa okwu gị ka mma site na mmemme ebumnobi",
  selectComplexityLevel: "Họrọ ọkwa mgbagwoju anya",
  chooseDifficultyLevelBasedOn: "Họrọ ọkwa isi ike dabere na nkà asụsụ gị",
  speechRate: "Ọsọ okwu",
  selectLevelToStart: "Họrọ ọkwa ka ị bido mmemme",
  startExercise: "Bido mmemme",
  pronunciationPracticeTips: "Ndụmọdụ maka omume nkọwa okwu",
  listenCarefullyTip: "Gee ntị nke ọma tupu ị kwuo okwu",
  payAttentionToStressTip: "Leba anya na nrụgide na ụda olu",
  practiceDifficultSoundsTip: "Mee omumu ụda ndị siri ike ugboro ugboro",
  recordYourselfTip: "Dekọọ onwe gị ma jiri ya tụnyere ndị na-asụ asụsụ ahụ eke",
  bePatientTip: "Nwee ndidi — imeziwanye nkọwa okwu na-ewe oge",
  practiceExercise: "Mmemme omume",
  topic: "Isiokwu",
  listenToPhrase: "Gee ntị na okwu ahụ",
  clickWordToHear: "Pịa okwu ka ị nụ ya",
  yourPronunciation: "Nkọwa okwu gị",
  startRecording: "Bido ndekọ",
  clickStartToRecord: "Pịa 'Bido' ka ị dekọọ",
  tryAgain: "Nwaa ọzọ",
  newPhrase: "Okwu ọhụrụ",
  generatingExercise: "Na-emepụta mmemme",
  generatingNewPhrase: "Na-emepụta okwu ọhụrụ",
  levelDescription: "Nkọwa ọkwa",
  failedToGeneratePhrase: "Enweghị ike ịmepụta okwu",
  noSpeechDetected: "Enweghị okwu a nụrụ",
  pleaseTryAgain: "Biko nwaa ọzọ",
  failedToAnalyzePronunciation: "Enweghị ike nyochaa nkọwa okwu",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "Nzaghachi nkọwa okwu",
  accuracyScore: "Akara izi ezi",
  intonationScore: "Akara ụda olu",
  fluencyScore: "Akara ịsụ asụsụ ọfụma",
  complexityScore: "Akara mgbagwoju anya",
  wordAnalysis: "Nyocha okwu",
  phonemeAnalysis: "Nyocha phoneme",
  overallFeedback: "Nzaghachi izugbe",
  excellent: "Ọmarịcha",
  good: "Ọ dị mma",
  fair: "Ọ dị mma ma ọlị",
  needsImprovement: "Chọrọ mmelite",

  // Additional UI elements
  processing: "Na-ahazi",
  stopRecording: "Kwụsị ndekọ",
  listeningToYou: "Na-ege gị ntị",
  realTimeTranscription: "Ndekọ oge n'ezie",
  yourTranscription: "Ndekọ gị",
  playing: "Na-egwu",

  // Complexity levels
  novice: "Mbido",
  intermediate: "Ọkara",
  advanced: "Elu",
  superior: "Kachasị elu",
  noviceLevelDescription: "Nwere ike ijikwa isiokwu ndị bụ isi na nke ama",
  intermediateLevelDescription: "Nwere ike ikwu maka isiokwu ama ama",
  advancedLevelDescription: "Nwere ike ijikwa isiokwu mgbagwoju anya na ntụkwasị obi",
  superiorLevelDescription: "Nwere ike ime ọrụ asụsụ niile",
  noviceLevelShortDescription: "Ahịrịokwu dị mfe",
  intermediateLevelShortDescription: "Isiokwu ama ama",
  advancedLevelShortDescription: "Isiokwu mgbagwoju anya",
  superiorLevelShortDescription: "Ọrụ niile",

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
