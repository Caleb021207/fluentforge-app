
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "Willkommen beim Sprachenlernen",
  yourPersonalAICompanion: "Dein persönlicher KI-Assistent für das Sprachenlernen",
  startPracticing: "Beginne zu üben",
  practiceYourLanguageSkills: "Übe deine Sprachkenntnisse",
  swipeUpToGetStarted: "Nach oben wischen, um zu starten",
  getStarted: "Loslegen",
  selectYourLanguagePreferences: "Wähle deine Spracheinstellungen",

  // Language selection
  selectNativeLanguage: "Wähle deine Muttersprache",
  iSpeak: "Ich spreche",
  saveLanguagePreferences: "Spracheinstellungen speichern",

  // Auth
  signIn: "Einloggen",
  signUp: "Registrieren",
  signInToContinue: "Bitte einloggen, um fortzufahren",
  createAccountToGetStarted: "Konto erstellen, um zu starten",
  email: "E-Mail",
  password: "Passwort",
  accessPasscode: "Zugangscode",
  dontHaveAccount: "Noch kein Konto?",
  alreadyHaveAccount: "Schon ein Konto?",

  // Header
  loggedInAs: "Eingeloggt als",
  signedInAs: "Eingeloggt als",
  logout: "Abmelden",
  lightMode: "Heller Modus",

  // Navigation
  home: "Startseite",
  practice: "Üben",
  textPractice: "Textübung",
  unlimitedVoicePracticeNav: "Unbegrenzte Sprachübung",
  pronunciationPracticeNav: "Ausspracheübung",
  aiAnalysis: "KI-Analyse",
  profile: "Profil",
  settings: "Einstellungen",

  // Practice page
  englishPractice: "Englisch üben",
  startChatting: "Chat starten",
  startConversationIn: "Gespräch starten in {{language}}",
  fixGrammar: "Grammatik korrigieren",
  correctGrammar: "Grammatik korrigieren",
  clearConversation: "Chat löschen",
  startTextChat: "Textchat starten",
  startTextChatting: "Textchat starten",
  typeMessageBelow: "Nachricht unten eingeben",
  typeMessageToPractice: "Nachricht zum Üben in {{language}} eingeben...",
  send: "Senden",

  // Practice Guide
  practiceGuide: "{{language}} Übungsleitfaden",
  practiceGuideTitle: "{{language}} Übungsleitfaden",
  practiceGuideDescription: "Nützliche Tipps für effektives {{language}} Üben:",
  practiceGuideIntro: "Nützliche Tipps für effektives {{language}} Üben:",
  practiceGuideTip1: "Versuche vollständige Sätze zu bilden, auch wenn sie einfach sind.",
  practiceGuideTip2: "Mach dir keine Sorgen über Fehler — sie gehören zum Lernen dazu!",
  practiceGuideTip3: "Bitte um Erklärungen, wenn du etwas nicht verstehst.",
  practiceGuideTip4: "Verwende Wörter, die du kürzlich gelernt hast.",
  practiceGuideTip5: "Unsere KI passt sich an dein Können an.",

  // Practice tips - using t() keys
  practiceTip1: "Versuche vollständige Sätze zu bilden, auch wenn sie einfach sind.",
  practiceTip2: "Mach dir keine Sorgen über Fehler — sie gehören zum Lernen dazu!",
  practiceTip3: "Bitte um Erklärungen, wenn du etwas nicht verstehst.",
  practiceTip4: "Verwende Wörter, die du kürzlich gelernt hast.",
  practiceTip5: "Unsere KI passt sich an dein Können an.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "Versuche vollständige Sätze zu bilden, auch wenn sie einfach sind.",
  "Don't worry about mistakes — they're part of learning!": "Mach dir keine Sorgen über Fehler — sie gehören zum Lernen dazu!",
  "Ask for explanations if there's something you don't understand.": "Bitte um Erklärungen, wenn du etwas nicht verstehst.",
  "Use words you've learned recently.": "Verwende Wörter, die du kürzlich gelernt hast.",
  "Our AI will adapt to your skill level and gradually help you improve.": "Unsere KI passt sich an dein Können an und hilft dir schrittweise beim Verbessern.",
  "Here are some tips to get the most out of your {{language}} practice:": "Hier sind einige Tipps, um das Beste aus deinem {{language}} Übung herauszuholen:",

  // Hint button
  suggestionResponses: "Antwortvorschläge",
  responseSuggestions: "Antwortvorschläge",
  clickPlayToHearPronunciation: "Tippe auf Abspielen, um die Aussprache zu hören",
  startConversationForSuggestions: "Starte ein Gespräch, um Vorschläge zu sehen",
  startConversationToSeeSuggestions: "Starte ein Gespräch, um Vorschläge zu sehen",
  getResponseSuggestions: "Antwortvorschläge erhalten",
  greetings: "Begrüßungen",
  questions: "Fragen",
  error: "Fehler",
  couldNotGenerateHints: "Konnte keine Hinweise generieren",
  failedToPlayAudio: "Audio-Wiedergabe fehlgeschlagen",
  play: "Abspielen",

  // Voice chat
  unlimitedVoicePractice: "Unbegrenzte Sprachübung",
  practiceDescription: "Übungsbeschreibung",
  aiModelInfo: "KI-Modell-Info: OpenAI GPT-4o-mini für natürliches Sprachverständnis und -generierung, Browser-TTS für Sprachantworten.",
  practiceLevel: "Übungsstufe",
  intermediatePracticeLevel: "Mittelstufe — kann über vertraute Themen sprechen",
  "Intermediate - Can discuss familiar topics": "Mittelstufe — kann über vertraute Themen sprechen",

  // CEFR Level Descriptions
  cefrB1Description: "Mittelstufe — kann über vertraute Themen sprechen",
  cefrA1Description: "Anfänger — grundlegende Sätze und Ausdrücke",
  cefrA2Description: "Grundstufe — einfache alltägliche Unterhaltungen",
  cefrB2Description: "Obere Mittelstufe — kann mühelos kommunizieren",

  currentLanguage: "Aktuelle Sprache",
  practiceLanguage: "Übungssprache",
  startSpeaking: "Sprechen starten",
  stopListening: "Zuhören beenden",
  listeningNow: "Hört gerade zu",
  youSaid: "Du hast gesagt",
  conversationStarters: "Gesprächseinstiege",
  howToStartConversation: "Wie man ein Gespräch beginnt",
  tryThesePhrases: "Versuche diese Sätze:",
  conversationStarter1: "Hallo! Wie geht's dir heute?",
  conversationStarter2: "Wie ist heute das Wetter bei dir?",
  conversationStarter3: "Kannst du ein gutes Restaurant empfehlen?",
  conversationStarter4: "Was sind deine Hobbys und Interessen?",
  conversationStarter5: "Erzähl mir von deinem Lieblingsbuch oder -film.",
  conversationStarter6: "Was hast du letztes Wochenende gemacht?",
  conversationStarter7: "Was sind deine Pläne für morgen?",
  conversationStarter8: "Wie sagt man... auf Spanisch/Englisch?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "Hallo, wie geht's dir heute?",
  "What's the weather like where you are?": "Wie ist das Wetter bei dir?",
  "Can you recommend a good restaurant?": "Kannst du ein gutes Restaurant empfehlen?",
  "What are your hobbies and interests?": "Was sind deine Hobbys und Interessen?",
  "Tell me about your favorite book or movie.": "Erzähl mir von deinem Lieblingsbuch oder -film.",
  "What did you do last weekend?": "Was hast du letztes Wochenende gemacht?",
  "What are your plans for tomorrow?": "Was sind deine Pläne für morgen?",
  "How do you say... in Spanish/English?": "Wie sagt man... auf Spanisch/Englisch?",

  practiceWithVoiceChat: "Mit Sprach-Chat üben",
  voiceChatTips: "Verwende dieses Tool, um deine Sprech- und Hörfähigkeiten zu verbessern. Hier sind einige Tipps:",
  voiceTip1: "Stelle Fragen zu alltäglichen Themen",
  voiceTip2: "Übe häufige Phrasen und Ausdrücke",
  voiceTip3: "Beschreibe was du um dich herum siehst",
  voiceTip4: "Übe Vokabeln für spezielle Themen wie Reisen oder Essen",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "Verwende dieses Tool, um deine Sprech- und Hörfähigkeiten zu verbessern. Hier sind einige Tipps:",
  "Ask questions about everyday topics": "Stelle Fragen zu alltäglichen Themen",
  "Practice common phrases and expressions": "Übe häufige Phrasen und Ausdrücke",
  "Describe what you see around you": "Beschreibe was du um dich herum siehst",
  "Practice vocabulary for specific topics like travel or food": "Übe Vokabeln für spezielle Themen wie Reisen oder Essen",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "Sprechen starten, um Transkript zu sehen",
  clickMicrophoneToStartRecording: "Mikrofon anklicken, um Aufnahme zu starten",

  // Premium Voice Chat
  premiumVoiceChat: "Premium Sprach-Chat",
  premiumVoiceChatBenefits: "Premium Sprach-Chat Vorteile",
  premiumVoiceChatDescription: "Übe {{practice}} in natürlichen Sprachgesprächen mit einem Premium-KI-Tutor! Die KI hilft dir dabei, deine Grammatik, deinen Wortschatz und deine Aussprache zu verbessern.",
  premiumVoiceNote: "Premium Sprach-Chat ist auf 10 Minuten pro Woche begrenzt",
  premiumVoiceNoteWithReset: "Premium Sprach-Chat bietet 10 Minuten Übung pro Woche. Die Zeit wird jeden Montag um 6:00 Uhr (Central Time) zurückgesetzt.",
  benefitNaturalVoice: "Natürliche menschenähnliche Sprachinteraktion mit ElevenLabs-Technologie",
  benefitAccentPronunciation: "Genaue Aussprache und Akzent für tiefgreifendes Lernen",
  benefitRegularPractice: "10 Minuten Übung pro Woche, zurückgesetzt jeden Montag um 6:00 Uhr",

  // Pronunciation practice
  pronunciationPractice: "Ausspracheübung",
  improvePronunciationSkillsWith: "Verbessere deine Aussprache mit gezielten Übungen",
  selectComplexityLevel: "Schwierigkeitsgrad wählen",
  chooseDifficultyLevelBasedOn: "Wähle den Schwierigkeitsgrad basierend auf deinen Sprachkenntnissen",
  speechRate: "Sprechgeschwindigkeit",
  selectLevelToStart: "Wähle Stufe zum Starten der Übung",
  startExercise: "Übung starten",
  pronunciationPracticeTips: "Tipps für Ausspracheübung",
  listenCarefullyTip: "Höre aufmerksam zu, bevor du sprichst",
  payAttentionToStressTip: "Achte auf Betonung und Intonation",
  practiceDifficultSoundsTip: "Übe schwierige Laute mehrmals",
  recordYourselfTip: "Nimm dich selbst auf und vergleiche mit Muttersprachlern",
  bePatientTip: "Sei geduldig — Aussprache zu verbessern braucht Zeit",
  practiceExercise: "Übungsaufgabe",
  topic: "Thema",
  listenToPhrase: "Phrase anhören",
  clickWordToHear: "Wort anklicken zum Anhören",
  yourPronunciation: "Deine Aussprache",
  startRecording: "Aufnahme starten",
  clickStartToRecord: "Klicke 'Start' zum Aufnehmen",
  tryAgain: "Erneut versuchen",
  newPhrase: "Neue Phrase",
  generatingExercise: "Übung wird generiert",
  generatingNewPhrase: "Neue Phrase wird generiert",
  levelDescription: "Stufenbeschreibung",
  failedToGeneratePhrase: "Phrase konnte nicht generiert werden",
  noSpeechDetected: "Keine Sprache erkannt",
  pleaseTryAgain: "Bitte versuche es erneut",
  failedToAnalyzePronunciation: "Ausspracheanalyse fehlgeschlagen",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "Aussprache-Feedback",
  accuracyScore: "Genauigkeitspunktzahl",
  intonationScore: "Intonationspunktzahl",
  fluencyScore: "Fließendheitspunktzahl",
  complexityScore: "Komplexitätspunktzahl",
  wordAnalysis: "Wortanalyse",
  phonemeAnalysis: "Phonemanalyse",
  overallFeedback: "Gesamtfeedback",
  excellent: "Ausgezeichnet",
  good: "Gut",
  fair: "Ausreichend",
  needsImprovement: "Verbesserung nötig",

  // Additional UI elements
  processing: "Verarbeitung",
  stopRecording: "Aufnahme stoppen",
  listeningToYou: "Hört dir zu",
  realTimeTranscription: "Echtzeit-Transkription",
  yourTranscription: "Deine Transkription",
  playing: "Wird abgespielt",

  // Complexity levels
  novice: "Anfänger",
  intermediate: "Fortgeschritten",
  advanced: "Experte",
  superior: "Meister",
  noviceLevelDescription: "Kann mit einfachen, vertrauten Themen umgehen",
  intermediateLevelDescription: "Kann über vertraute Themen sprechen",
  advancedLevelDescription: "Kann komplexe Themen mit Vertrauen behandeln",
  superiorLevelDescription: "Kann alle Sprachfunktionen ausführen",
  noviceLevelShortDescription: "Einfache Sätze",
  intermediateLevelShortDescription: "Vertraute Themen",
  advancedLevelShortDescription: "Komplexe Themen",
  superiorLevelShortDescription: "Alle Funktionen",

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
