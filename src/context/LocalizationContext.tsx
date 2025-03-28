
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
    typeMessage: "Type your message in English or Spanish..."
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
    typeMessage: "Escribe tu mensaje en español o inglés..."
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
