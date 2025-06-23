
import { TranslationRecord } from "../types";
import spanishCoreTranslations from "./core";
import spanishPracticeTranslations from "./practice";

// Create voice chat translations for Spanish
const spanishVoiceChatTranslations: TranslationRecord = {
  // Voice chat page
  "freePracticeWithVoice": "Práctica gratuita con voz",
  "startSpeaking": "Empezar a hablar",
  "listeningNow": "Escuchando ahora",
  "youSaid": "Dijiste",
  "aiResponse": "Respuesta de IA",
  "conversationStarters": "Iniciadores de conversación",
  "tryThesePhrases": "Prueba estas frases para comenzar una conversación:",
  "practiceWithVoiceChat": "Practica con chat de voz",
  "useThisTool": "Usa esta herramienta para mejorar tus habilidades de habla y escucha. Aquí tienes algunos consejos:",
  "askQuestionsAboutTopics": "Haz preguntas sobre temas cotidianos",
  "practiceEverydayPhrases": "Practica frases y expresiones comunes",
  "describeWhatYouSee": "Describe lo que ves a tu alrededor",
  "practiceVocabularyForSpecific": "Practica vocabulario para temas específicos como viajes o comida",
  "responseSuggestions": "Sugerencias de respuesta",
  "clickPlayToHear": "Haz clic en reproducir para escuchar la pronunciación",
  "startConversationToSee": "Inicia una conversación para ver sugerencias",
  
  // Conversation phrases
  "phrase1": "Hola, ¿cómo estás hoy?",
  "phrase2": "¿Cómo está el clima donde te encuentras?",
  "phrase3": "¿Puedes recomendar un buen restaurante?",
  "phrase4": "¿Cuáles son tus pasatiempos e intereses?",
  "phrase5": "Cuéntame sobre tu libro o película favorita.",
  "phrase6": "¿Qué hiciste el fin de semana pasado?",
  "phrase7": "¿Cuáles son tus planes para mañana?",
  "phrase8": "¿Cómo se dice... en inglés?",
  
  // Additional voice chat functionality
  "askQuestions": "Haz preguntas sobre temas cotidianos",
  "practiceCommonPhrases": "Practica frases y expresiones comunes",
  "browserBasedTTS": "Nota: Esto utiliza síntesis de texto a voz basada en navegador. Para calidad de voz premium con ElevenLabs, prueba nuestro Chat de Voz Premium.",
  "voiceChatEnded": "Chat de voz terminado",
  "remaining": "restante",
  "failedToGetResponse": "No se pudo obtener respuesta",
  "speechRecognitionError": "Error de reconocimiento de voz",
  "speechRecognitionNotSupported": "Tu navegador no soporta reconocimiento de voz",
  "microphoneAccessRequired": "Se requiere acceso al micrófono",
  "failedToGenerateSpeech": "No se pudo generar el habla",
  "stopListening": "Dejar de escuchar"
};

// Complete Spanish translations with practice and voice chat integration
const spanishTranslations: TranslationRecord = {
  ...spanishCoreTranslations,
  ...spanishPracticeTranslations,
  ...spanishVoiceChatTranslations
};

export default spanishTranslations;
