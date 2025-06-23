
import { TranslationRecord } from "../types";

const practiceTranslations: TranslationRecord = {
  // Core practice functionality
  "practice": "Práctica",
  "startConversation": "Iniciar Conversación",
  "startChatting": "¡Comienza a chatear con tu tutor de IA de idiomas!",
  "chatPlaceholder": "Escribe tu mensaje para practicar {targetLanguage}...",
  "errorSendingMessage": "Error al enviar mensaje. Por favor inténtalo de nuevo.",
  "emptyMessage": "No se puede enviar mensaje vacío",
  "sendingMessage": "Enviando mensaje...",
  "practiceGuide": "Guía de Práctica",
  "practiceTip1": "Trata de formar oraciones completas, aunque sean simples.",
  "practiceTip2": "¡No te preocupes por los errores — son parte del aprendizaje!",
  "practiceTip3": "Pide explicaciones si hay algo que no entiendas.",
  "practiceTip4": "Usa palabras que hayas aprendido recientemente.",
  "practiceTip5": "Nuestra IA se adaptará a tu nivel de habilidad y te ayudará a mejorar gradualmente.",
  "startConversationIn": "Iniciar conversación en {language}",
  "typeMessageIn": "Escribe mensaje en {language}...",
  "translationNotAvailable": "Traducción no disponible para {language}",
  "contentFiltered": "Contenido filtrado por seguridad",
  "networkConnectionIssue": "Problema de conexión de red. Por favor inténtalo de nuevo.",
  "send": "Enviar",
  "error": "Error",
  "failedToGetTranslation": "Error al obtener traducción. Por favor inténtalo de nuevo.",
  "translationError": "Error de Traducción",
  "startTextChatting": "Comenzar chat de texto",
  "typeMessageBelow": "Escribe un mensaje abajo",
  "realTimeTranscription": "Transcripción en tiempo real",
  
  // Language metrics and analysis
  "viewLanguageMetrics": "Ver Métricas de Idioma",
  "hideMetrics": "Ocultar Métricas",
  "languageMetrics": "Métricas de Idioma",
  "grammarAccuracy": "Precisión Gramatical",
  "conversationComplexity": "Complejidad de Conversación",
  "vocabularyDiversity": "Diversidad de Vocabulario",
  "basedOnMessagesCount": "Basado en {count} mensajes",
  "analyzeConversation": "Analizar Conversación",
  "analyzing": "Analizando...",
  "analyzingConversation": "Analizando tu conversación...",
  "noLanguageDataYet": "Aún no hay datos de idioma. Haz clic en el botón de abajo para analizar tu conversación.",
  "notEnoughMessages": "No hay suficientes mensajes",
  "needMoreMessagesToAnalyze": "Necesitas al menos 4 mensajes para analizar tu conversación.",
  "failedToAnalyzeConversation": "Error al analizar conversación. Por favor inténtalo de nuevo.",
  
  // Grammar correction toggle
  "correctGrammar": "Corregir mi gramática",
  "grammarCorrectionEnabled": "Corrección gramatical habilitada",
  "grammarCorrectionDisabled": "Corrección gramatical deshabilitada",
  "tutor.willCorrectGrammar": "El tutor ahora proporcionará correcciones gentiles a tu gramática.",
  "tutor.wontCorrectGrammar": "El tutor se enfocará en el flujo de conversación sin correcciones gramaticales.",
  
  // Chat management
  "clearConversation": "Limpiar Conversación",
  "conversationCleared": "Conversación limpiada",
  "success": "Éxito",
  
  // Empty states and warnings
  "emptyMessageReceived": "Mensaje vacío recibido",
  "someContentWasFiltered": "Parte del contenido fue filtrado por seguridad",
  
  // Loading and status indicators
  "processing": "Procesando...",
  "retrying": "Reintentando...",
  "connecting": "Conectando...",
  "thinking": "Pensando...",
  "generating": "Generando...",
  
  // Audio and TTS functionality
  "play": "Reproducir",
  "playAudio": "Reproducir Audio",
  "playTargetLanguageAudio": "Reproducir audio del idioma objetivo",
  "playNativeLanguageAudio": "Reproducir audio del idioma nativo",
  "failedToPlayAudio": "Error al reproducir audio",
  "audioNotSupported": "Audio no soportado",
  "ttsError": "Error de texto a voz",
  
  // Hint and suggestion system
  "getResponseSuggestions": "Obtener sugerencias de respuesta",
  "responseSuggestions": "Sugerencias de Respuesta",
  "clickPlayToHearPronunciation": "Haz clic en reproducir para escuchar la pronunciación",
  "startConversationForSuggestions": "Inicia una conversación para obtener sugerencias",
  "greetings": "Saludos",
  "questions": "Preguntas",
  "responses": "Respuestas",
  "topics": "Temas",
  "couldNotGenerateHints": "No se pudieron generar sugerencias",
  "hintGenerationFailed": "Error al generar sugerencias",
  
  // Practice prompts and starters
  "practicePrompt": "¡Hola! Me gustaría practicar conversación en {{targetLanguage}} contigo. Por favor ayúdame corrigiendo mi gramática, vocabulario y uso del {{targetLanguage}}. ¿Podemos empezar con una conversación básica?",
  "sendPracticePrompt": "Enviar Prompt de Práctica",
  "languageLearningPrompt": "Prompt de Aprendizaje de Idiomas",
  "conversationStarters": "Iniciadores de Conversación",
  "topicSuggestions": "Sugerencias de Temas",
  
  // Pronunciation practice
  "pronunciationPractice": "Práctica de Pronunciación",
  "improvePronunciationSkills": "Mejora tus habilidades de pronunciación con práctica dirigida",
  "improvePronunciationSkillsWith": "Mejora tus habilidades de pronunciación con ejercicios dirigidos en {language}",
  "practiceExercise": "Ejercicio de Práctica",
  "selectComplexityLevel": "Seleccionar Nivel de Complejidad",
  "novice": "Principiante",
  "intermediate": "Intermedio", 
  "advanced": "Avanzado",
  "superior": "Superior",
  "noviceLevelShortDescription": "Expresiones básicas y saludos",
  "intermediateLevelShortDescription": "Conversaciones simples y preguntas",
  "advancedLevelShortDescription": "Oraciones complejas y conceptos",
  "superiorLevelShortDescription": "Lenguaje académico y profesional",
  "selectLevelToStart": "Selecciona un nivel para comenzar a practicar",
  "tryAgain": "Intentar de Nuevo",
  "newPhrase": "Nueva Frase",
  "excellent": "Excelente",
  "good": "Bueno",
  "fair": "Regular",
  "needsImprovement": "Necesita Mejora",
  "excellentPronunciationFeedback": "¡Excelente! Tu pronunciación es muy precisa.",
  "goodPronunciationFeedback": "¡Buen trabajo! Tu pronunciación es mayormente precisa.",
  "fairPronunciationFeedback": "Regular. Sigue practicando para mejorar tu pronunciación.",
  "needsImprovementPronunciationFeedback": "Necesita más práctica. Enfócate en las palabras resaltadas.",
  "failedToGeneratePhrase": "Error al generar una frase de práctica. Por favor inténtalo de nuevo.",
  "failedToAnalyzePronunciation": "Error al analizar pronunciación. Por favor inténtalo de nuevo.",
  
  // Pronunciation practice interface
  "chooseDifficultyLevelBasedOn": "Elige un nivel de dificultad basado en tu competencia lingüística",
  "startExercise": "Comenzar Ejercicio",
  "generatingExercise": "Generando ejercicio...",
  "generatingNewPhrase": "Generando nueva frase...",
  "levelDescription": "Descripción del Nivel",
  "difficultyLevel": "Nivel de Dificultad",
  "noviceLevelDescription": "Expresiones básicas con vocabulario simple. Perfecto para principiantes.",
  "intermediateLevelDescription": "Frases cotidianas con vocabulario moderado. Bueno para estudiantes intermedios.",
  "advancedLevelDescription": "Oraciones complejas con vocabulario avanzado. Adecuado para estudiantes competentes.",
  "superiorLevelDescription": "Contenido académico y profesional con vocabulario especializado.",
  "pronunciationPracticeTips": "Consejos de Práctica de Pronunciación",
  "listenCarefullyTip": "Escucha cuidadosamente el audio antes de intentar hablar",
  "payAttentionToStressTip": "Presta atención a los patrones de estrés y entonación",
  "practiceDifficultSoundsTip": "Practica sonidos difíciles múltiples veces",
  "recordYourselfTip": "Grábate y compara con hablantes nativos",
  "bePatientTip": "Ten paciencia - la mejora de pronunciación toma tiempo",
  "listenToPhrase": "Escuchar frase",
  "playing": "Reproduciendo...",
  "topic": "Tema",
  "clickWordToHear": "Haz clic en una palabra para escucharla",
  
  // Recording functionality
  "clickStartToRecord": "Haz clic en 'Comenzar Grabación' para empezar",
  "startRecording": "Comenzar Grabación",
  "stopRecording": "Detener Grabación",
  "yourPronunciation": "Tu Pronunciación",
  "listeningToYou": "Escuchándote...",
  "loading": "Cargando...",
  "microphoneAccessRequired": "Acceso al Micrófono Requerido",
  "allowMicAccess": "Por favor permite el acceso al micrófono para usar esta función",
  "microphoneAccessFailed": "Error al acceder al micrófono",
  "speechRecognitionError": "Error de Reconocimiento de Voz",
  "speechRecognitionNotSupported": "El reconocimiento de voz no es compatible con tu navegador",
  "noSpeechDetected": "No se Detectó Voz",
  "pleaseTryAgain": "Por favor inténtalo de nuevo",
  
  // Chat interface
  "messageCouldNotBeSent": "El mensaje no pudo ser enviado",
  "pleaseTypeMessage": "Por favor escribe un mensaje",
  "typeYourMessage": "Escribe tu mensaje...",
  "messageIsBeingSent": "El mensaje se está enviando...",
  "chatInputPlaceholder": "Escribe tu mensaje de práctica aquí...",
  "enterToSend": "Presiona Enter para enviar",
  "shiftEnterNewLine": "Shift+Enter para nueva línea",
  
  // Message content and translation
  "originalMessage": "Mensaje Original",
  "translatedMessage": "Mensaje Traducido",
  "showTranslation": "Mostrar Traducción",
  "hideTranslation": "Ocultar Traducción",
  "translationUnavailable": "Traducción no disponible",
  "translationFailed": "Error en traducción",
  
  // Practice guide and tips
  "practiceGuideDescription": "Aquí tienes algunos consejos para aprovechar al máximo tu práctica de {language}:",
  "practiceGuideItem1": "Trata de formar oraciones completas, aunque sean simples.",
  "practiceGuideItem2": "¡No te preocupes por cometer errores — son parte del aprendizaje!",
  "practiceGuideItem3": "Pide aclaraciones si no entiendes algo.",
  "practiceGuideItem4": "Trata de usar vocabulario que hayas aprendido recientemente.",
  "practiceDisclaimer": "Nuestra IA se adaptará a tu nivel de habilidad y te ayudará a mejorar gradualmente.",
  
  // Voice chat functionality
  "startVoiceChat": "Iniciar Chat de Voz",
  "stopVoiceChat": "Detener Chat de Voz",
  "voiceChatActive": "Chat de voz activo",
  "voiceChatInactive": "Chat de voz inactivo",
  "clickToStartVoice": "Haz clic en 'Iniciar Chat de Voz' para comenzar a hablar con el tutor",
  "voiceChatNotSupported": "El chat de voz no es compatible con tu navegador",
  "voiceRecognitionError": "Error de reconocimiento de voz",
  
  // Practice session management
  "practiceSession": "Sesión de Práctica",
  "practiceComplete": "Práctica Completada",
  "practiceScore": "Puntuación de Práctica",
  "practiceTime": "Tiempo de Práctica",
  "practiceProgress": "Progreso de Práctica",
  "sessionSaved": "Sesión guardada",
  "sessionEnded": "Sesión terminada",
  
  // Skills assessment
  "getSkillsAssessment": "Obtener Evaluación de Habilidades",
  "skillsAssessment": "Evaluación de Habilidades",
  "reading": "Lectura",
  "writing": "Escritura",
  "speaking": "Habla",
  "listening": "Escucha",
  "overallLevel": "Nivel General",
  "assessmentComplete": "Evaluación Completada",
  "assessmentInProgress": "Evaluación en progreso",
  
  // Additional practice features
  "practiceWithTextChat": "Practicar Con Chat de Texto",
  "textConversationPractice": "Práctica de Conversación de Texto",
  "noticeTextBasedPractice": "Aviso: Esta es una función de práctica basada en texto. Para práctica de voz, prueba nuestras funciones de Chat de Voz Ilimitado o Chat de Voz Premium.",
  "sendEnglishPracticePrompt": "Enviar Prompt de Práctica en Inglés",
  "askAboutGrammarRules": "Preguntar sobre reglas gramaticales",
  "practiceConversationsDifferentSituations": "Practicar conversaciones en diferentes situaciones",
  "learnNewVocabulary": "Aprender nuevo vocabulario",
  "discussCulturalTopics": "Discutir temas culturales",
  "practiceConversation": "Práctica de Conversación",
  
  // Error handling
  "somethingWentWrong": "Algo salió mal",
  "tryRefreshing": "Intenta refrescar la página",
  "connectionLost": "Conexión perdida",
  "reconnecting": "Reconectando...",
  "requestTimeout": "Tiempo de espera de solicitud agotado",
  "serverError": "Error del servidor",
  "unknownError": "Ocurrió un error desconocido"
};

export default practiceTranslations;
