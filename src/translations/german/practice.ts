
import { TranslationRecord } from "../types";

const practiceTranslations: TranslationRecord = {
  // Practice page core
  practice: "Übung",
  practiceWithAI: "Mit KI üben",
  startChatting: "Chatten beginnen",
  clearConversation: "Unterhaltung löschen",
  correctGrammar: "Grammatik korrigieren",
  conversationLevel: "Gesprächsebene",
  basicLevel: "Grundstufe (A1-A2)",
  intermediateLevel: "Mittelstufe (B1)",
  advancedLevel: "Fortgeschritten (B2-C1)",
  conversationLevelUpdated: "Gesprächsebene aktualisiert",
  levelSetTo: "Stufe eingestellt auf",
  selectLevel: "Stufe wählen",
  grammarCorrectionEnabled: "Grammatikkorrektur aktiviert",
  grammarCorrectionDisabled: "Grammatikkorrektur deaktiviert",
  
  // Chat interface with proper interpolation
  startConversationIn: "Unterhaltung auf {{language}} beginnen",
  startTextChatting: "Text-Chat beginnen",
  
  // Practice guide with proper interpolation
  practiceGuide: "{{language}} Übungsanleitung",
  practiceGuideDescription: "Befolgen Sie diese Tipps, um Ihre {{language}}-Lernreise einfacher zu machen:",
  practiceTip1: "Versuchen Sie vollständige Sätze zu bilden, auch wenn sie einfach sind.",
  practiceTip2: "Machen Sie sich keine Sorgen über Fehler — sie sind Teil des Lernens!",
  practiceTip3: "Fragen Sie nach Erklärungen, wenn Sie etwas nicht verstehen.",
  practiceTip4: "Verwenden Sie Wörter, die Sie kürzlich gelernt haben.",
  practiceTip5: "Unsere KI wird sich an Ihr Können anpassen und Ihnen schrittweise beim Verbessern helfen.",
  
  // Chat interface
  typeYourMessageHere: "Geben Sie hier Ihre Nachricht ein...",
  typeMessageBelow: "Geben Sie unten eine Nachricht ein",
  chatPlaceholder: "Geben Sie Ihre Nachricht ein, um {{targetLanguage}} zu üben...",
  practicePrompt: "Hallo! Ich möchte Unterhaltung auf {{targetLanguage}} üben. Bitte helfen Sie mir, indem Sie meine {{targetLanguage}}-Grammatik, Wortschatz und Verwendung korrigieren. Können wir mit einer grundlegenden Unterhaltung beginnen?",
  
  // Pronunciation practice
  pronunciationPractice: "Ausspracheübung",
  improvePronunciationSkillsWith: "Verbessern Sie Ihre Aussprachefähigkeiten mit gezielten Übungen",
  selectComplexityLevel: "Komplexitätsstufe auswählen",
  chooseDifficultyLevelBasedOn: "Wählen Sie eine Schwierigkeitsstufe basierend auf Ihrer Sprachkompetenz",
  selectLevelToStart: "Wählen Sie eine Stufe zum Übungsstart",
  pronunciationPracticeTips: "Ausspracheübungstipps",
  speechRate: "Sprechgeschwindigkeit",
  
  // Pronunciation tips
  listenCarefullyTip: "Hören Sie aufmerksam zu, bevor Sie sprechen versuchen",
  payAttentionToStressTip: "Achten Sie auf Betonungsmuster und Intonation",
  practiceDifficultSoundsTip: "Üben Sie schwierige Laute mehrmals",
  recordYourselfTip: "Nehmen Sie sich auf und vergleichen Sie mit Muttersprachlern",
  bePatientTip: "Seien Sie geduldig - Ausspracheverbesserung braucht Zeit",
  
  // Pronunciation exercise interface
  practiceExercise: "Übungsaufgabe",
  topic: "Thema",
  listenToPhrase: "Phrase anhören",
  playing: "Abspielen",
  clickWordToHear: "Klicken Sie auf das Wort zum Anhören",
  tryAgain: "Erneut versuchen",
  newPhrase: "Neue Phrase",
  generatingNewPhrase: "Neue Phrase wird generiert",
  startExercise: "Übung beginnen",
  generatingExercise: "Übung wird generiert",
  levelDescription: "Stufenbeschreibung",
  
  // Pronunciation recording and feedback
  yourPronunciation: "Ihre Aussprache",
  startRecording: "Aufnahme starten",
  clickStartToRecord: "Klicken Sie zum Aufnehmen",
  listeningToYou: "Höre Ihnen zu",
  processing: "Verarbeitung",
  realTimeTranscription: "Echtzeit-Transkription",
  yourTranscription: "Ihre Transkription",
  
  // Pronunciation feedback scores
  excellent: "Ausgezeichnet",
  good: "Gut",
  fair: "Angemessen",
  needsImprovement: "Verbesserung nötig",
  accuracyScore: "Genauigkeitspunktzahl",
  intonationScore: "Intonationspunktzahl",
  fluencyScore: "Flüssigkeitspunktzahl",
  complexityScore: "Komplexitätspunktzahl",
  wordAnalysis: "Wortanalyse",
  phonemeAnalysis: "Phonemanalyse",
  overallFeedback: "Gesamtfeedback",
  
  // Complexity levels
  novice: "Anfänger",
  intermediate: "Mittelstufe",
  advanced: "Fortgeschritten",
  superior: "Überlegen",
  noviceLevelShortDescription: "Grundwörter und -phrasen",
  intermediateLevelShortDescription: "Einfache Sätze und Unterhaltungen",
  advancedLevelShortDescription: "Komplexe Ausdrücke und Ideen",
  superiorLevelShortDescription: "Anspruchsvoller Sprachgebrauch",
  
  // Voice chat
  startVoiceConversation: "Sprachunterhaltung beginnen",
  endVoiceConversation: "Sprachunterhaltung beenden",
  voiceChatActive: "Sprach-Chat aktiv",
  
  // Progress and analysis
  aiProgressAnalysis: "KI-Fortschrittsanalyse",
  uploadLanguageTestTranscripts: "Sprachtest-Transkripte hochladen",
  totalAnalyses: "Gesamtanalysen",
  currentLevel: "Aktuelles Niveau",
  latestScore: "Neueste Punktzahl",
  uploadAndAnalyze: "Hochladen und analysieren",
  analysisResults: "Analyseergebnisse",
  progressTimeline: "Fortschritts-Zeitlinie",
  uploadTestTranscript: "Test-Transkript hochladen",
  uploadLanguageTestScoreReport: "Sprachtest-Punktebericht hochladen",
  noFileChosen: "Keine Datei gewählt",
  dragDropOrClickToUpload: "Ziehen und ablegen oder zum Hochladen klicken",
  supportsFileFormats: "Unterstützt JPEG-, PNG-, WebP- und PDF-Dateien bis 10MB",
  selectFile: "Datei auswählen",
  whatOurAiCanAnalyze: "Was unsere KI analysieren kann:",
  overallScoresAndCefrLevels: "• Gesamtpunktzahlen und CEFR-Stufen",
  individualSkillBreakdowns: "• Individuelle Fertigkeitsaufschlüsselungen",
  strengthsAndAreasForImprovement: "• Stärken und Verbesserungsbereiche",
  progressTrackingOverTime: "• Fortschrittsverfolgung über Zeit",
  
  // Analysis page specific translations
  latestAnalysisResults: "Neueste Analyseergebnisse",
  detailedAnalysis: "Detaillierte Analyse",
  analysisBreakdown: "Analyseaufschlüsselung",
  strengths: "Stärken",
  areasForImprovement: "Verbesserungsbereiche",
  aiRecommendations: "KI-Empfehlungen",
  analysisHistory: "Analysehistorie",
  yourPreviousAnalysisResults: "Ihre vorherigen Analyseergebnisse",
  analysisComplete: "Analyse abgeschlossen",
  transcriptAnalyzedSuccessfully: "Ihr Transkript wurde erfolgreich analysiert!",
  
  // Hint button interface translations
  responseSuggestions: "Antwortvorschläge",
  clickPlayToHearPronunciation: "Klicken Sie auf Abspielen, um die Aussprache zu hören",
  startConversationForSuggestions: "Beginnen Sie eine Unterhaltung, um Vorschläge zu sehen",
  getResponseSuggestions: "Antwortvorschläge erhalten",
  analyzeConversation: "Konversation Analysieren",
  analyzing: "Analysiere",
  analysisLimitReached: "Analyse-Limit Erreicht",
  canOnlyAnalyzeOncePerSession: "Sie können die Konversation nur einmal pro Sitzung analysieren, um XP-Farming zu verhindern. Starten Sie eine neue Übungssitzung, um erneut zu analysieren.",
  conversationAnalysis: "Konversationsanalyse",
  grammarAccuracy: "Grammatikgenauigkeit",
  complexity: "Komplexität",
  
  // Skill names (standardized)
  reading: "Lesen",
  writing: "Schreiben",
  speaking: "Sprechen",
  listening: "Hören",
  overallLevel: "Gesamtniveau",
  
  // Practice mode selection
  startPracticing: "Mit dem Üben beginnen",
  practiceYourLanguageSkills: "Üben Sie Ihre Sprachfähigkeiten",
  choosePracticeMode: "Übungsmodus wählen",
  typeAndChat: "Tippen und chatten Sie mit Ihrem KI-Tutor",
  speakAndListen: "Sprechen und hören Sie in natürlichen Gesprächen",
  improvePronunciation: "Verbessern Sie Ihre Aussprache mit gezielten Übungen"
};

export default practiceTranslations;
