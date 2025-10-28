
import { TranslationRecord } from "../types";

const practiceTranslations: TranslationRecord = {
  // Practice page core
  practice: "Pratique",
  practiceWithAI: "Pratiquer avec l'IA",
  startChatting: "Commencer à discuter",
  clearConversation: "Effacer la conversation",
  correctGrammar: "Corriger la grammaire",
  conversationLevel: "Niveau de conversation",
  basicLevel: "Débutant (A1-A2)",
  intermediateLevel: "Intermédiaire (B1)",
  advancedLevel: "Avancé (B2-C1)",
  conversationLevelUpdated: "Niveau de conversation mis à jour",
  levelSetTo: "Niveau défini à",
  selectLevel: "Sélectionner le niveau",
  grammarCorrectionEnabled: "Correction grammaticale activée",
  grammarCorrectionDisabled: "Correction grammaticale désactivée",
  
  // Chat interface with proper interpolation
  startConversationIn: "Commencer une conversation en {{language}}",
  startTextChatting: "Commencer la discussion textuelle",
  
  // Practice guide with proper interpolation
  practiceGuide: "Guide de pratique {{language}}",
  practiceGuideDescription: "Suivez ces conseils pour faciliter votre parcours d'apprentissage du {{language}} :",
  practiceTip1: "Essayez de former des phrases complètes, même si elles sont simples.",
  practiceTip2: "Ne vous inquiétez pas des erreurs — elles font partie de l'apprentissage !",
  practiceTip3: "Demandez des explications si vous ne comprenez pas quelque chose.",
  practiceTip4: "Utilisez des mots que vous avez récemment appris.",
  practiceTip5: "Notre IA s'adaptera à votre niveau de compétence et vous aidera progressivement à vous améliorer.",
  
  // Chat interface
  typeYourMessageHere: "Tapez votre message ici...",
  typeMessageBelow: "Tapez un message ci-dessous",
  chatPlaceholder: "Tapez votre message pour pratiquer le {{targetLanguage}}...",
  practicePrompt: "Bonjour ! J'aimerais pratiquer la conversation en {{targetLanguage}}. Veuillez m'aider en corrigeant ma grammaire, mon vocabulaire et mon usage du {{targetLanguage}}. Pouvons-nous commencer par une conversation de base ?",
  
  // Pronunciation practice
  pronunciationPractice: "Pratique de la prononciation",
  improvePronunciationSkillsWith: "Améliorez vos compétences de prononciation avec des exercices ciblés",
  selectComplexityLevel: "Sélectionner le niveau de complexité",
  chooseDifficultyLevelBasedOn: "Choisissez un niveau de difficulté basé sur votre maîtrise linguistique",
  selectLevelToStart: "Sélectionnez un niveau pour commencer à pratiquer",
  pronunciationPracticeTips: "Conseils de pratique de la prononciation",
  speechRate: "Vitesse de parole",
  
  // Pronunciation tips
  listenCarefullyTip: "Écoutez attentivement l'audio avant d'essayer de parler",
  payAttentionToStressTip: "Prêtez attention aux modèles d'accent et d'intonation",
  practiceDifficultSoundsTip: "Pratiquez les sons difficiles plusieurs fois",
  recordYourselfTip: "Enregistrez-vous et comparez avec des locuteurs natifs",
  bePatientTip: "Soyez patient - l'amélioration de la prononciation prend du temps",
  
  // Pronunciation exercise interface
  practiceExercise: "Exercice de pratique",
  topic: "Sujet",
  listenToPhrase: "Écouter la phrase",
  playing: "En lecture",
  clickWordToHear: "Cliquez sur le mot pour entendre",
  tryAgain: "Essayer encore",
  newPhrase: "Nouvelle phrase",
  generatingNewPhrase: "Génération d'une nouvelle phrase",
  startExercise: "Commencer l'exercice",
  generatingExercise: "Génération de l'exercice",
  levelDescription: "Description du niveau",
  
  // Pronunciation recording and feedback
  yourPronunciation: "Votre prononciation",
  startRecording: "Commencer l'enregistrement",
  clickStartToRecord: "Cliquez pour commencer à enregistrer",
  listeningToYou: "Vous écoute",
  processing: "Traitement en cours",
  realTimeTranscription: "Transcription en temps réel",
  yourTranscription: "Votre transcription",
  
  // Pronunciation feedback scores
  excellent: "Excellent",
  good: "Bon",
  fair: "Passable",
  needsImprovement: "À améliorer",
  accuracyScore: "Score de précision",
  intonationScore: "Score d'intonation",
  fluencyScore: "Score de fluidité",
  complexityScore: "Score de complexité",
  wordAnalysis: "Analyse des mots",
  phonemeAnalysis: "Analyse des phonèmes",
  overallFeedback: "Commentaires généraux",
  
  // Complexity levels
  novice: "Débutant",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
  superior: "Supérieur",
  noviceLevelShortDescription: "Mots et phrases de base",
  intermediateLevelShortDescription: "Phrases simples et conversations",
  advancedLevelShortDescription: "Expressions et idées complexes",
  superiorLevelShortDescription: "Usage sophistiqué de la langue",
  
  // Voice chat
  startVoiceConversation: "Commencer une conversation vocale",
  endVoiceConversation: "Terminer la conversation vocale",
  voiceChatActive: "Chat vocal actif",
  
  // Progress and analysis
  aiProgressAnalysis: "Analyse de progression IA",
  uploadLanguageTestTranscripts: "Télécharger les transcriptions de test de langue",
  totalAnalyses: "Analyses totales",
  currentLevel: "Niveau actuel",
  latestScore: "Score le plus récent",
  uploadAndAnalyze: "Télécharger et analyser",
  analysisResults: "Résultats de l'analyse",
  progressTimeline: "Chronologie des progrès",
  uploadTestTranscript: "Télécharger la transcription de test",
  uploadLanguageTestScoreReport: "Télécharger le rapport de score de test de langue",
  noFileChosen: "Aucun fichier choisi",
  dragDropOrClickToUpload: "Glissez-déposez ou cliquez pour télécharger",
  supportsFileFormats: "Prend en charge les fichiers JPEG, PNG, WebP et PDF jusqu'à 10 Mo",
  selectFile: "Sélectionner un fichier",
  whatOurAiCanAnalyze: "Ce que notre IA peut analyser :",
  overallScoresAndCefrLevels: "• Scores globaux et niveaux CECR",
  individualSkillBreakdowns: "• Décomposition des compétences individuelles",
  strengthsAndAreasForImprovement: "• Forces et domaines d'amélioration",
  progressTrackingOverTime: "• Suivi des progrès dans le temps",
  
  // Analysis page specific translations
  latestAnalysisResults: "Derniers Résultats d'Analyse",
  detailedAnalysis: "Analyse Détaillée",
  analysisBreakdown: "Décomposition de l'Analyse",
  strengths: "Points Forts",
  areasForImprovement: "Domaines d'Amélioration",
  aiRecommendations: "Recommandations de l'IA",
  analysisHistory: "Historique des Analyses",
  yourPreviousAnalysisResults: "Vos Résultats d'Analyses Précédentes",
  analysisComplete: "Analyse Terminée",
  transcriptAnalyzedSuccessfully: "Votre transcription a été analysée avec succès !",
  
  // Hint button interface translations
  responseSuggestions: "Suggestions de Réponse",
  clickPlayToHearPronunciation: "Cliquez sur lecture pour entendre la prononciation",
  startConversationForSuggestions: "Commencez une conversation pour voir les suggestions",
  getResponseSuggestions: "Obtenir des suggestions de réponse",
  analyzeConversation: "Analyser la Conversation",
  analyzing: "Analyse en cours",
  analysisLimitReached: "Limite d'Analyse Atteinte",
  canOnlyAnalyzeOncePerSession: "Vous ne pouvez analyser la conversation qu'une fois par session pour éviter l'accumulation de XP. Commencez une nouvelle session de pratique pour analyser à nouveau.",
  conversationAnalysis: "Analyse de Conversation",
  grammarAccuracy: "Précision Grammaticale",
  complexity: "Complexité",
  
  // Skill names (standardized)
  reading: "Lecture",
  writing: "Écriture",
  speaking: "Expression orale",
  listening: "Écoute",
  overallLevel: "Niveau Global",
  
  // Practice mode selection
  startPracticing: "Commencer à Pratiquer",
  practiceYourLanguageSkills: "Pratiquez vos compétences linguistiques",
  choosePracticeMode: "Choisir le Mode de Pratique",
  typeAndChat: "Tapez et discutez avec votre tuteur IA",
  speakAndListen: "Parlez et écoutez dans des conversations naturelles",
  improvePronunciation: "Améliorez votre prononciation avec des exercices ciblés"
};

export default practiceTranslations;
