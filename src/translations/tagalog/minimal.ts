
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "Maligayang pagdating sa pagkatuto ng wika",
  yourPersonalAICompanion: "Ang iyong personal na AI na katuwang sa pag-aaral ng wika",
  startPracticing: "Magsimula ng Pagsasanay",
  practiceYourLanguageSkills: "Magsanay ng iyong mga kasanayan sa wika",
  swipeUpToGetStarted: "Mag-swipe pataas upang magsimula",
  getStarted: "Magsimula",
  selectYourLanguagePreferences: "Piliin ang inyong mga kagustuhan sa wika",

  // Language selection
  selectNativeLanguage: "Piliin ang inyong katutubong wika",
  iSpeak: "Ako ay nagsasalita ng",
  saveLanguagePreferences: "I-save ang mga kagustuhan sa wika",

  // Auth
  signIn: "Mag-sign in",
  signUp: "Mag-sign up",
  signInToContinue: "Mag-sign in upang magpatuloy",
  createAccountToGetStarted: "Gumawa ng account upang magsimula",
  email: "Email",
  password: "Password",
  accessPasscode: "Access code",
  dontHaveAccount: "Wala ka pang account?",
  alreadyHaveAccount: "May account ka na?",

  // Header
  loggedInAs: "Naka-sign in bilang",
  signedInAs: "Naka-sign in bilang",
  logout: "Mag-sign out",
  lightMode: "Light mode",

  // Navigation
  home: "Home",
  practice: "Pagsasanay",
  textPractice: "Pagsasanay sa Teksto",
  unlimitedVoicePracticeNav: "Walang limitasyong pagsasanay sa boses",
  pronunciationPracticeNav: "Pagsasanay sa Pagbigkas",
  aiAnalysis: "AI Analysis",
  profile: "Profile",
  settings: "Settings",

  // Practice page
  englishPractice: "Pagsasanay sa Ingles",
  startChatting: "Simulan ang usapan",
  startConversationIn: "Simulan ang pag-uusap sa wikang {{language}}",
  fixGrammar: "Ayusin ang gramatika",
  correctGrammar: "Ayusin ang gramatika",
  clearConversation: "I-clear ang usapan",
  startTextChat: "Simulan ang text chat",
  startTextChatting: "Simulan ang text chat",
  typeMessageBelow: "I-type ang mensahe sa ibaba",
  typeMessageToPractice: "Mag-type ng mensahe upang magsanay sa {{language}}...",
  send: "Ipadala",

  // Practice Guide
  practiceGuide: "Gabay sa pagsasanay sa {{language}}",
  practiceGuideTitle: "Gabay sa pagsasanay sa {{language}}",
  practiceGuideDescription: "Ilang kapaki-pakinabang na tips para sa epektibong pagsasanay sa {{language}}:",
  practiceGuideIntro: "Ilang kapaki-pakinabang na tips para sa epektibong pagsasanay sa {{language}}:",
  practiceGuideTip1: "Subukang bumuo ng mga kumpletong pangungusap, kahit na simple.",
  practiceGuideTip2: "Huwag mag-alala sa mga pagkakamali — bahagi sila ng pag-aaral!",
  practiceGuideTip3: "Humingi ng mga paliwanag kung may hindi ka nauunawaan.",
  practiceGuideTip4: "Gamitin ang mga salitang natutunan mo kamakailan.",
  practiceGuideTip5: "Ang aming AI ay mag-a-adapt sa inyong antas ng kakayahan.",

  // Practice tips - using t() keys
  practiceTip1: "Subukang bumuo ng mga kumpletong pangungusap, kahit na simple.",
  practiceTip2: "Huwag mag-alala sa mga pagkakamali — bahagi sila ng pag-aaral!",
  practiceTip3: "Humingi ng mga paliwanag kung may hindi ka nauunawaan.",
  practiceTip4: "Gamitin ang mga salitang natutunan mo kamakailan.",
  practiceTip5: "Ang aming AI ay mag-a-adapt sa inyong antas ng kakayahan.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "Subukang bumuo ng mga kumpletong pangungusap, kahit na simple.",
  "Don't worry about mistakes — they're part of learning!": "Huwag mag-alala sa mga pagkakamali — bahagi sila ng pag-aaral!",
  "Ask for explanations if there's something you don't understand.": "Humingi ng mga paliwanag kung may hindi ka nauunawaan.",
  "Use words you've learned recently.": "Gamitin ang mga salitang natutunan mo kamakailan.",
  "Our AI will adapt to your skill level and gradually help you improve.": "Ang aming AI ay mag-a-adapt sa inyong antas ng kakayahan at tutulong na unti-unting mapabuti.",
  "Here are some tips to get the most out of your {{language}} practice:": "Narito ang ilang tips upang makakuha ng pinakamataas sa inyong pagsasanay sa {{language}}:",

  // Hint button
  suggestionResponses: "Mga mungkahing sagot",
  responseSuggestions: "Mga mungkahi sa sagot",
  clickPlayToHearPronunciation: "I-click ang play upang marinig ang bigkas",
  startConversationForSuggestions: "Simulan ang pag-uusap upang makita ang mungkahi",
  startConversationToSeeSuggestions: "Simulan ang pag-uusap upang makita ang mungkahi",
  getResponseSuggestions: "Kumuha ng mga mungkahi sa sagot",
  greetings: "Mga pagbati",
  questions: "Mga tanong",
  error: "Error",
  couldNotGenerateHints: "Hindi makabuo ng mga hint",
  failedToPlayAudio: "Hindi maplay ang audio",
  play: "I-play",

  // Voice chat
  unlimitedVoicePractice: "Walang limitasyong pagsasanay sa boses",
  practiceDescription: "Paglalarawan ng pagsasanay",
  aiModelInfo: "Impormasyon ng AI Model: OpenAI GPT-4o-mini para sa natural language understanding at generation, browser TTS para sa voice responses.",
  practiceLevel: "Antas ng pagsasanay",
  intermediatePracticeLevel: "Panggitna — makipag-usap tungkol sa mga pamilyar na paksa",
  "Intermediate - Can discuss familiar topics": "Panggitna — makipag-usap tungkol sa mga pamilyar na paksa",

  // CEFR Level Descriptions
  cefrB1Description: "Panggitna — makipag-usap tungkol sa mga pamilyar na paksa",
  cefrA1Description: "Nagsisimula — mga pangunahing pangungusap at ekspresyon",
  cefrA2Description: "Elementary — mga simpleng araw-araw na pag-uusap",
  cefrB2Description: "Upper Intermediate — makakapag-usap nang madali",

  currentLanguage: "Kasalukuyang wika",
  practiceLanguage: "Wikang isinasanay",
  startSpeaking: "Simulang magsalita",
  stopListening: "Tumigil sa pakikinig",
  listeningNow: "Nakikinig ngayon",
  youSaid: "Sinabi mo",
  conversationStarters: "Mga panimula ng usapan",
  howToStartConversation: "Paano simulan ang usapan",
  tryThesePhrases: "Subukan ang mga pariralang ito:",
  conversationStarter1: "Kamusta! Kumusta ka ngayon?",
  conversationStarter2: "Kumusta ang panahon sa lugar ninyo?",
  conversationStarter3: "Mairekomenda mo ba ang magandang restaurant?",
  conversationStarter4: "Ano ang mga libangan at interest mo?",
  conversationStarter5: "Ikwento mo ang favorite mong libro o pelikula.",
  conversationStarter6: "Ano ang ginawa mo noong nakaraang weekend?",
  conversationStarter7: "Ano ang mga plano mo para bukas?",
  conversationStarter8: "Paano sinasabi ang... sa Spanish/English?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "Kamusta, kumusta ka ngayon?",
  "What's the weather like where you are?": "Kumusta ang panahon sa lugar ninyo?",
  "Can you recommend a good restaurant?": "Mairekomenda mo ba ang magandang restaurant?",
  "What are your hobbies and interests?": "Ano ang mga libangan at interest mo?",
  "Tell me about your favorite book or movie.": "Ikwento mo ang favorite mong libro o pelikula.",
  "What did you do last weekend?": "Ano ang ginawa mo noong nakaraang weekend?",
  "What are your plans for tomorrow?": "Ano ang mga plano mo para bukas?",
  "How do you say... in Spanish/English?": "Paano sinasabi ang... sa Spanish/English?",

  practiceWithVoiceChat: "Magsanay gamit ang voice chat",
  voiceChatTips: "Gamitin ang tool na ito upang mapabuti ang inyong speaking at listening skills. Narito ang ilang tips:",
  voiceTip1: "Magtanong tungkol sa mga araw-araw na paksa",
  voiceTip2: "Magsanay ng mga karaniwang parirala at ekspresyon",
  voiceTip3: "Ilarawan ang nakikita ninyo sa paligid",
  voiceTip4: "Magsanay ng vocabulary para sa mga specific na paksa tulad ng travel o food",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "Gamitin ang tool na ito upang mapabuti ang inyong speaking at listening skills. Narito ang ilang tips:",
  "Ask questions about everyday topics": "Magtanong tungkol sa mga araw-araw na paksa",
  "Practice common phrases and expressions": "Magsanay ng mga karaniwang parirala at ekspresyon",
  "Describe what you see around you": "Ilarawan ang nakikita ninyo sa paligid",
  "Practice vocabulary for specific topics like travel or food": "Magsanay ng vocabulary para sa mga specific na paksa tulad ng travel o food",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "Simulang magsalita upang makita ang transcript",
  clickMicrophoneToStartRecording: "I-click ang microphone upang simulan ang pag-record",

  // Premium Voice Chat
  premiumVoiceChat: "Premium Voice Chat",
  premiumVoiceChatBenefits: "Mga Benepisyo ng Premium Voice Chat",
  premiumVoiceChatDescription: "Magsanay ng {{practice}} sa natural voice conversation kasama ang premium AI tutor! Tutulungan ka ng AI na mapabuti ang grammar, vocabulary, at pronunciation.",
  premiumVoiceNote: "Ang Premium Voice Chat ay limitado sa 10 minuto bawat linggo",
  premiumVoiceNoteWithReset: "Ang Premium Voice Chat ay nagbibigay ng 10 minuto ng pagsasanay bawat linggo. Ang oras ay nire-reset tuwing Lunes ng 6:00 AM (Central Time).",
  benefitNaturalVoice: "Natural human-like voice interaction gamit ang ElevenLabs technology",
  benefitAccentPronunciation: "Tumpak na pronunciation at accent para sa malalim na pag-aaral",
  benefitRegularPractice: "10 minuto ng pagsasanay bawat linggo, nire-reset tuwing Lunes ng 6:00 AM",

  // Pronunciation practice
  pronunciationPractice: "Pagsasanay sa Pagbigkas",
  improvePronunciationSkillsWith: "Pagbutihin ang inyong pronunciation skills gamit ang mga targeted exercises",
  selectComplexityLevel: "Piliin ang antas ng complexity",
  chooseDifficultyLevelBasedOn: "Piliin ang difficulty level batay sa inyong language proficiency",
  speechRate: "Speech rate",
  selectLevelToStart: "Piliin ang level upang simulan ang exercise",
  startExercise: "Simulan ang ehersisyo",
  pronunciationPracticeTips: "Mga tip para sa pronunciation practice",
  listenCarefullyTip: "Makinig nang mabuti bago sumubok magsalita",
  payAttentionToStressTip: "Bigyang pansin ang stress at intonation",
  practiceDifficultSoundsTip: "Ulitin ang mga hirap na tunog nang maraming beses",
  recordYourselfTip: "I-record ang sarili at ikumpara sa mga native speakers",
  bePatientTip: "Maging matiyaga — ang pagpapabuti ng pronunciation ay nangangailangan ng panahon",
  practiceExercise: "Practice exercise",
  topic: "Paksa",
  listenToPhrase: "Pakinggan ang parirala",
  clickWordToHear: "I-click ang salita upang marinig",
  yourPronunciation: "Ang inyong pronunciation",
  startRecording: "Simulan ang pag-record",
  clickStartToRecord: "I-click ang 'Start' upang mag-record",
  tryAgain: "Subukang muli",
  newPhrase: "Bagong parirala",
  generatingExercise: "Ginagawa ang exercise",
  generatingNewPhrase: "Ginagawa ang bagong parirala",
  levelDescription: "Paglalarawan ng level",
  failedToGeneratePhrase: "Hindi nakabuo ng parirala",
  noSpeechDetected: "Walang nadetect na speech",
  pleaseTryAgain: "Pakisubukang muli",
  failedToAnalyzePronunciation: "Hindi na-analyze ang pronunciation",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "Pronunciation feedback",
  accuracyScore: "Accuracy score",
  intonationScore: "Intonation score",
  fluencyScore: "Fluency score",
  complexityScore: "Complexity score",
  wordAnalysis: "Word analysis",
  phonemeAnalysis: "Phoneme analysis",
  overallFeedback: "Overall feedback",
  excellent: "Napakahusay",
  good: "Mabuti",
  fair: "Katamtaman",
  needsImprovement: "Kailangan ng pagpapabuti",

  // Additional UI elements
  processing: "Pinoproseso",
  stopRecording: "Itigil ang pag-record",
  listeningToYou: "Nakikinig sa inyo",
  realTimeTranscription: "Real-time transcription",
  yourTranscription: "Inyong transcription",
  playing: "Tumutugtog",

  // Complexity levels
  novice: "Baguhan",
  intermediate: "Panggitna",
  advanced: "Advanced",
  superior: "Napakahusay",
  noviceLevelDescription: "Kayang makipag-usap sa mga simpleng, pamilyar na paksa",
  intermediateLevelDescription: "Kayang makipag-usap tungkol sa mga pamilyar na paksa",
  advancedLevelDescription: "Kayang makipag-usap sa mga komplikadong paksa nang may kumpiyansa",
  superiorLevelDescription: "Kayang gumawa ng lahat ng language functions",
  noviceLevelShortDescription: "Mga simpleng pangungusap",
  intermediateLevelShortDescription: "Mga pamilyar na paksa",
  advancedLevelShortDescription: "Mga komplikadong paksa",
  superiorLevelShortDescription: "Lahat ng functions",

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
