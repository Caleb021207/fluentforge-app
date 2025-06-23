
import { TranslationRecord } from "../types";
import frenchCoreTranslations from "./core";

// Create voice chat translations for French
const frenchVoiceChatTranslations: TranslationRecord = {
  // Voice chat page
  "freePracticeWithVoice": "Pratique gratuite avec la voix",
  "startSpeaking": "Commencer à parler",
  "listeningNow": "Écoute maintenant",
  "youSaid": "Vous avez dit",
  "aiResponse": "Réponse de l'IA",
  "conversationStarters": "Démarreurs de conversation",
  "tryThesePhrases": "Essayez ces phrases pour commencer une conversation :",
  "practiceWithVoiceChat": "Pratiquez avec le chat vocal",
  "useThisTool": "Utilisez cet outil pour améliorer vos compétences d'expression et d'écoute. Voici quelques conseils :",
  "askQuestionsAboutTopics": "Posez des questions sur des sujets quotidiens",
  "practiceEverydayPhrases": "Pratiquez les phrases et expressions courantes",
  "describeWhatYouSee": "Décrivez ce que vous voyez autour de vous",
  "practiceVocabularyForSpecific": "Pratiquez le vocabulaire pour des sujets spécifiques comme les voyages ou la nourriture",
  "responseSuggestions": "Suggestions de réponse",
  "clickPlayToHear": "Cliquez sur lecture pour entendre la prononciation",
  "startConversationToSee": "Commencez une conversation pour voir les suggestions",
  
  // Conversation phrases
  "phrase1": "Bonjour, comment allez-vous aujourd'hui ?",
  "phrase2": "Comment est le temps là où vous êtes ?",
  "phrase3": "Pouvez-vous recommander un bon restaurant ?",
  "phrase4": "Quels sont vos loisirs et intérêts ?",
  "phrase5": "Parlez-moi de votre livre ou film préféré.",
  "phrase6": "Qu'avez-vous fait le week-end dernier ?",
  "phrase7": "Quels sont vos plans pour demain ?",
  "phrase8": "Comment dit-on... en anglais ?",
  
  // Additional voice chat functionality
  "askQuestions": "Posez des questions sur des sujets quotidiens",
  "practiceCommonPhrases": "Pratiquez les phrases et expressions courantes",
  "browserBasedTTS": "Note : Ceci utilise la synthèse vocale basée sur le navigateur. Pour une qualité vocale premium avec ElevenLabs, essayez notre Chat Vocal Premium.",
  "voiceChatEnded": "Chat vocal terminé",
  "remaining": "restant",
  "failedToGetResponse": "Impossible d'obtenir une réponse",
  "speechRecognitionError": "Erreur de reconnaissance vocale",
  "speechRecognitionNotSupported": "Votre navigateur ne supporte pas la reconnaissance vocale",
  "microphoneAccessRequired": "Accès au microphone requis",
  "failedToGenerateSpeech": "Impossible de générer la parole",
  "stopListening": "Arrêter d'écouter"
};

// Complete French translations with voice chat integration
const frenchTranslations: TranslationRecord = {
  ...frenchCoreTranslations,
  ...frenchVoiceChatTranslations
};

export default frenchTranslations;
