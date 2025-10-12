
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "Ku soo dhawoow Barashada Luuqadda",
  yourPersonalAICompanion: "Kaaliyahaaga AI ee Barashada Luuqadda",
  startPracticing: "Bilow Tababbarka",
  practiceYourLanguageSkills: "Ku tababbaro xirfadahaaga luuqadda",
  swipeUpToGetStarted: "Iska rog kor si aad u bilowdo",
  getStarted: "Bilow",
  selectYourLanguagePreferences: "Dooro doorashooyinka luuqaddaada",

  // Language selection
  selectNativeLanguage: "Dooro afka hooyo",
  iSpeak: "Waan ku hadlaa",
  saveLanguagePreferences: "Kaydi doorashooyinka luuqadda",

  // Auth
  signIn: "Soo gal",
  signUp: "Isdiiwaan geli",
  signInToContinue: "Si aad u sii waddo soo gal",
  createAccountToGetStarted: "Abuur koonto si aad u bilowdo",
  email: "Email",
  password: "Furaha sirta",
  accessPasscode: "Lambarka gelitaanka",
  dontHaveAccount: "Koonto ma leedahay?",
  alreadyHaveAccount: "Horey ma u leedahay koonto?",

  // Header
  loggedInAs: "Waad ku jirtaa magaca",
  signedInAs: "Waad ku jirtaa magaca",
  logout: "Ka bax",
  lightMode: "Iftiinka",

  // Navigation
  home: "Bogga Hore",
  practice: "Tababar",
  textPractice: "Qoraal Ku Dheelitiran",
  unlimitedVoicePracticeNav: "Kuwa Codka aan xadidnayn",
  pronunciationPracticeNav: "Dhaqdhaqaaqa Hadalka",
  aiAnalysis: "Falanqaynta AI",
  profile: "Xogtaada",
  settings: "Dejinta",

  // Practice page
  englishPractice: "Tababarka Ingiriisiga",
  startChatting: "Bilow wada hadal",
  startConversationIn: "Bilow wada sheekeysi luuqadda {{language}}",
  fixGrammar: "Sax naxwaha",
  correctGrammar: "Sax naxwaha",
  clearConversation: "Tirtir wada hadalka",
  startTextChat: "Bilow qoraal wada sheekeysi",
  startTextChatting: "Bilow qoraal wada sheekeysi",
  typeMessageBelow: "Qor fariinta hoose",
  typeMessageToPractice: "Qor fariin si aad ugu tababarto {{language}}...",
  send: "Dir",

  // Practice Guide
  practiceGuide: "Tilmaanta Tababarka {{language}}",
  practiceGuideTitle: "Tilmaanta Tababarka {{language}}",
  practiceGuideDescription: "Talooyin wax ku ool ah oo ku saabsan tababarka wax ku oolka ah ee {{language}}:",
  practiceGuideIntro: "Talooyin wax ku ool ah oo ku saabsan tababarka wax ku oolka ah ee {{language}}:",
  practiceGuideTip1: "Isku day inaad isticmaasho weedho dhameystiran, xitaa haddii ay fudud yihiin.",
  practiceGuideTip2: "Ha ka baqan khaladaadka — waa qayb ka mid ah barashada!",
  practiceGuideTip3: "Weydii sharraxaad haddii aadan wax fahanin.",
  practiceGuideTip4: "Isticmaal erayo cusub oo aad dhawaan baratay.",
  practiceGuideTip5: "AI-geena waxay la qabsan doontaa heerkaaga xirfadda.",

  // Practice tips - using t() keys
  practiceTip1: "Isku day inaad isticmaasho weedho dhameystiran, xitaa haddii ay fudud yihiin.",
  practiceTip2: "Ha ka baqan khaladaadka — waa qayb ka mid ah barashada!",
  practiceTip3: "Weydii sharraxaad haddii aadan wax fahanin.",
  practiceTip4: "Isticmaal erayo cusub oo aad dhawaan baratay.",
  practiceTip5: "AI-geena waxay la qabsan doontaa heerkaaga xirfadda.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "Isku day inaad isticmaasho weedho dhameystiran, xitaa haddii ay fudud yihiin.",
  "Don't worry about mistakes — they're part of learning!": "Ha ka baqan khaladaadka — waa qayb ka mid ah barashada!",
  "Ask for explanations if there's something you don't understand.": "Weydii sharraxaad haddii aadan wax fahanin.",
  "Use words you've learned recently.": "Isticmaal erayo cusub oo aad dhawaan baratay.",
  "Our AI will adapt to your skill level and gradually help you improve.": "AI-geena waxay la qabsan doontaa heerkaaga xirfadda waana ku caawini doontaa inaad si tartiib ah u horumariso.",
  "Here are some tips to get the most out of your {{language}} practice:": "Halkan waxaa ah talooyiin aad ku heli karto faa'iido badan oo ka timid tababarkaaga {{language}}:",

  // Hint button
  suggestionResponses: "Jawaabaha la soo jeediyay",
  responseSuggestions: "Jawaabaha la soo jeediyay",
  clickPlayToHearPronunciation: "Guji ciyaar si aad u maqasho dhawaaqa",
  startConversationForSuggestions: "Bilow wada sheekeysi si aad u hesho talooyin",
  startConversationToSeeSuggestions: "Bilow wada sheekeysi si aad u aragto talooyin",
  getResponseSuggestions: "Hel jawaabaha la soo jeediyay",
  greetings: "Salaamaha",
  questions: "Su'aalaha",
  error: "Khalad",
  couldNotGenerateHints: "Ma suurtogalin in la abuuro talooyin",
  failedToPlayAudio: "Ma suurtogalin in la ciyaaro codka",
  play: "Ciyaar",

  // Voice chat
  unlimitedVoicePractice: "Tababar Cod aan xadidnayn",
  practiceDescription: "Sharaxaadda tababarka",
  aiModelInfo: "Macluumaadka qaabka AI: OpenAI GPT-4o-mini ee fahanka luuqadda dabiiciga ah iyo abuurista, TTS braawsarka ee jawaabaha codka.",
  practiceLevel: "Heerka Tababarka",
  intermediatePracticeLevel: "Dhexdhexaad — Ka hadal mowduucyada aad taqaano",
  "Intermediate - Can discuss familiar topics": "Dhexdhexaad — Ka hadal mowduucyada aad taqaano",

  // CEFR Level Descriptions
  cefrB1Description: "Dhexdhexaad — Ka hadal mowduucyada aad taqaano",
  cefrA1Description: "Bilaabaha — Weedhaha iyo hadalka aasaasiga ah",
  cefrA2Description: "Aasaasiga — Wada sheekeysiga fudud ee maalinlaha ah",
  cefrB2Description: "Sare dhexdhexaad — Wuxuu si sahal ah ula xidhiidhi karaa",

  currentLanguage: "Luuqadda hadda jirta",
  practiceLanguage: "Luuqadda tababarka",
  startSpeaking: "Bilow hadalka",
  stopListening: "Jooji dhagaysiga",
  listeningNow: "Hadda waa dhagaysanayaa",
  youSaid: "Waad tidhi",
  conversationStarters: "Bilowga wada sheekeysiga",
  howToStartConversation: "Sidee loo bilaabaa wada sheekeysi",
  tryThesePhrases: "Isku day weedhahan:",
  conversationStarter1: "Salaan! Sidee tahay maanta?",
  conversationStarter2: "Sidee buu u yahay cimilada halkaaga?",
  conversationStarter3: "Ma ku talo gelin kartaa makhaayadda wanaagsan?",
  conversationStarter4: "Maxay yihiin hiwaayadahaaga iyo xiisahaaga?",
  conversationStarter5: "Ii sheeg buug ama filim aad jeceshahay.",
  conversationStarter6: "Maxaad sameysay usbuucii hore?",
  conversationStarter7: "Maxay yihiin qorshahaaga berri?",
  conversationStarter8: "Sidee loo dhahaa... af Isbaanish/Ingiriisi?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "Salaan, sidee tahay maanta?",
  "What's the weather like where you are?": "Sidee buu u yahay cimilada halkaaga?",
  "Can you recommend a good restaurant?": "Ma ku talo gelin kartaa makhaayadda wanaagsan?",
  "What are your hobbies and interests?": "Maxay yihiin hiwaayadahaaga iyo xiisahaaga?",
  "Tell me about your favorite book or movie.": "Ii sheeg buug ama filim aad jeceshahay.",
  "What did you do last weekend?": "Maxaad sameysay usbuucii hore?",
  "What are your plans for tomorrow?": "Maxay yihiin qorshahaaga berri?",
  "How do you say... in Spanish/English?": "Sidee loo dhahaa... af Isbaanish/Ingiriisi?",

  practiceWithVoiceChat: "Tababar adigoo isticmaalaya wada sheekeysi cod",
  voiceChatTips: "Adeegso qalabkan si aad u horumariso xirfadahaaga hadalka iyo dhagaysiga. Halkan waxaa ah talooyiin:",
  voiceTip1: "Weydii su'aalo ku saabsan mowduucyada maalinlaha ah",
  voiceTip2: "Ku celceli weedho iyo tibaaxo caadi ah",
  voiceTip3: "Sharax waxyaabaha aad ku aragto hareerkaaga",
  voiceTip4: "Ku tababar mufradaadka mowduucyada gaarka ah sida safarka ama cuntada",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "Adeegso qalabkan si aad u horumariso xirfadahaaga hadalka iyo dhagaysiga. Halkan waxaa ah talooyiin:",
  "Ask questions about everyday topics": "Weydii su'aalo ku saabsan mowduucyada maalinlaha ah",
  "Practice common phrases and expressions": "Ku celceli weedho iyo tibaaxo caadi ah",
  "Describe what you see around you": "Sharax waxyaabaha aad ku aragto hareerkaaga",
  "Practice vocabulary for specific topics like travel or food": "Ku tababar mufradaadka mowduucyada gaarka ah sida safarka ama cuntada",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "Bilow hadalka si aad u aragto qoraalka",
  clickMicrophoneToStartRecording: "Guji makarafoonka si aad u bilowdo duubista",

  // Premium Voice Chat
  premiumVoiceChat: "Wada sheekeysi cod ee heerka sarreen",
  premiumVoiceChatBenefits: "Faa'iidooyinka wada sheekeysiga codka ee heerka sarree",
  premiumVoiceChatDescription: "Tababar {{practice}} iyadoo loo adeegsanayo wada sheekeysi cod dabiici ah oo leh macalin AI oo heer sare ah! AI waxay kaa caawin doontaa hagaajinta naxwaha, mufradaadka, iyo dhawaaqa.",
  premiumVoiceNote: "Wada sheekeysiga codka heerka sarree wuxuu ku xidhan yahay 10 daqiiqo usbuucii",
  premiumVoiceNoteWithReset: "Wada sheekeysiga codka heerka sarree wuxuu oggol yahay 10 daqiiqo tababar usbuucii. Waktigu wuxuu dib u dejiyaa Isniin kasta 6:00 subaxnimo (Central Time).",
  benefitNaturalVoice: "Falgalka cod dabiici ah oo bini'aadamnimo leh iyadoo la adeegsanayo tikniyoolajiyada ElevenLabs",
  benefitAccentPronunciation: "Lahjad iyo dhawaaq sax ah oo loogu talagalay barashada qoto dheer",
  benefitRegularPractice: "10 daqiiqo tababar usbuucii, dib loo dejiyaa Isniin 6:00 subaxnimo",

  // Pronunciation practice
  pronunciationPractice: "Tababar dhawaaq",
  improvePronunciationSkillsWith: "Kordhi xirfadahaaga dhawaaqida adigoo isticmaalaya tababar bartilmaameed",
  selectComplexityLevel: "Dooro heerka dhibka",
  chooseDifficultyLevelBasedOn: "Dooro heer ku saleysan kartidaada luuqadda",
  speechRate: "Xawaaraha hadalka",
  selectLevelToStart: "Dooro heer si aad u bilowdo tababarka",
  startExercise: "Bilow jimicsiga",
  pronunciationPracticeTips: "Talooyin tababar dhawaaq",
  listenCarefullyTip: "Dhageyso si taxaddar leh ka hor intaadan hadalin",
  payAttentionToStressTip: "U fiirso cadaadiska iyo codka",
  practiceDifficultSoundsTip: "Ku celceli dhawaaqyada adag dhowr jeer",
  recordYourselfTip: "Is duub oo la barbardhig dadka af-duuban",
  bePatientTip: "Samir yeelo — horumarinta dhawaaqa waqti bay qaadataa",
  practiceExercise: "Jimicsi",
  topic: "Mawduuc",
  listenToPhrase: "Dhageyso weedha",
  clickWordToHear: "Guji ereyga si aad u maqasho",
  yourPronunciation: "Dhawaaqdaada",
  startRecording: "Bilow duubista",
  clickStartToRecord: "Guji 'Bilow' si aad u duubto",
  tryAgain: "Isku day mar kale",
  newPhrase: "Weedh cusub",
  generatingExercise: "Waxa la abuurayaa jimicsi",
  generatingNewPhrase: "Waxa la samaynayaa weedh cusub",
  levelDescription: "Sharaxaadda heerka",
  failedToGeneratePhrase: "Ma suurtogalin in la abuuro weedh",
  noSpeechDetected: "Ma jirto hadal la ogaaday",
  pleaseTryAgain: "Fadlan isku day mar kale",
  failedToAnalyzePronunciation: "Falanqaynta dhawaaqa waa ay guuldareysatay",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "Jawaab celinta dhawaaqa",
  accuracyScore: "Dhibcaha saxnimada",
  intonationScore: "Dhibcaha codka",
  fluencyScore: "Dhibcaha fasaxnimada",
  complexityScore: "Dhibcaha dhibka",
  wordAnalysis: "Falanqaynta ereyga",
  phonemeAnalysis: "Falanqaynta phoneme",
  overallFeedback: "Jawaab celinta guud",
  excellent: "Aad u fiican",
  good: "Fiican",
  fair: "Caadi",
  needsImprovement: "Waxay u baahan tahay horumarin",

  // Additional UI elements
  processing: "Waa la qabanayaa",
  stopRecording: "Jooji duubista",
  listeningToYou: "Waa ku dhagaysanayaa",
  realTimeTranscription: "Qoraalka wakhtiga dhabta ah",
  yourTranscription: "Qoraalkaaga",
  playing: "Waa la ciyaarayaa",

  // Complexity levels
  novice: "Bilaabaha",
  intermediate: "Dhexdhexaad",
  advanced: "Horumarsan",
  superior: "Sare",
  noviceLevelDescription: "Wuxuu maarayn karaa mowduucyada aasaasiga ah iyo kuwa la yaqaan",
  intermediateLevelDescription: "Wuxuu ka hadli karaa waxyaabaha la yaqaan",
  advancedLevelDescription: "Wuxuu si kalsooni leh u maarayn karaa mowduucyada dhibka leh",
  superiorLevelDescription: "Wuxuu fullin karaa dhammaan hawlaha luuqadda",
  noviceLevelShortDescription: "Jumlado fudud",
  intermediateLevelShortDescription: "Mowduucyada la yaqaan",
  advancedLevelShortDescription: "Mowduucyada dhibka leh",
  superiorLevelShortDescription: "Dhammaan hawlaha",

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
