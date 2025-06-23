import { TranslationRecord } from "../types";
import generalCoreTranslations from "./general-core";
import languageSelectionTranslations from "./language-selection";
import authTranslations from "./auth";
import voiceChatTranslations from "./voice-chat";
import premiumVoiceTranslations from "./premium-voice";
import ferpaTranslations from "./ferpa";
import safetyTranslations from "./safety";
import dataPrivacyTranslations from "./data-privacy";
import languageFrameworksTranslations from "./language-frameworks";
import landingAuthTranslations from "./landing-auth";
import classroomTranslations from "./classroom";
import practiceTranslations from "./practice";
import certificatesTranslations from "./certificates";
import settingsTranslations from "./settings";

// Create a minimal UI elements translation for Spanish to cover basic needs
const uiElementsTranslations: TranslationRecord = {
  signIn: "Iniciar Sesión",
  createAccount: "Crear Cuenta",
  loading: "Cargando...",
  error: "Error",
  success: "Éxito",
  submit: "Enviar",
  save: "Guardar",
  cancel: "Cancelar",
  yes: "Sí",
  no: "No",
  ok: "OK",
  home: "Inicio",
  practice: "Práctica",
  progress: "Progreso",
  certificates: "Certificados",
  profile: "Perfil",
  settings: "Configuración",
  help: "Ayuda",
  about: "Acerca de",
  signedInAs: "Conectado como",
  loginRequiredForFeature: "Se requiere iniciar sesión para esta función",
};

// Basic practice translations for Spanish
const practiceTranslations: TranslationRecord = {
  practiceYourLanguage: "Practica tu idioma",
  chatWithAI: "Chatear con IA",
  startConversationIn: "Iniciar conversación en {{language}}",
  practiceGuide: "Guía de Práctica",
  practiceGuideDescription: "Cómo usar efectivamente la práctica de idiomas",
  learningLanguageFromNative: "Aprendiendo {{targetLanguage}} desde {{nativeLanguage}}",
};

// Basic languages translations for Spanish
const languagesTranslations: TranslationRecord = {
  languages: {
    english: "Inglés",
    spanish: "Español", 
    portuguese: "Portugués",
    french: "Francés",
    japanese: "Japonés",
    korean: "Coreano",
    mandarin: "Mandarín",
    russian: "Ruso",
    arabic: "Árabe",
    hindi: "Hindi",
    vietnamese: "Vietnamita",
    ukrainian: "Ucraniano",
    indonesian: "Indonesio",
    farsi: "Farsi",
    urdu: "Urdu",
  }
};

// Combine all the translation categories
const spanishTranslations: TranslationRecord = {
  ...generalCoreTranslations,
  ...uiElementsTranslations,
  ...languageSelectionTranslations,
  ...practiceTranslations,
  ...authTranslations,
  ...voiceChatTranslations,
  ...premiumVoiceTranslations,
  ...ferpaTranslations,
  ...safetyTranslations,
  ...dataPrivacyTranslations,
  ...languageFrameworksTranslations,
  ...landingAuthTranslations,
  ...languagesTranslations,
  ...classroomTranslations,
  ...certificatesTranslations,
  ...settingsTranslations,
};

export default spanishTranslations;
