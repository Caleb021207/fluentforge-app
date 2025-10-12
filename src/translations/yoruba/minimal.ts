
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "Kaabọ si Kọ́ ẹ̀kọ́ Èdè",
  yourPersonalAICompanion: "Ẹlẹ́rọ AI tirẹ̀ fún ìmọ̀ èdè",
  startPracticing: "Bẹ̀rẹ̀ Àdáṣe",
  practiceYourLanguageSkills: "Ṣe àkọ́kọ́ àwọn ọgbọ́n èdè rẹ",
  swipeUpToGetStarted: "Fà s'ókè láti bẹ̀rẹ̀",
  getStarted: "Bẹ̀rẹ̀",
  selectYourLanguagePreferences: "Yan àwọn ààyè èdè rẹ",

  // Language selection
  selectNativeLanguage: "Yan èdè abinibi rẹ",
  iSpeak: "Mo sọ",
  saveLanguagePreferences: "Fipamọ́ àwọn ààyè èdè",

  // Auth
  signIn: "Wọlé",
  signUp: "Forúkọsílẹ",
  signInToContinue: "Wọlé láti tẹ̀síwájú",
  createAccountToGetStarted: "Ṣẹda àkọọlẹ̀ láti bẹ̀rẹ̀",
  email: "Imeeli",
  password: "Ọrọ aṣínà",
  accessPasscode: "Kóòdù Àyèwọlé",
  dontHaveAccount: "Kò ní àkọọlẹ̀?",
  alreadyHaveAccount: "Tí o ti ní àkọọlẹ̀ tẹlẹ̀?",

  // Header
  loggedInAs: "Wọlé gẹ́gẹ́ bí",
  signedInAs: "Wọlé gẹ́gẹ́ bí",
  logout: "Jáde",
  lightMode: "Ipa Ìmọ́lẹ̀",

  // Navigation
  home: "Ilé",
  practice: "Ìmúlò",
  textPractice: "Ìmúlò Ọ̀rọ̀",
  unlimitedVoicePracticeNav: "Ìmúlò Ohùn Lákàkà",
  pronunciationPracticeNav: "Ìmúlò Ìtúpalẹ̀ Ohùn",
  aiAnalysis: "Ìtúpalẹ̀ AI",
  profile: "Profaili",
  settings: "Ètò",

  // Practice page
  englishPractice: "Ìmúlò Gẹ̀ẹ́sì",
  startChatting: "Bẹrẹ ìjíròrò",
  startConversationIn: "Bẹrẹ ìjíròrò ní {{language}}",
  fixGrammar: "Ṣàtúnṣe girama",
  correctGrammar: "Ṣàtúnṣe girama",
  clearConversation: "Nu ìjíròrò",
  startTextChat: "Bẹrẹ ìjíròrò Ọ̀rọ̀",
  startTextChatting: "Bẹrẹ ìjíròrò Ọ̀rọ̀",
  typeMessageBelow: "Tẹ ìfiranṣẹ̀ sílẹ̀",
  typeMessageToPractice: "Tẹ ìfiranṣẹ̀ láti ṣe ìmúlò {{language}}...",
  send: "Firanṣẹ",

  // Practice Guide
  practiceGuide: "Ìtóyè Ìmúlò {{language}}",
  practiceGuideTitle: "Ìtóyè Ìmúlò {{language}}",
  practiceGuideDescription: "Àwọn ìmòràn wúlò fún ìmúlò {{language}} tó dáa:",
  practiceGuideIntro: "Àwọn ìmòràn wúlò fún ìmúlò {{language}} tó dáa:",
  practiceGuideTip1: "Gbìyànjú láti lo gbolohun pipe, kódà tí ó bá rọrùn.",
  practiceGuideTip2: "Má bẹ̀rù láti ṣe aṣìṣe — apá kan ni ti kíkọ́!",
  practiceGuideTip3: "Béèrè àlàyé tí o bá ò yé ọ.",
  practiceGuideTip4: "Lo àwọn ọ̀rọ̀ tuntun tí o kẹ́kọ̀ọ́.",
  practiceGuideTip5: "AI yóò ṣe àtúnṣe sí ipele ọgbọ́n rẹ.",

  // Practice tips - using t() keys
  practiceTip1: "Gbìyànjú láti lo gbolohun pipe, kódà tí ó bá rọrùn.",
  practiceTip2: "Má bẹ̀rù láti ṣe aṣìṣe — apá kan ni ti kíkọ́!",
  practiceTip3: "Béèrè àlàyé tí o bá ò yé ọ.",
  practiceTip4: "Lo àwọn ọ̀rọ̀ tuntun tí o kẹ́kọ̀ọ́.",
  practiceTip5: "AI yóò ṣe àtúnṣe sí ipele ọgbọ́n rẹ.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "Gbìyànjú láti lo gbolohun pipe, kódà tí ó bá rọrùn.",
  "Don't worry about mistakes — they're part of learning!": "Má bẹ̀rù láti ṣe aṣìṣe — apá kan ni ti kíkọ́!",
  "Ask for explanations if there's something you don't understand.": "Béèrè àlàyé tí o bá ò yé ọ.",
  "Use words you've learned recently.": "Lo àwọn ọ̀rọ̀ tuntun tí o kẹ́kọ̀ọ́.",
  "Our AI will adapt to your skill level and gradually help you improve.": "AI wa yóò ṣe àtúnṣe sí ipele ọgbọ́n rẹ yóò sì ràn ọ́ lọ́wọ́ láti dára sí i.",
  "Here are some tips to get the most out of your {{language}} practice:": "Àwọn ìmòràn wúlò láti gba èrè púpọ̀ lára ìmúlò {{language}} rẹ:",

  // Hint button
  suggestionResponses: "Àwọn ìdáhùn tó dára",
  responseSuggestions: "Àwọn ìdáhùn tó dára",
  clickPlayToHearPronunciation: "Tẹ ṣiṣe láti gbọ́ ìtúpalẹ̀",
  startConversationForSuggestions: "Bẹrẹ ìjíròrò fún àwọn àbá",
  startConversationToSeeSuggestions: "Bẹrẹ ìjíròrò láti rí àwọn àbá",
  getResponseSuggestions: "Gba àwọn ìdáhùn tó dára",
  greetings: "Àwọn ìkíni",
  questions: "Àwọn ìbéèrè",
  error: "Àṣìṣe",
  couldNotGenerateHints: "Kò le ṣe àwọn ìkóni",
  failedToPlayAudio: "Ohùn kò ṣiṣẹ́",
  play: "Ṣiṣe",

  // Voice chat
  unlimitedVoicePractice: "Ìmúlò Ohùn Lákàkà",
  practiceDescription: "Àpejuwe Ìmúlò",
  aiModelInfo: "Ìfitónilétí Àmì AI: OpenAI GPT-4o-mini fún òye àti ìṣẹ̀dá èdè àdáyébá, TTS aṣàwákiri fún àwọn ìdáhùn ohùn.",
  practiceLevel: "Ipele Ìmúlò",
  intermediatePracticeLevel: "Àrin — Le ṣàjíròrò lórí àwọn kókó tí ó mọ̀",
  "Intermediate - Can discuss familiar topics": "Àrin — Le ṣàjíròrò lórí àwọn kókó tí ó mọ̀",

  // CEFR Level Descriptions
  cefrB1Description: "Àrin — Le ṣàjíròrò lórí àwọn kókó tí ó mọ̀",
  cefrA1Description: "Ìbẹ̀rẹ̀ — Àwọn gbolohun àti àsọyé àtẹ̀wọlé",
  cefrA2Description: "Ìpilẹ̀ — Ìjíròrò rọrùn ojoojúmọ́",
  cefrB2Description: "Àrin Gíga — Le ṣàjíròrò láìní wahala",

  currentLanguage: "Èdè Lọ́wọ́lọ́wọ́",
  practiceLanguage: "Èdè Ìmúlò",
  startSpeaking: "Bẹrẹ Sísọ̀rọ̀",
  stopListening: "Dáwọ́ Fetísílẹ̀",
  listeningNow: "Ó ń fetísílẹ̀ báyìí",
  youSaid: "O sọ",
  conversationStarters: "Àwọn Ìbẹrẹ Ìjíròrò",
  howToStartConversation: "Bí a ṣe lè bẹ̀rẹ̀ ìjíròrò",
  tryThesePhrases: "Gbìyànjú àwọn gbolohun wọ̀nyí:",
  conversationStarter1: "Báwo ni! Ṣé o wà dáadáa lónìí?",
  conversationStarter2: "Báwo ni ojo ṣe rí níbi tí o wà?",
  conversationStarter3: "Ṣé o le ṣe ìmúṣá ile oúnjẹ tó dára?",
  conversationStarter4: "Kí ni àwọn ìfẹ́ àti ohun tí o fẹ́ràn?",
  conversationStarter5: "Sọ nípa ìwé tàbí fíílmù tí o fẹ́ràn jùlọ.",
  conversationStarter6: "Kí ni o ṣe ní ìgbẹ̀yìn ọ̀sẹ̀?",
  conversationStarter7: "Kí ni ètò rẹ fún ọ̀la?",
  conversationStarter8: "Báwo ni a ṣe máa sọ... ní Sípáníìṣì/Gẹ̀ẹ́sì?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "Báwo ni, ṣé o wà dáadáa lónìí?",
  "What's the weather like where you are?": "Báwo ni ojo ṣe rí níbi tí o wà?",
  "Can you recommend a good restaurant?": "Ṣé o le ṣe ìmúṣá ile oúnjẹ tó dára?",
  "What are your hobbies and interests?": "Kí ni àwọn ìfẹ́ àti ohun tí o fẹ́ràn?",
  "Tell me about your favorite book or movie.": "Sọ nípa ìwé tàbí fíílmù tí o fẹ́ràn jùlọ.",
  "What did you do last weekend?": "Kí ni o ṣe ní ìgbẹ̀yìn ọ̀sẹ̀?",
  "What are your plans for tomorrow?": "Kí ni ètò rẹ fún ọ̀la?",
  "How do you say... in Spanish/English?": "Báwo ni a ṣe máa sọ... ní Sípáníìṣì/Gẹ̀ẹ́sì?",

  practiceWithVoiceChat: "Ṣe Ìmúlò Pẹ̀lú Ìjíròrò Ohùn",
  voiceChatTips: "Lo ohun-èlò yìí láti mú ọgbọ́n sísọ̀rọ̀ àti fífetí sílẹ̀ rẹ dára. Àwọn ìmòràn nìyí:",
  voiceTip1: "Béèrè ìbéèrè lórí àwọn kókó ojoojúmọ́",
  voiceTip2: "Ṣe ìmúlò àwọn gbolohun àti àsọyé wòpọ̀",
  voiceTip3: "Ṣàpèjúwe àwọn nǹkan tí o rí lágbègbè rẹ",
  voiceTip4: "Kọ́ àkọsílẹ̀ lórí àwọn kókó pàtó bí irin-ajo tàbí oúnjẹ",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "Lo ohun-èlò yìí láti mú ọgbọ́n sísọ̀rọ̀ àti fífetí sílẹ̀ rẹ dára. Àwọn ìmòràn nìyí:",
  "Ask questions about everyday topics": "Béèrè ìbéèrè lórí àwọn kókó ojoojúmọ́",
  "Practice common phrases and expressions": "Ṣe ìmúlò àwọn gbolohun àti àsọyé wòpọ̀",
  "Describe what you see around you": "Ṣàpèjúwe àwọn nǹkan tí o rí lágbègbè rẹ",
  "Practice vocabulary for specific topics like travel or food": "Kọ́ àkọsílẹ̀ lórí àwọn kókó pàtó bí irin-ajo tàbí oúnjẹ",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "Bẹrẹ sísọ̀rọ̀ láti rí àkọsílẹ̀",
  clickMicrophoneToStartRecording: "Tẹ maikirofoonu láti bẹ̀rẹ̀ sí gbasilẹ",

  // Premium Voice Chat
  premiumVoiceChat: "Ìjíròrò Ohùn Àtàyẹ",
  premiumVoiceChatBenefits: "Àwọn Àǹfààní Ìjíròrò Ohùn Àtàyẹ",
  premiumVoiceChatDescription: "Ṣe ìmúlò {{practice}} pẹ̀lú ìjíròrò ohùn àdáyébá pẹ̀lú olùkọ́ AI àtàyẹ! AI yóò ràn ọ́ lọ́wọ́ láti mú gírámà, àkọsílẹ̀, àti ìtúpalẹ̀ rẹ dára.",
  premiumVoiceNote: "Ìjíròrò ohùn àtàyẹ tí a dínkù sí ìṣẹ̀jú 10 lọ́sẹ̀",
  premiumVoiceNoteWithReset: "Ìjíròrò ohùn àtàyẹ yóò gba ìmúlò ìṣẹ̀jú 10 lọ́sẹ̀. Àkókò náà yóò tún bẹ̀rẹ̀ ní gbogbo ọjọ́ Ajé ní aago 6 òwúrọ̀ (Àkókò Àarin).",
  benefitNaturalVoice: "Ìfararọ́ ohùn àdáyébá tó dàbí ti ènìyàn nípa lílo ìmọ̀-ẹ̀rọ ElevenLabs",
  benefitAccentPronunciation: "Ìtúpalẹ̀ àti àmì ohùn tó tọ́ fún ìkọ́ tó jinlẹ̀",
  benefitRegularPractice: "Ìmúlò ìṣẹ̀jú 10 lọ́sẹ̀, tún bẹ̀rẹ̀ ní ọjọ́ Ajé aago 6 òwúrọ̀",

  // Pronunciation practice
  pronunciationPractice: "Ìmúlò Ìtúpalẹ̀",
  improvePronunciationSkillsWith: "Mú ọgbọ́n ìtúpalẹ̀ rẹ dára sí i pẹ̀lú ìmúlò tó ní ìfọkànsí",
  selectComplexityLevel: "Yan ipele ìṣòro",
  chooseDifficultyLevelBasedOn: "Yan ipele ìṣòro tó dá lórí agbára èdè rẹ",
  speechRate: "Iye Ọ̀rọ̀",
  selectLevelToStart: "Yan ipele láti bẹ̀rẹ̀ ìmúlò",
  startExercise: "Bẹrẹ Ìmúlò",
  pronunciationPracticeTips: "Àwọn Ìmòràn Ìmúlò Ìtúpalẹ̀",
  listenCarefullyTip: "Fetí sílẹ̀ dáadáa kí o tó sọ̀rọ̀",
  payAttentionToStressTip: "Fiyèsí títẹ̀mọ́lẹ̀ àti ìṣe-tónu",
  practiceDifficultSoundsTip: "Tún àwọn ohùn tó ṣòro ṣe lẹ́ẹ̀mejì",
  recordYourselfTip: "Gbasilẹ ara rẹ kí o sì fiwé àpẹẹrẹ àwọn asọ̀rọ̀ abínibí",
  bePatientTip: "Ní sùúrù — ìlọsíwájú ìtúpalẹ̀ ń gba àkókò",
  practiceExercise: "Ìmúlò",
  topic: "Kókó",
  listenToPhrase: "Gbọ́ gbolohun",
  clickWordToHear: "Tẹ ọ̀rọ̀ láti gbọ́",
  yourPronunciation: "Ìtúpalẹ̀ Rẹ",
  startRecording: "Bẹrẹ Gbasilẹ",
  clickStartToRecord: "Tẹ 'Bẹrẹ' láti gbasilẹ",
  tryAgain: "Gbìyànjú lẹ́ẹ̀kansi",
  newPhrase: "Gbolohun Tuntun",
  generatingExercise: "Ìmúlò ń ṣẹ̀dá",
  generatingNewPhrase: "Gbolohun tuntun ń ṣẹ̀dá",
  levelDescription: "Àpèjúwe Ipele",
  failedToGeneratePhrase: "Kò le ṣẹ̀dá gbolohun",
  noSpeechDetected: "Kò gbọ́ ọ̀rọ̀ kankan",
  pleaseTryAgain: "Jọ̀wọ́ gbìyànjú lẹ́ẹ̀kansi",
  failedToAnalyzePronunciation: "Ìtúpalẹ̀ ìtúpalẹ̀ ohùn kùnà",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "Ìdáhùn Ìtúpalẹ̀",
  accuracyScore: "Àmì Déédéé",
  intonationScore: "Àmì Ìṣe-tónu",
  fluencyScore: "Àmì Ìṣàn",
  complexityScore: "Àmì Ìṣòro",
  wordAnalysis: "Ìtúpalẹ̀ Ọ̀rọ̀",
  phonemeAnalysis: "Ìtúpalẹ̀ Phoneme",
  overallFeedback: "Ìdáhùn Gbogbogbò",
  excellent: "Ó dára púpọ̀",
  good: "Ó dára",
  fair: "Ó ṣe é ṣe",
  needsImprovement: "Ó nílò ìmúdárasí",

  // Additional UI elements
  processing: "Ó ń ṣiṣẹ́",
  stopRecording: "Dá gbasilẹ dúró",
  listeningToYou: "Ó ń fetí sí ọ",
  realTimeTranscription: "Àkọsílẹ̀ Àkókò Gidi",
  yourTranscription: "Àkọsílẹ̀ Rẹ",
  playing: "Ó ń ṣiṣe",

  // Complexity levels
  novice: "Tẹ̀síwájú",
  intermediate: "Àrin",
  advanced: "Tó ti Ní Ìmọ̀",
  superior: "Tó ga Jùlọ",
  noviceLevelDescription: "Lè ṣàkóso àwọn kókó ìpilẹ̀ àti àwọn tí ó mọ̀",
  intermediateLevelDescription: "Lè sọ̀rọ̀ lórí àwọn ohun tí ó mọ̀",
  advancedLevelDescription: "Lè ṣàkóso àwọn kókó tó ṣòro pẹ̀lú ìgboyà",
  superiorLevelDescription: "Lè ṣe gbogbo iṣẹ́ èdè",
  noviceLevelShortDescription: "Àwọn gbolohun rọrùn",
  intermediateLevelShortDescription: "Àwọn kókó tí ó mọ̀",
  advancedLevelShortDescription: "Àwọn kókó tó ṣòro",
  superiorLevelShortDescription: "Gbogbo iṣẹ́",

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
