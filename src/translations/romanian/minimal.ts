
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "Bine ai venit la învățarea limbilor",
  yourPersonalAICompanion: "Asistentul tău AI personal pentru învățarea limbilor",
  startPracticing: "Începe să exersezi",
  practiceYourLanguageSkills: "Exersează-ți abilitățile lingvistice",
  swipeUpToGetStarted: "Glisează în sus pentru a începe",
  getStarted: "Începe",
  selectYourLanguagePreferences: "Selectează preferințele lingvistice",

  // Language selection
  selectNativeLanguage: "Selectează limba maternă",
  iSpeak: "Vorbesc",
  saveLanguagePreferences: "Salvează preferințele lingvistice",

  // Auth
  signIn: "Autentificare",
  signUp: "Înregistrare",
  signInToContinue: "Autentifică-te pentru a continua",
  createAccountToGetStarted: "Creează un cont pentru a începe",
  email: "Email",
  password: "Parolă",
  accessPasscode: "Cod de acces",
  dontHaveAccount: "Nu ai cont?",
  alreadyHaveAccount: "Ai deja un cont?",

  // Header
  loggedInAs: "Autentificat ca",
  signedInAs: "Autentificat ca",
  logout: "Deconectare",
  lightMode: "Mod luminos",

  // Navigation
  home: "Acasă",
  practice: "Exersează",
  textPractice: "Practica textului",
  unlimitedVoicePracticeNav: "Practica vocală nelimitată",
  pronunciationPracticeNav: "Practica pronunției",
  aiAnalysis: "Analiză AI",
  profile: "Profil",
  settings: "Setări",

  // Practice page
  englishPractice: "Exersează engleza",
  startChatting: "Începe conversația",
  startConversationIn: "Începe o conversație în {{language}}",
  fixGrammar: "Corectează gramatica",
  correctGrammar: "Corectează gramatica",
  clearConversation: "Șterge conversația",
  startTextChat: "Începe chat-ul text",
  startTextChatting: "Începe chat-ul text",
  typeMessageBelow: "Tastează mesajul mai jos",
  typeMessageToPractice: "Tastează un mesaj pentru a exersa {{language}}...",
  send: "Trimite",

  // Practice Guide
  practiceGuide: "Ghid pentru exersarea {{language}}",
  practiceGuideTitle: "Ghid pentru exersarea {{language}}",
  practiceGuideDescription: "Câteva sfaturi utile pentru exersarea eficientă a {{language}}:",
  practiceGuideIntro: "Câteva sfaturi utile pentru exersarea eficientă a {{language}}:",
  practiceGuideTip1: "Încearcă să formezi propoziții complete, chiar dacă sunt simple.",
  practiceGuideTip2: "Nu-ți face griji pentru greșeli — fac parte din învățare!",
  practiceGuideTip3: "Cere explicații dacă e ceva ce nu înțelegi.",
  practiceGuideTip4: "Folosește cuvintele pe care le-ai învățat recent.",
  practiceGuideTip5: "AI-ul nostru se va adapta la nivelul tău de abilitate.",

  // Practice tips - using t() keys
  practiceTip1: "Încearcă să formezi propoziții complete, chiar dacă sunt simple.",
  practiceTip2: "Nu-ți face griji pentru greșeli — fac parte din învățare!",
  practiceTip3: "Cere explicații dacă e ceva ce nu înțelegi.",
  practiceTip4: "Folosește cuvintele pe care le-ai învățat recent.",
  practiceTip5: "AI-ul nostru se va adapta la nivelul tău de abilitate.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "Încearcă să formezi propoziții complete, chiar dacă sunt simple.",
  "Don't worry about mistakes — they're part of learning!": "Nu-ți face griji pentru greșeli — fac parte din învățare!",
  "Ask for explanations if there's something you don't understand.": "Cere explicații dacă e ceva ce nu înțelegi.",
  "Use words you've learned recently.": "Folosește cuvintele pe care le-ai învățat recent.",
  "Our AI will adapt to your skill level and gradually help you improve.": "AI-ul nostru se va adapta la nivelul tău de abilitate și te va ajuta treptat să te îmbunătățești.",
  "Here are some tips to get the most out of your {{language}} practice:": "Iată câteva sfaturi pentru a profita la maximum de exersarea {{language}}:",

  // Hint button
  suggestionResponses: "Răspunsuri sugerate",
  responseSuggestions: "Sugestii de răspuns",
  clickPlayToHearPronunciation: "Apasă redare pentru a auzi pronunția",
  startConversationForSuggestions: "Începe conversația pentru a vedea sugestii",
  startConversationToSeeSuggestions: "Începe conversația pentru a vedea sugestii",
  getResponseSuggestions: "Obține sugestii de răspuns",
  greetings: "Salutări",
  questions: "Întrebări",
  error: "Eroare",
  couldNotGenerateHints: "Nu s-au putut genera indicii",
  failedToPlayAudio: "Nu s-a putut reda audio",
  play: "Redare",

  // Voice chat
  unlimitedVoicePractice: "Practica vocală nelimitată",
  practiceDescription: "Descrierea exercițiului",
  aiModelInfo: "Info Model AI: OpenAI GPT-4o-mini pentru înțelegerea și generarea limbajului natural, TTS din browser pentru răspunsuri vocale.",
  practiceLevel: "Nivelul exercițiului",
  intermediatePracticeLevel: "Intermediar — poate discuta subiecte familiare",
  "Intermediate - Can discuss familiar topics": "Intermediar — poate discuta subiecte familiare",

  // CEFR Level Descriptions
  cefrB1Description: "Intermediar — poate discuta subiecte familiare",
  cefrA1Description: "Începător — propoziții și expresii de bază",
  cefrA2Description: "Elementar — conversații simple zilnice",
  cefrB2Description: "Intermediar superior — poate comunica cu ușurință",

  currentLanguage: "Limba curentă",
  practiceLanguage: "Limba de exersat",
  startSpeaking: "Începe să vorbești",
  stopListening: "Oprește ascultarea",
  listeningNow: "Ascult acum",
  youSaid: "Ai spus",
  conversationStarters: "Deschideri de conversație",
  howToStartConversation: "Cum să începi o conversație",
  tryThesePhrases: "Încearcă aceste expresii:",
  conversationStarter1: "Salut! Ce mai faci azi?",
  conversationStarter2: "Cum e vremea pe la tine?",
  conversationStarter3: "Poți să-mi recomanzi un restaurant bun?",
  conversationStarter4: "Care sunt hobby-urile și interesele tale?",
  conversationStarter5: "Spune-mi despre cartea sau filmul tău preferat.",
  conversationStarter6: "Ce ai făcut weekendul trecut?",
  conversationStarter7: "Ce planuri ai pentru mâine?",
  conversationStarter8: "Cum se spune... în spaniolă/engleză?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "Salut, ce mai faci azi?",
  "What's the weather like where you are?": "Cum e vremea pe la tine?",
  "Can you recommend a good restaurant?": "Poți să-mi recomanzi un restaurant bun?",
  "What are your hobbies and interests?": "Care sunt hobby-urile și interesele tale?",
  "Tell me about your favorite book or movie.": "Spune-mi despre cartea sau filmul tău preferat.",
  "What did you do last weekend?": "Ce ai făcut weekendul trecut?",
  "What are your plans for tomorrow?": "Ce planuri ai pentru mâine?",
  "How do you say... in Spanish/English?": "Cum se spune... în spaniolă/engleză?",

  practiceWithVoiceChat: "Exersează cu chat-ul vocal",
  voiceChatTips: "Folosește această unealtă pentru a-ți îmbunătăți abilitățile de vorbire și ascultare. Iată câteva sfaturi:",
  voiceTip1: "Pune întrebări despre subiecte zilnice",
  voiceTip2: "Exersează expresii și fraze comune",
  voiceTip3: "Descrie ce vezi în jurul tău",
  voiceTip4: "Exersează vocabularul pentru subiecte specifice precum călătoria sau mâncarea",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "Folosește această unealtă pentru a-ți îmbunătăți abilitățile de vorbire și ascultare. Iată câteva sfaturi:",
  "Ask questions about everyday topics": "Pune întrebări despre subiecte zilnice",
  "Practice common phrases and expressions": "Exersează expresii și fraze comune",
  "Describe what you see around you": "Descrie ce vezi în jurul tău",
  "Practice vocabulary for specific topics like travel or food": "Exersează vocabularul pentru subiecte specifice precum călătoria sau mâncarea",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "Începe să vorbești pentru a vedea transcrierea",
  clickMicrophoneToStartRecording: "Apasă pe microfon pentru a începe înregistrarea",

  // Premium Voice Chat
  premiumVoiceChat: "Chat Vocal Premium",
  premiumVoiceChatBenefits: "Beneficiile Chat-ului Vocal Premium",
  premiumVoiceChatDescription: "Exersează {{practice}} în conversație vocală naturală cu tutorul AI premium! AI-ul te va ajuta să îți îmbunătățești gramatica, vocabularul și pronunția.",
  premiumVoiceNote: "Chat-ul Vocal Premium este limitat la 10 minute pe săptămână",
  premiumVoiceNoteWithReset: "Chat-ul Vocal Premium permite 10 minute de exersare pe săptămână. Timpul se resetează în fiecare luni la 6:00 AM (Ora Centrală).",
  benefitNaturalVoice: "Interacțiune vocală naturală asemănătoare omului cu tehnologia ElevenLabs",
  benefitAccentPronunciation: "Pronunție și accent precise pentru învățare profundă",
  benefitRegularPractice: "10 minute de exersare pe săptămână, se resetează luni la 6:00 AM",

  // Pronunciation practice
  pronunciationPractice: "Practica pronunției",
  improvePronunciationSkillsWith: "Îmbunătățește-ți abilitățile de pronunție cu exerciții țintite",
  selectComplexityLevel: "Selectează nivelul de complexitate",
  chooseDifficultyLevelBasedOn: "Alege nivelul de dificultate pe baza competenței tale lingvistice",
  speechRate: "Ritmul vorbirii",
  selectLevelToStart: "Selectează nivelul pentru a începe exercițiul",
  startExercise: "Începe exercițiul",
  pronunciationPracticeTips: "Sfaturi pentru practica pronunției",
  listenCarefullyTip: "Ascultă cu atenție înainte de a vorbi",
  payAttentionToStressTip: "Acordă atenție accentului și intonației",
  practiceDifficultSoundsTip: "Exersează sunetele dificile în mod repetat",
  recordYourselfTip: "Înregistrează-te și compară cu vorbitorii nativi",
  bePatientTip: "Fii răbdător — îmbunătățirea pronunției necesită timp",
  practiceExercise: "Exercițiu de practică",
  topic: "Subiect",
  listenToPhrase: "Ascultă expresia",
  clickWordToHear: "Apasă pe cuvânt pentru a auzi",
  yourPronunciation: "Pronunția ta",
  startRecording: "Începe înregistrarea",
  clickStartToRecord: "Apasă 'Începe' pentru a înregistra",
  tryAgain: "Încearcă din nou",
  newPhrase: "Expresie nouă",
  generatingExercise: "Se generează exercițiul",
  generatingNewPhrase: "Se generează expresie nouă",
  levelDescription: "Descrierea nivelului",
  failedToGeneratePhrase: "Nu s-a putut genera expresia",
  noSpeechDetected: "Nu s-a detectat vorbire",
  pleaseTryAgain: "Te rog încearcă din nou",
  failedToAnalyzePronunciation: "Nu s-a putut analiza pronunția",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "Feedback pronunție",
  accuracyScore: "Scor acuratețe",
  intonationScore: "Scor intonație",
  fluencyScore: "Scor fluență",
  complexityScore: "Scor complexitate",
  wordAnalysis: "Analiza cuvintelor",
  phonemeAnalysis: "Analiza fonemelor",
  overallFeedback: "Feedback general",
  excellent: "Excelent",
  good: "Bun",
  fair: "Acceptabil",
  needsImprovement: "Necesită îmbunătățire",

  // Additional UI elements
  processing: "Se procesează",
  stopRecording: "Oprește înregistrarea",
  listeningToYou: "Te ascult",
  realTimeTranscription: "Transcriere în timp real",
  yourTranscription: "Transcrierea ta",
  playing: "Se redă",

  // Complexity levels
  novice: "Începător",
  intermediate: "Intermediar",
  advanced: "Avansat",
  superior: "Superior",
  noviceLevelDescription: "Poate gestiona subiecte de bază și familiare",
  intermediateLevelDescription: "Poate discuta subiecte familiare",
  advancedLevelDescription: "Poate gestiona cu încredere subiecte complexe",
  superiorLevelDescription: "Poate îndeplini toate funcțiile lingvistice",
  noviceLevelShortDescription: "Propoziții simple",
  intermediateLevelShortDescription: "Subiecte familiare",
  advancedLevelShortDescription: "Subiecte complexe",
  superiorLevelShortDescription: "Toate funcțiile",

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
