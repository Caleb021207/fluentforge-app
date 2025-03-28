import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define available languages
export const AVAILABLE_LANGUAGES = {
  english: "English",
  spanish: "Spanish",
  french: "French",
  german: "German",
  italian: "Italian",
  portuguese: "Portuguese",
  russian: "Russian",
  chinese: "Chinese",
  japanese: "Japanese",
  korean: "Korean",
};

// Define translations for each language
type Translations = {
  [key: string]: {
    [key: string]: string;
  };
};

const translations: Translations = {
  english: {
    welcomeToLanguageLearning: "Welcome to Palavox",
    yourPersonalAICompanion: "Your personal AI-powered language learning companion. Start your journey to fluency today.",
    iSpeak: "I speak:",
    iWantToLearn: "I want to learn:",
    selectYourNativeLanguage: "Select your native language",
    selectLanguageToLearn: "Select language to learn",
    saveLanguagePreferences: "Save Language Preferences",
    languagePreferencesSaved: "Language preferences saved",
    youreNowLearning: "You're now learning",
    from: "from",
    pleaseSelectBothLanguages: "Please select both languages",
    youNeedToSelectBoth: "You need to select both your native language and the language you want to learn",
    studyMaterialsComingSoon: "Study materials for learning {{targetLanguage}} from {{nativeLanguage}} are coming soon!",
    someFeaturesLimited: "Some features might be limited or unavailable.",
    signIn: "Sign In",
    createAccount: "Create Account",
    goToDashboard: "Go to Dashboard",
    practiceWithAI: "Practice with AI",
    selectYourLanguagePreferences: "Select Your Language Preferences",
    thisTestNotAvailable: "This test is not yet available for your selected language combination.",
    readyToTest: "Ready to test your conversational skills?",
    startTest: "Start Test",
    processing: "Processing...",
    pleaseLoginToTakeTest: "Please login to take the test",
    microphoneAccessRequired: "Microphone access required",
    // Practice page translations
    practiceWithAITutor: "Practice with AI Language Tutor",
    chatWithAITutor: "Chat with our AI tutor to practice your Spanish! The AI will help correct your grammar, vocabulary, and pronunciation. Feel free to ask questions about language or culture.",
    startVoiceChat: "Start Voice Chat",
    stopVoiceChat: "Stop Voice Chat",
    getSkillsAssessment: "Get Skills Assessment",
    reading: "Reading",
    writing: "Writing",
    speaking: "Speaking",
    listening: "Listening",
    overallLevel: "Overall Level",
    startChatting: "Start chatting with your AI language tutor!",
    clickToStartVoice: "Click 'Start Voice Chat' to begin speaking with the tutor",
    allowMicAccess: "Please allow microphone access to use voice features",
    send: "Send",
    typeMessage: "Type your message in English or Spanish...",
    // Certificates page
    certificationProgress: "Certification Progress",
    readingTest: "Reading Test",
    writingTest: "Writing Test",
    conversationalFluency: "Conversational Fluency",
    overallCertificate: "Overall Certificate",
    skillAssessments: "Skill Assessments",
    certificationHistory: "Certification History",
    viewDetails: "View Details",
    attemptDate: "Attempt Date",
    testType: "Test Type",
    score: "Score",
    level: "Level",
    noAttempts: "No certification attempts yet",
    takeATest: "Take a test to see your results here",
    // Progress page
    yourProgress: "Your Progress",
    lessonsCompleted: "Lessons Completed",
    throughCurriculum: "through curriculum",
    experienceAchievements: "Experience & Achievements",
    xpPoints: "XP Points",
    dailyStreak: "Daily Streak",
    days: "days",
    nextLevel: "Next Level",
    // Progress page - additional translations
    yourLearningProgress: "Your Learning Progress",
    scoreTrends: "Score Trends",
    noProgressData: "No Progress Data",
    completeTestsToSeeProgress: "Complete some certification attempts to see your progress!",
    offlineDataMayNotBeUpToDate: "You're currently offline. Data shown may not be up to date.",
    networkConnectionIssue: "Network connection issue. Unable to load your progress data.",
    problemLoadingProgressData: "There was a problem loading your progress data. Please try again later.",
    failedToLoadProgressData: "Failed to load progress data. Please try again later.",
    error: "Error",
    viewingDetails: "Viewing details",
    featureComingSoon: "This feature will be implemented in a future update.",
    recentCertificationAttempts: "Recent Certification Attempts",
    // Profile page translations
    languageLearningDashboard: "Language Learning Dashboard",
    personalInformation: "Personal Information",
    uploadPhoto: "Upload Photo",
    displayName: "Display Name",
    enterYourDisplayName: "Enter your display name",
    saveChanges: "Save Changes",
    saving: "Saving...",
    learningProgress: "Learning Progress",
    lessonProgress: "Lesson Progress",
    certificationStatus: "Certification Status",
    completed: "Completed",
    notTaken: "Not taken",
    tipsToReachGoal: "Tips to reach your goal faster:",
    practiceConsistently: "Practice consistently every day",
    completeAllCertifications: "Complete all certification attempts",
    focusOnWeakAreas: "Focus on areas where you score lowest",
    useAIConversation: "Use AI conversation practice regularly",
    cefrLevelRoadmap: "CEFR Level Roadmap",
    cefrToActflConversion: "CEFR to ACTFL Conversion",
    progressToGoal: "Progress to Goal",
    yourTestScores: "Your Test Scores",
    authRequired: "Authentication Required",
    pleaseSignInDashboard: "Please sign in to view your dashboard and track your language learning progress.",
    targetingLevel: "Targeting CEFR Level:",
    estimatedAchievement: "Estimated achievement in",
    weeks: "weeks",
    around: "around",
    learningPace: "Your current learning pace:",
    pointsPerWeek: "points per week",
    complete: "Complete",
    lastActivity: "Last activity:",
    daysStreak: "day streak! Keep it up!",
    noTargetDate: "No target date set",
    maximumLevelAchieved: "Maximum level achieved",
    targetDatePassed: "Target date has passed",
    todayIsTargetDate: "Today is the target date",
    daysRemaining: "days remaining",
    congratulations: "Congratulations!",
    reachedHighestLevel: "You've reached C2, the highest proficiency level. Keep practicing to maintain your skills!",
    current: "Current",
    target: "Target",
    addCertificationScore: "Add Certification Score",
    certificationScoreAdded: "Certification score added successfully",
    invalidScore: "Invalid Score",
    scoreMustBeNumber: "Score must be a number between 0 and 100",
    selectCertificationType: "Select certification type",
    selectLevel: "Select level",
    addingScore: "Adding Score...",
    addScore: "Add Score",
    cancel: "Cancel"
  },
  spanish: {
    welcomeToLanguageLearning: "Bienvenido a Palavox",
    yourPersonalAICompanion: "Tu compañero personal de aprendizaje de idiomas con IA. Comienza tu viaje hacia la fluidez hoy.",
    iSpeak: "Yo hablo:",
    iWantToLearn: "Quiero aprender:",
    selectYourNativeLanguage: "Selecciona tu idioma nativo",
    selectLanguageToLearn: "Selecciona el idioma a aprender",
    saveLanguagePreferences: "Guardar preferencias de idioma",
    languagePreferencesSaved: "Preferencias de idioma guardadas",
    youreNowLearning: "Ahora estás aprendiendo",
    from: "desde",
    pleaseSelectBothLanguages: "Por favor selecciona ambos idiomas",
    youNeedToSelectBoth: "Necesitas seleccionar tanto tu idioma nativo como el idioma que quieres aprender",
    studyMaterialsComingSoon: "¡Los materiales de estudio para aprender {{targetLanguage}} desde {{nativeLanguage}} estarán disponibles próximamente!",
    someFeaturesLimited: "Algunas funciones pueden estar limitadas o no disponibles.",
    signIn: "Iniciar Sesión",
    createAccount: "Crear Cuenta",
    goToDashboard: "Ir al Panel",
    practiceWithAI: "Practicar con IA",
    selectYourLanguagePreferences: "Selecciona tus preferencias de idioma",
    thisTestNotAvailable: "Esta prueba aún no está disponible para tu combinación de idiomas seleccionada.",
    readyToTest: "¿Listo para probar tus habilidades de conversación?",
    startTest: "Comenzar Prueba",
    processing: "Procesando...",
    pleaseLoginToTakeTest: "Por favor inicia sesión para realizar la prueba",
    microphoneAccessRequired: "Se requiere acceso al micrófono",
    // Practice page translations
    practiceWithAITutor: "Practica con el Tutor de Idiomas IA",
    chatWithAITutor: "Chatea con nuestro tutor de IA para practicar tu inglés. El tutor te ayudará a corregir tu gramática, vocabulario y pronunciación. Puedes hacer preguntas sobre el idioma o la cultura.",
    startVoiceChat: "Iniciar Chat de Voz",
    stopVoiceChat: "Detener Chat de Voz",
    getSkillsAssessment: "Obtener Evaluación de Habilidades",
    reading: "Lectura",
    writing: "Escritura",
    speaking: "Habla",
    listening: "Comprensión Auditiva",
    overallLevel: "Nivel General",
    startChatting: "¡Comienza a chatear con tu tutor de idiomas con IA!",
    clickToStartVoice: "Haz clic en 'Iniciar Chat de Voz' para comenzar a hablar con el tutor",
    allowMicAccess: "Por favor permite el acceso al micrófono para utilizar las funciones de voz",
    send: "Enviar",
    typeMessage: "Escribe tu mensaje en español o inglés...",
    // Certificates page
    certificationProgress: "Progreso de Certificación",
    readingTest: "Prueba de Lectura",
    writingTest: "Prueba de Escritura",
    conversationalFluency: "Fluidez Conversacional",
    overallCertificate: "Certificado General",
    skillAssessments: "Evaluaciones de Habilidades",
    certificationHistory: "Historial de Certificación",
    viewDetails: "Ver Detalles",
    attemptDate: "Fecha de Intento",
    testType: "Tipo de Prueba",
    score: "Puntuación",
    level: "Nivel",
    noAttempts: "Aún no hay intentos de certificación",
    takeATest: "Realiza una prueba para ver tus resultados aquí",
    // Progress page
    yourProgress: "Tu Progreso",
    lessonsCompleted: "Lecciones Completadas",
    throughCurriculum: "del plan de estudios",
    experienceAchievements: "Experiencia y Logros",
    xpPoints: "Puntos XP",
    dailyStreak: "Racha Diaria",
    days: "días",
    nextLevel: "Siguiente Nivel",
    // Progress page - additional translations
    yourLearningProgress: "Tu Progreso de Aprendizaje",
    scoreTrends: "Tendencias de Puntuación",
    noProgressData: "No Hay Datos de Progreso",
    completeTestsToSeeProgress: "¡Completa algunos intentos de certificación para ver tu progreso!",
    offlineDataMayNotBeUpToDate: "Estás desconectado. Los datos mostrados pueden no estar actualizados.",
    networkConnectionIssue: "Problema de conexión de red. No se pueden cargar tus datos de progreso.",
    problemLoadingProgressData: "Hubo un problema al cargar tus datos de progreso. Por favor intenta más tarde.",
    failedToLoadProgressData: "Error al cargar los datos de progreso. Por favor intenta más tarde.",
    error: "Error",
    viewingDetails: "Viendo detalles",
    featureComingSoon: "Esta función se implementará en una actualización futura.",
    recentCertificationAttempts: "Intentos de Certificación Recientes",
    // Profile page translations
    languageLearningDashboard: "Tablero de Aprendizaje de Idiomas",
    personalInformation: "Información Personal",
    uploadPhoto: "Subir Foto",
    displayName: "Nombre de Usuario",
    enterYourDisplayName: "Ingresa tu nombre de usuario",
    saveChanges: "Guardar Cambios",
    saving: "Guardando...",
    learningProgress: "Progreso de Aprendizaje",
    lessonProgress: "Progreso de Lecciones",
    certificationStatus: "Estado de Certificación",
    completed: "Completado",
    notTaken: "No realizado",
    tipsToReachGoal: "Consejos para alcanzar tu meta más rápido:",
    practiceConsistently: "Practica constantemente todos los días",
    completeAllCertifications: "Completa todos los intentos de certificación",
    focusOnWeakAreas: "Enfócate en áreas donde obtengas las puntuaciones más bajas",
    useAIConversation: "Usa la práctica de conversación con IA regularmente",
    cefrLevelRoadmap: "Mapa de Ruta de Niveles CEFR",
    cefrToActflConversion: "Conversión de CEFR a ACTFL",
    progressToGoal: "Progreso hacia la Meta",
    yourTestScores: "Tus Puntajes de Prueba",
    authRequired: "Autenticación Requerida",
    pleaseSignInDashboard: "Por favor inicia sesión para ver tu tablero y seguir tu progreso de aprendizaje de idiomas.",
    targetingLevel: "Objetivo Nivel CEFR:",
    estimatedAchievement: "Logro estimado en",
    weeks: "semanas",
    around: "alrededor del",
    learningPace: "Tu ritmo de aprendizaje actual:",
    pointsPerWeek: "puntos por semana",
    complete: "Completado",
    lastActivity: "Última actividad:",
    daysStreak: "días consecutivos! ¡Sigue así!",
    noTargetDate: "No hay fecha objetivo establecida",
    maximumLevelAchieved: "Nivel máximo alcanzado",
    targetDatePassed: "La fecha objetivo ha pasado",
    todayIsTargetDate: "Hoy es la fecha objetivo",
    daysRemaining: "días restantes",
    congratulations: "¡Felicitaciones!",
    reachedHighestLevel: "Has alcanzado C2, el nivel más alto de competencia. ¡Sigue practicando para mantener tus habilidades!",
    current: "Actual",
    target: "Objetivo",
    addCertificationScore: "Agregar Puntuación de Certificación",
    certificationScoreAdded: "Puntuación de certificación agregada exitosamente",
    invalidScore: "Puntuación Inválida",
    scoreMustBeNumber: "La puntuación debe ser un número entre 0 y 100",
    selectCertificationType: "Selecciona tipo de certificación",
    selectLevel: "Selecciona nivel",
    addingScore: "Agregando Puntuación...",
    addScore: "Agregar Puntuación",
    cancel: "Cancelar"
  },
  // Add other languages as needed
};

