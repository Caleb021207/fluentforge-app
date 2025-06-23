import { MASTER_TRANSLATION_KEYS } from "./translationValidator";

// AI-powered translation templates for each language
export const LANGUAGE_TRANSLATION_TEMPLATES = {
  spanish: {
    // Core translations
    welcomeToLanguageLearning: "Bienvenido a Palavox",
    yourPersonalAICompanion: "Tu compañero personal de IA para un aprendizaje efectivo",
    welcomeMessage: "¡Bienvenido a la aplicación de aprendizaje de idiomas Palavox!",
    pageNotFound: "Página no encontrada",
    networkConnectionIssue: "Problema de conexión de red",
    pleaseWait: "Por favor espera",
    sessionExpired: "Tu sesión ha expirado. Por favor, inicia sesión nuevamente.",
    cooldownActive: "Tiempo de espera activo",
    dailyLimitReached: "Límite diario alcanzado",
    loginRequired: "Inicio de sesión requerido",
    failedToCreateSession: "Falló al crear la sesión",
    cefrB1Description: "Intermedio - Puede discutir temas familiares",
    speechSynthesisNotSupported: "La síntesis de voz no es compatible con tu navegador",

    // UI Elements
    signIn: "Iniciar Sesión",
    createAccount: "Crear Cuenta",
    goToDashboard: "Ir al Panel de Control",
    practiceWithAI: "Practicar con IA",
    processing: "Procesando...",
    error: "Error",
    send: "Enviar",
    cancel: "Cancelar",
    success: "Éxito",
    home: "Inicio",
    practice: "Práctica",
    vocabulary: "Vocabulario",
    lessons: "Lecciones",
    certificates: "Certificados",
    progress: "Progreso",
    settings: "Configuración",
    profile: "Perfil",
    help: "Ayuda",
    about: "Acerca de",
    contact: "Contacto",
    logout: "Cerrar Sesión",
    voiceChat: "Chat de Voz",
    premiumVoiceChat: "Chat de Voz Premium",
    startingUp: "Iniciando...",
    login: "Iniciar Sesión",
    signup: "Registrarse",
    submit: "Enviar",
    save: "Guardar",
    edit: "Editar",
    delete: "Eliminar",
    loading: "Cargando...",
    warning: "Advertencia",
    info: "Información",
    confirmation: "Confirmación",
    yes: "Sí",
    no: "No",
    ok: "OK",
    next: "Siguiente",
    previous: "Anterior",
    back: "Atrás",
    finish: "Finalizar",
    restart: "Reiniciar",
    language: "Idioma",
    search: "Buscar",
    filter: "Filtrar",
    sort: "Ordenar",
    all: "Todos",
    none: "Ninguno",
    startConversationIn: "Iniciar Conversación en {{language}}",

    // Navigation
    textPractice: "Práctica de Texto",
    unlimitedVoicePractice: "Práctica de Voz Ilimitada",
    accuracy: "Precisión",
    classes: "Clases",
    teacherClasses: "Clases de Profesor",
    studentClass: "Clase de Estudiante",
    switchLanguage: "Cambiar Idioma",
    termsOfService: "Términos de Servicio",
    privacyPolicy: "Política de Privacidad",
    cookiePolicy: "Política de Cookies",
    accessibilityStatement: "Declaración de Accesibilidad",
    pronunciationPractice: "Práctica de Pronunciación",
    aiAnalysis: "Análisis de IA",
    premium: "Premium",
    register: "Registrarse",

    // AI Analysis (keeping existing translations)
    aiProgressAnalysis: "Análisis de Progreso IA",
    uploadLanguageTestTranscripts: "Sube las transcripciones de tus pruebas de idioma y obtén información impulsada por IA para acelerar tu progreso de aprendizaje.",
    totalAnalyses: "Análisis Totales",
    currentLevel: "Nivel Actual",
    latestScore: "Puntuación Más Reciente",
    uploadAndAnalyze: "Subir y Analizar",
    analysisResults: "Resultados del Análisis",
    progressTimeline: "Cronología de Progreso",
    uploadTestTranscript: "Subir Transcripción de Prueba",
    uploadLanguageTestScoreReport: "Sube tu informe de puntuación de prueba de idioma (JPEG, PNG, WebP o PDF) para análisis de IA",
    noFileChosen: "Ningún archivo elegido",
    dragDropOrClickToUpload: "Arrastra y suelta o haz clic para subir",
    supportsFileFormats: "Admite archivos JPEG, PNG, WebP y PDF de hasta 10MB",
    selectFile: "Seleccionar Archivo",
    whatOurAiCanAnalyze: "Lo que nuestro IA puede analizar:",
    overallScoresAndCefrLevels: "• Puntuaciones generales y niveles CEFR",
    individualSkillBreakdowns: "• Desglose de habilidades individuales (Lectura, Escritura, Habla, Escucha)",
    strengthsAndAreasForImprovement: "• Fortalezas y áreas de mejora",
    progressTrackingOverTime: "• Seguimiento del progreso a lo largo del tiempo",
    latestAnalysisResults: "Resultados del Análisis Más Reciente",
    reading: "Lectura",
    writing: "Escritura",
    speaking: "Habla",
    listening: "Escucha",
    detailedAnalysis: "Análisis Detallado",
    analysisBreakdown: "Desglose del Análisis",
    strengths: "Fortalezas",
    pronunciation: "Pronunciación",
    oralCommunication: "Comunicación Oral",
    areasForImprovement: "Áreas de Mejora",
    readingComprehension: "Comprensión Lectora",
    listeningComprehension: "Comprensión Auditiva",
    writtenExpression: "Expresión Escrita",
    aiRecommendations: "Recomendaciones de IA",
    focusOnImprovingReading: "Enfócate en mejorar la comprensión lectora a través de práctica de lectura extensiva.",
    engageInActiveListening: "Participa en ejercicios de escucha activa para mejorar las habilidades auditivas.",
    practiceWritingEssays: "Practica escribir ensayos e informes para mejorar la expresión escrita.",
    analysisHistory: "Historial de Análisis",
    yourPreviousAnalysisResults: "Tus {{count}} resultados de análisis anteriores",
    progressOverview: "Resumen del Progreso",
    trackLanguageLearningJourney: "Rastrea tu viaje de aprendizaje de idiomas a lo largo del tiempo",
    firstTest: "Primera Prueba",
    latestTest: "Última Prueba",
    improvement: "Mejora",
    noAnalysesYet: "Aún no hay análisis",
    uploadTranscriptToGetStarted: "Sube una transcripción para comenzar con el análisis de IA.",
  },

  french: {
    // Core translations
    welcomeToLanguageLearning: "Bienvenue chez Palavox",
    yourPersonalAICompanion: "Votre compagnon personnel IA pour un apprentissage efficace",
    welcomeMessage: "Bienvenue dans l'application d'apprentissage des langues Palavox !",
    pageNotFound: "Page non trouvée",
    networkConnectionIssue: "Problème de connexion réseau",
    pleaseWait: "Veuillez patienter",
    sessionExpired: "Votre session a expiré. Veuillez vous reconnecter.",
    cooldownActive: "Temps de récupération actif",
    dailyLimitReached: "Limite quotidienne atteinte",
    loginRequired: "Connexion requise",
    failedToCreateSession: "Échec de la création de session",
    cefrB1Description: "Intermédiaire - Peut discuter de sujets familiers",
    speechSynthesisNotSupported: "La synthèse vocale n'est pas prise en charge par votre navigateur",

    // UI Elements
    signIn: "Se connecter",
    createAccount: "Créer un compte",
    goToDashboard: "Aller au tableau de bord",
    practiceWithAI: "Pratiquer avec l'IA",
    processing: "Traitement en cours...",
    error: "Erreur",
    send: "Envoyer",
    cancel: "Annuler",
    success: "Succès",
    home: "Accueil",
    practice: "Pratique",
    vocabulary: "Vocabulaire",
    lessons: "Leçons",
    certificates: "Certificats",
    progress: "Progrès",
    settings: "Paramètres",
    profile: "Profil",
    help: "Aide",
    about: "À propos",
    contact: "Contact",
    logout: "Déconnexion",
    voiceChat: "Chat vocal",
    premiumVoiceChat: "Chat vocal premium",
    startingUp: "Démarrage...",
    login: "Connexion",
    signup: "Inscription",
    submit: "Soumettre",
    save: "Sauvegarder",
    edit: "Modifier",
    delete: "Supprimer",
    loading: "Chargement...",
    warning: "Avertissement",
    info: "Information",
    confirmation: "Confirmation",
    yes: "Oui",
    no: "Non",
    ok: "OK",
    next: "Suivant",
    previous: "Précédent",
    back: "Retour",
    finish: "Terminer",
    restart: "Redémarrer",
    language: "Langue",
    search: "Rechercher",
    filter: "Filtrer",
    sort: "Trier",
    all: "Tout",
    none: "Aucun",
    startConversationIn: "Commencer une conversation en {{language}}",
  },

  // Add more languages as needed...
};

