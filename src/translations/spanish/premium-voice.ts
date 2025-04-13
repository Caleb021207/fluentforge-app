
import { TranslationRecord } from "../types";

const premiumVoiceTranslations: TranslationRecord = {
  premiumVoiceChat: "Chat de Voz Premium",
  premiumVoiceChatBenefits: "Beneficios de Voz Premium",
  textConversationPractice: "Práctica de Conversación por Texto",
  cefrA1Description: "Principiante - Frases y expresiones básicas",
  cefrA2Description: "Elemental - Comunicación cotidiana simple",
  cefrB1Description: "Intermedio - Puede discutir temas conocidos",
  cefrB2Description: "Intermedio Alto - Puede interactuar con fluidez",
  beginner: "Principiante",
  elementary: "Elemental", 
  intermediate: "Intermedio",
  upperIntermediate: "Intermedio Alto",
  selectCEFRLevel: "Seleccionar Nivel CEFR",
  selectedLevel: "Nivel Seleccionado",
  
  // Fixed premium voice chat cooldown messages
  cooldownPeriodActive: "Límite Semanal Alcanzado",
  cooldownActive: "Límite Semanal Alcanzado",
  waitBeforeNextSession: "Necesitas esperar antes de iniciar otra sesión",
  cooldownPeriodDescription: "Debes esperar {{time}} antes de iniciar otra sesión de chat de voz premium.",
  resetsAt6AM: "Tu tiempo semanal de 10 minutos se reiniciará en {{time}} (Lunes a las 6:00 AM)",
  dailyLimitReached: "Has usado tu asignación semanal de 10 minutos. El tiempo se reiniciará el lunes a las 6:00 AM.",
  
  // Login related messages
  loginRequired: "Inicio de Sesión Requerido",
  pleaseLoginToAccessPremiumFeature: "Por favor inicia sesión para acceder a la función de chat de voz premium",
  redirectingToLogin: "Redirigiendo a la página de inicio de sesión",
  failedToStartSession: "Error al iniciar sesión",
  failedToCreateSession: "Error al crear la sesión",
  loginRequiredDescription: "Para acceder a la función de chat de voz premium, por favor inicia sesión en tu cuenta.",
  
  // Success messages
  conversationHistoryCleared: "Historial de conversación borrado",
  remaining: "restantes esta semana",
  
  // Premium voice benefits
  premiumVoiceChatDescription: "¡Ten conversaciones de voz naturales con nuestro tutor de IA premium para practicar {{practice}}! La IA te ayudará a corregir tu gramática, vocabulario y pronunciación.",
  premiumVoiceNote: "El uso del chat de voz premium está limitado a una sesión de 10 minutos cada semana",
  premiumVoiceNoteWithReset: "El chat de voz premium permite 10 minutos de tiempo de práctica semanalmente. Tu tiempo se reinicia cada lunes a las 6:00 AM hora central.",
  benefitNaturalVoice: "Interacciones de voz naturales y humanas con tecnología ElevenLabs",
  benefitAccentPronunciation: "Acento y pronunciación precisos para un aprendizaje inmersivo",
  benefitRegularPractice: "10 minutos de tiempo de práctica semanal, reiniciándose cada lunes a las 6:00 AM hora central",
  
  // Added voice chat controls
  startVoiceChat: "Iniciar Chat de Voz",
  stopVoiceChat: "Detener Chat de Voz",
  voiceChatEnded: "Chat de Voz Finalizado",
  timeLimit10MinReached: "Límite de tiempo de 10 minutos alcanzado",
  speaking: "Hablando...",
  startChatting: "Comenzar a Chatear",
  
  // Added missing key
  premiumSessionLimitReached: "Límite de Sesión Premium Alcanzado"
};

export default premiumVoiceTranslations;