// Default language
export const DEFAULT_LANGUAGE = "english";

// Create context
type LocalizationContextType = {
  currentLanguage: string;
  setCurrentLanguage: (lang: string) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
};

const LocalizationContext = createContext<LocalizationContextType>({
  currentLanguage: DEFAULT_LANGUAGE,
  setCurrentLanguage: () => {},
  t: () => "",
});

// Provider component
export const LocalizationProvider = ({ children }: { children: ReactNode }) => {
  const [currentLanguage, setCurrentLanguage] = useState(DEFAULT_LANGUAGE);

  useEffect(() => {
    // Load language preference from localStorage
    const savedLanguage = localStorage.getItem("nativeLanguage");
    if (savedLanguage && translations[savedLanguage]) {
      setCurrentLanguage(savedLanguage);
    }
  }, []);

  // Translation function
  const t = (key: string, replacements?: Record<string, string>) => {
    // Get translation for current language or fallback to default
    let text = translations[currentLanguage]?.[key] || translations[DEFAULT_LANGUAGE][key] || key;
    
    // Apply replacements if any
    if (replacements) {
      Object.entries(replacements).forEach(([placeholder, value]) => {
        text = text.replace(`{{${placeholder}}}`, value);
      });
    }
    
    return text;
  };

  return (
    <LocalizationContext.Provider value={{ currentLanguage, setCurrentLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

// Custom hook for using the localization context
export const useLocalization = () => useContext(LocalizationContext);