/**
 * Generates a complete translation file template for a language
 */
export function generateTranslationFile(languageCode: string, baseLanguage: string = 'english'): string {
  const template = LANGUAGE_TRANSLATION_TEMPLATES[languageCode as keyof typeof LANGUAGE_TRANSLATION_TEMPLATES];
  
  if (!template) {
    // Generate empty template for languages we don't have translations for yet
    const emptyTemplate = MASTER_TRANSLATION_KEYS.map(key => {
      if (key.includes('.')) {
        return `  "${key}": "",`;
      }
      return `  ${key}: "",`;
    }).join('\n');

    return `import { TranslationRecord } from "../types";

const ${languageCode}Translations: TranslationRecord = {
${emptyTemplate}
};

export default ${languageCode}Translations;`;
  }

  // Generate file with existing translations
  const translations = Object.entries(template).map(([key, value]) => {
    return `  ${key}: "${value}",`;
  }).join('\n');

  return `import { TranslationRecord } from "../types";

const ${languageCode}Translations: TranslationRecord = {
${translations}
};

export default ${languageCode}Translations;`;
}

/**
 * Generates missing keys for a specific language
 */
export function generateMissingKeysForLanguage(languageCode: string, missingKeys: string[]): string {
  const template = LANGUAGE_TRANSLATION_TEMPLATES[languageCode as keyof typeof LANGUAGE_TRANSLATION_TEMPLATES];
  
  return missingKeys.map(key => {
    const translatedValue = template?.[key as keyof typeof template] || "";
    return `  ${key}: "${translatedValue}",`;
  }).join('\n');
}
