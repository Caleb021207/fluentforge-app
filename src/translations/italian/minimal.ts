
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "Benvenuto nell'apprendimento delle lingue",
  yourPersonalAICompanion: "Il tuo assistente AI personale per l'apprendimento delle lingue",
  startPracticing: "Inizia a praticare",
  practiceYourLanguageSkills: "Pratica le tue abilità linguistiche",
  swipeUpToGetStarted: "Scorri verso l'alto per iniziare",
  getStarted: "Inizia",
  selectYourLanguagePreferences: "Seleziona le tue preferenze linguistiche",

  // Language selection
  selectNativeLanguage: "Seleziona la tua lingua madre",
  iSpeak: "Parlo",
  saveLanguagePreferences: "Salva le preferenze linguistiche",

  // Auth
  signIn: "Accedi",
  signUp: "Registrati",
  signInToContinue: "Accedi per continuare",
  createAccountToGetStarted: "Crea un account per iniziare",
  email: "Email",
  password: "Password",
  accessPasscode: "Codice di accesso",
  dontHaveAccount: "Non hai un account?",
  alreadyHaveAccount: "Hai già un account?",

  // Header
  loggedInAs: "Accesso effettuato come",
  signedInAs: "Accesso effettuato come",
  logout: "Disconnetti",
  lightMode: "Modalità chiara",

  // Navigation
  home: "Home",
  practice: "Esercita",
  textPractice: "Esercizio di testo",
  unlimitedVoicePracticeNav: "Esercizio vocale illimitato",
  pronunciationPracticeNav: "Esercizio di pronuncia",
  aiAnalysis: "Analisi AI",
  profile: "Profilo",
  settings: "Impostazioni",

  // Practice page
  englishPractice: "Esercita l'inglese",
  startChatting: "Inizia a chattare",
  startConversationIn: "Inizia una conversazione in {{language}}",
  fixGrammar: "Correggi grammatica",
  correctGrammar: "Correggi grammatica",
  clearConversation: "Pulisci conversazione",
  startTextChat: "Avvia chat testuale",
  startTextChatting: "Avvia chat testuale",
  typeMessageBelow: "Digita il messaggio qui sotto",
  typeMessageToPractice: "Digita un messaggio per esercitarti in {{language}}...",
  send: "Invia",

  // Practice Guide
  practiceGuide: "Guida all'esercizio {{language}}",
  practiceGuideTitle: "Guida all'esercizio {{language}}",
  practiceGuideDescription: "Alcuni consigli utili per praticare efficacemente {{language}}:",
  practiceGuideIntro: "Alcuni consigli utili per praticare efficacemente {{language}}:",
  practiceGuideTip1: "Prova a formare frasi complete, anche se sono semplici.",
  practiceGuideTip2: "Non preoccuparti degli errori — fanno parte dell'apprendimento!",
  practiceGuideTip3: "Chiedi spiegazioni se c'è qualcosa che non capisci.",
  practiceGuideTip4: "Usa parole che hai imparato di recente.",
  practiceGuideTip5: "La nostra AI si adatterà al tuo livello di competenza.",

  // Practice tips - using t() keys
  practiceTip1: "Prova a formare frasi complete, anche se sono semplici.",
  practiceTip2: "Non preoccuparti degli errori — fanno parte dell'apprendimento!",
  practiceTip3: "Chiedi spiegazioni se c'è qualcosa che non capisci.",
  practiceTip4: "Usa parole che hai imparato di recente.",
  practiceTip5: "La nostra AI si adatterà al tuo livello di competenza.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "Prova a formare frasi complete, anche se sono semplici.",
  "Don't worry about mistakes — they're part of learning!": "Non preoccuparti degli errori — fanno parte dell'apprendimento!",
  "Ask for explanations if there's something you don't understand.": "Chiedi spiegazioni se c'è qualcosa che non capisci.",
  "Use words you've learned recently.": "Usa parole che hai imparato di recente.",
  "Our AI will adapt to your skill level and gradually help you improve.": "La nostra AI si adatterà al tuo livello di competenza e ti aiuterà gradualmente a migliorare.",
  "Here are some tips to get the most out of your {{language}} practice:": "Ecco alcuni consigli per ottenere il massimo dal tuo esercizio in {{language}}:",

  // Hint button
  suggestionResponses: "Risposte suggerite",
  responseSuggestions: "Suggerimenti di risposta",
  clickPlayToHearPronunciation: "Clicca su play per ascoltare la pronuncia",
  startConversationForSuggestions: "Inizia una conversazione per vedere i suggerimenti",
  startConversationToSeeSuggestions: "Inizia una conversazione per vedere i suggerimenti",
  getResponseSuggestions: "Ottieni suggerimenti di risposta",
  greetings: "Saluti",
  questions: "Domande",
  error: "Errore",
  couldNotGenerateHints: "Impossibile generare suggerimenti",
  failedToPlayAudio: "Riproduzione audio fallita",
  play: "Riproduci",

  // Voice chat
  unlimitedVoicePractice: "Esercizio vocale illimitato",
  practiceDescription: "Descrizione esercizio",
  aiModelInfo: "Info modello AI: OpenAI GPT-4o-mini per comprensione e generazione del linguaggio naturale, TTS browser per risposte vocali.",
  practiceLevel: "Livello esercizio",
  intermediatePracticeLevel: "Intermedio — può discutere argomenti familiari",
  "Intermediate - Can discuss familiar topics": "Intermedio — può discutere argomenti familiari",

  // CEFR Level Descriptions
  cefrB1Description: "Intermedio — può discutere argomenti familiari",
  cefrA1Description: "Principiante — frasi ed espressioni di base",
  cefrA2Description: "Elementare — conversazioni quotidiane semplici",
  cefrB2Description: "Intermedio superiore — può comunicare con facilità",

  currentLanguage: "Lingua corrente",
  practiceLanguage: "Lingua da praticare",
  startSpeaking: "Inizia a parlare",
  stopListening: "Smetti di ascoltare",
  listeningNow: "Ascoltando ora",
  youSaid: "Hai detto",
  conversationStarters: "Frasi d'apertura",
  howToStartConversation: "Come iniziare una conversazione",
  tryThesePhrases: "Prova queste frasi:",
  conversationStarter1: "Ciao! Come va oggi?",
  conversationStarter2: "Com'è il tempo da te?",
  conversationStarter3: "Puoi raccomandare un buon ristorante?",
  conversationStarter4: "Quali sono i tuoi hobby e interessi?",
  conversationStarter5: "Raccontami del tuo libro o film preferito.",
  conversationStarter6: "Cosa hai fatto lo scorso weekend?",
  conversationStarter7: "Quali sono i tuoi piani per domani?",
  conversationStarter8: "Come si dice... in spagnolo/inglese?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "Ciao, come va oggi?",
  "What's the weather like where you are?": "Com'è il tempo da te?",
  "Can you recommend a good restaurant?": "Puoi raccomandare un buon ristorante?",
  "What are your hobbies and interests?": "Quali sono i tuoi hobby e interessi?",
  "Tell me about your favorite book or movie.": "Raccontami del tuo libro o film preferito.",
  "What did you do last weekend?": "Cosa hai fatto lo scorso weekend?",
  "What are your plans for tomorrow?": "Quali sono i tuoi piani per domani?",
  "How do you say... in Spanish/English?": "Come si dice... in spagnolo/inglese?",

  practiceWithVoiceChat: "Esercitati con la chat vocale",
  voiceChatTips: "Usa questo strumento per migliorare le tue abilità di parlato e ascolto. Ecco alcuni consigli:",
  voiceTip1: "Fai domande su argomenti quotidiani",
  voiceTip2: "Esercita frasi ed espressioni comuni",
  voiceTip3: "Descrivi quello che vedi intorno a te",
  voiceTip4: "Esercita il vocabolario per argomenti specifici come viaggi o cibo",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "Usa questo strumento per migliorare le tue abilità di parlato e ascolto. Ecco alcuni consigli:",
  "Ask questions about everyday topics": "Fai domande su argomenti quotidiani",
  "Practice common phrases and expressions": "Esercita frasi ed espressioni comuni",
  "Describe what you see around you": "Descrivi quello che vedi intorno a te",
  "Practice vocabulary for specific topics like travel or food": "Esercita il vocabolario per argomenti specifici come viaggi o cibo",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "Inizia a parlare per vedere la trascrizione",
  clickMicrophoneToStartRecording: "Clicca sul microfono per iniziare la registrazione",

  // Premium Voice Chat
  premiumVoiceChat: "Chat Vocale Premium",
  premiumVoiceChatBenefits: "Vantaggi della Chat Vocale Premium",
  premiumVoiceChatDescription: "Esercita {{practice}} in conversazioni vocali naturali con un tutor AI premium! L'AI ti aiuterà a migliorare grammatica, vocabolario e pronuncia.",
  premiumVoiceNote: "La Chat Vocale Premium è limitata a 10 minuti a settimana",
  premiumVoiceNoteWithReset: "La Chat Vocale Premium fornisce 10 minuti di esercizio a settimana. Il tempo si resetta ogni lunedì alle 6:00 (Ora Centrale).",
  benefitNaturalVoice: "Interazione vocale naturale simile a quella umana con tecnologia ElevenLabs",
  benefitAccentPronunciation: "Pronuncia e accento accurati per un apprendimento profondo",
  benefitRegularPractice: "10 minuti di esercizio a settimana, reset ogni lunedì alle 6:00",

  // Pronunciation practice
  pronunciationPractice: "Esercizio di pronuncia",
  improvePronunciationSkillsWith: "Migliora le tue abilità di pronuncia con esercizi mirati",
  selectComplexityLevel: "Seleziona livello di complessità",
  chooseDifficultyLevelBasedOn: "Scegli il livello di difficoltà basato sulla tua competenza linguistica",
  speechRate: "Velocità del parlato",
  selectLevelToStart: "Seleziona livello per iniziare l'esercizio",
  startExercise: "Inizia esercizio",
  pronunciationPracticeTips: "Consigli per l'esercizio di pronuncia",
  listenCarefullyTip: "Ascolta attentamente prima di provare a parlare",
  payAttentionToStressTip: "Fai attenzione allo stress e all'intonazione",
  practiceDifficultSoundsTip: "Esercita i suoni difficili più volte",
  recordYourselfTip: "Registra te stesso e confronta con parlanti nativi",
  bePatientTip: "Sii paziente — migliorare la pronuncia richiede tempo",
  practiceExercise: "Esercizio di pratica",
  topic: "Argomento",
  listenToPhrase: "Ascolta la frase",
  clickWordToHear: "Clicca la parola per sentirla",
  yourPronunciation: "La tua pronuncia",
  startRecording: "Inizia registrazione",
  clickStartToRecord: "Clicca 'Inizia' per registrare",
  tryAgain: "Riprova",
  newPhrase: "Nuova frase",
  generatingExercise: "Generazione esercizio",
  generatingNewPhrase: "Generazione nuova frase",
  levelDescription: "Descrizione livello",
  failedToGeneratePhrase: "Impossibile generare frase",
  noSpeechDetected: "Nessun parlato rilevato",
  pleaseTryAgain: "Per favore riprova",
  failedToAnalyzePronunciation: "Impossibile analizzare la pronuncia",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "Feedback pronuncia",
  accuracyScore: "Punteggio accuratezza",
  intonationScore: "Punteggio intonazione",
  fluencyScore: "Punteggio fluidità",
  complexityScore: "Punteggio complessità",
  wordAnalysis: "Analisi parole",
  phonemeAnalysis: "Analisi fonemi",
  overallFeedback: "Feedback generale",
  excellent: "Eccellente",
  good: "Buono",
  fair: "Discreto",
  needsImprovement: "Necessita miglioramento",

  // Additional UI elements
  processing: "Elaborazione",
  stopRecording: "Ferma registrazione",
  listeningToYou: "Ti sto ascoltando",
  realTimeTranscription: "Trascrizione in tempo reale",
  yourTranscription: "La tua trascrizione",
  playing: "Riproduzione",

  // Complexity levels
  novice: "Principiante",
  intermediate: "Intermedio",
  advanced: "Avanzato",
  superior: "Eccellente",
  noviceLevelDescription: "Può gestire argomenti semplici e familiari",
  intermediateLevelDescription: "Può discutere argomenti familiari",
  advancedLevelDescription: "Può gestire argomenti complessi con fiducia",
  superiorLevelDescription: "Può eseguire tutte le funzioni linguistiche",
  noviceLevelShortDescription: "Frasi semplici",
  intermediateLevelShortDescription: "Argomenti familiari",
  advancedLevelShortDescription: "Argomenti complessi",
  superiorLevelShortDescription: "Tutte le funzioni",

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
