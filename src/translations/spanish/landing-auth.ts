
import { TranslationRecord } from "../types";

const landingAuthTranslations: TranslationRecord = {
  // Landing Page
  getStarted: "Comenzar",
  swipeUpToGetStarted: "Desliza hacia arriba para comenzar",
  signUp: "Registrarse",
  welcomeToLanguageLearning: "Bienvenido al Aprendizaje de Idiomas",
  yourPersonalAICompanion: "Tu Compañero Personal de IA para el Dominio del Idioma",
  startPracticing: "Comenzar a practicar",
  practiceYourLanguageSkills: "Practica tus habilidades lingüísticas",
  
  // Auth Flow
  signInToContinue: "Inicia sesión para continuar",
  createAccountToGetStarted: "Crea una cuenta para comenzar",
  email: "Correo electrónico",
  password: "Contraseña",
  accessPasscode: "Código de Acceso",
  incorrectPasscode: "Código de acceso incorrecto",
  retrying: "Reintentando",
  processing: "Procesando",
  createAccount: "Crear Cuenta",
  
  // Profile Auth
  authenticationRequired: "Autenticación Requerida",
  pleaseSignInToViewProfile: "Por favor inicia sesión para ver tu perfil",
  myProfile: "Mi Perfil",
  roleNotAssigned: "Rol No Asignado",
  pleaseUseAccessCode: "Por favor usa un código de acceso para asignar tu rol en el sistema",
  profileLoadError: "Hubo un problema al cargar los datos de tu perfil",
  
  // User Roles
  student: "Estudiante",
  teacher: "Profesor",
  administrator: "Administrador", 
  districtAdmin: "Administrador de Distrito",
  admin: "Administrador",
  district: "Administrador de Distrito",
  
  // Practice Interface
  correctGrammar: "Corregir Gramática",
  clearConversation: "Limpiar Conversación",
  authRequired: "Autenticación requerida",
  pleaseLoginToAccessThisFeature: "Por favor inicia sesión para acceder a esta función",
  
  // Navigation & Interface
  textPractice: "Práctica de Texto",
  myClasses: "Mis Clases",
  myClass: "Mi Clase",
  
  // Settings
  settings: "Configuración",
  parentalControls: "Controles Parentales",
  parentalControlsDescription: "Configurar controles parentales y ajustes de seguridad",
  safetyPolicy: "Política de Seguridad",
  
  // Auth Dialog Navigation
  dontHaveAccount: "¿No tienes una cuenta?",
  alreadyHaveAccount: "¿Ya tienes una cuenta?",
  
  // Profile Setup
  setUpProfile: "Configurar Perfil",
  welcome: "Bienvenido",
  accessCodeInstructions: "Para comenzar, necesitas un código de acceso. Estos códigos son proporcionados por tu distrito, escuela o profesor.",
  codeTypes: "Tipos de Códigos:",
  schoolAdministrator: "Administrador de Escuela",
  studentClass: "Estudiante (Clase)",
  teacherProfile: "Perfil de Profesor",
  school: "Escuela",
  role: "Rol",
  notAssigned: "No asignado",
  teachingOverview: "Resumen de Enseñanza",
  totalStudents: "Total de Estudiantes",
  classAverageScore: "Puntuación Promedio de la Clase",
  
  // Auth Dialog
  signIn: "Iniciar Sesión",
  emailPlaceholder: "Ingresa tu correo electrónico",
  passwordPlaceholder: "Ingresa tu contraseña",
  accessCodePlaceholder: "Ingresa código de acceso",
  signInButton: "Iniciar Sesión",
  createAccountButton: "Crear Cuenta",
  switchToSignUp: "Registrarse",
  switchToSignIn: "Iniciar Sesión",
  authError: "Falló la autenticación. Por favor inténtalo de nuevo.",
  
  // Language Selection
  languagePreferencesSaved: "Preferencias de Idioma Guardadas",
  learningLanguageFromNative: "Ahora estás aprendiendo {{targetLanguage}} desde {{nativeLanguage}}",
  pleaseSelectBothLanguages: "Por favor selecciona ambos idiomas",
  youNeedToSelectBoth: "Necesitas seleccionar tanto el idioma nativo como el objetivo",
  
  // Profile Page
  error: "Error",
  
  // UserInfo Component
  personalInformation: "Información Personal",
  cancel: "Cancelar",
  edit: "Editar",
  profilePicture: "Foto de Perfil",
  uploadPhoto: "Subir Foto",
  displayName: "Nombre de Usuario",
  enterDisplayName: "Ingresa tu nombre de usuario",
  saving: "Guardando...",
  saveChanges: "Guardar Cambios",
  profileInformationUpdated: "Información del perfil actualizada exitosamente",
  failedToUpdateProfile: "Error al actualizar la información del perfil. Inténtalo de nuevo.",
  profilePictureUpdated: "Foto de perfil actualizada exitosamente",
  failedToUploadProfilePicture: "Error al subir la foto de perfil",
  
  // AccessCodeInput Component
  accessCode: "Código de Acceso",
  currentStatus: "Estado Actual",
  at: "en",
  enterCode: "Ingresa Código",
  accessCodeExample: "ej: DIST123456",
  apply: "Aplicar",
  
  // AuthRequiredPrompt Component
  loginRequired: "Inicio de Sesión Requerido",
  loginRequiredDescription: "Por favor inicia sesión para acceder a esta función",
  redirectingToLogin: "Redirigiendo al inicio de sesión",
  
  // LogoutButton Component
  signOut: "Cerrar Sesión",
  logout: "Cerrar Sesión",
  loggedOutSuccessfully: "Sesión Cerrada Exitosamente",
  youHaveBeenSignedOut: "Has cerrado sesión",
  errorSigningOut: "Error al Cerrar Sesión",
  errorOccurredWhileSigningOut: "Ocurrió un error al cerrar sesión",
  
  // StudentProfile Component
  studentProfile: "Perfil de Estudiante",
  gradeLevel: "Nivel de Grado",
  studentId: "ID de Estudiante",
  graduationYear: "Año de Graduación",
  notSet: "No establecido",
  learningActivity: "Actividad de Aprendizaje",
  activeClasses: "Clases Activas",
  practiceSessions: "Sesiones de Práctica",
  voiceChatMinutes: "Minutos de Chat de Voz",
  recentGrades: "Calificaciones Recientes",
  points: "puntos",
  pending: "Pendiente",
  currentClassesAndTeachers: "Clases y Profesores Actuales",
  unnamedClass: "Clase Sin Nombre",
  noSubject: "Sin Materia",
  noCode: "Sin Código",
  currentYear: "Año Actual",
  noClassesYet: "Aún No Hay Clases",
  haventJoinedClasses: "Aún no te has unido a ninguna clase.",
  askTeacherForClassCode: "Pide a tu profesor un código de clase para comenzar.",
  
  // AdminProfile Component
  schoolDataNotAvailable: "Datos de Escuela No Disponibles",
  unableToLoadSchoolData: "No se pudieron cargar los datos de administración escolar. Contacta soporte.",
  schoolAdministratorProfile: "Perfil de Administrador Escolar",
  schoolAddress: "Dirección de la Escuela",
  notProvided: "No proporcionado",
  principal: "Director",
  schoolOverview: "Resumen de la Escuela",
  totalClasses: "Total de Clases",
  teachers: "Profesores",
  enrollments: "Inscripciones",
  avgCertScore: "Punt. Cert. Promedio",
  classroomManagement: "Gestión de Aulas",
  noPeriodAssigned: "Sin período asignado",
  students: "estudiantes",
  room: "Aula",
  tbd: "Por Determinar",
  certificationPerformance: "Rendimiento de Certificación",
  noClassesFoundInSchool: "No se encontraron clases en tu escuela",
  schoolCertificationPerformance: "Rendimiento de Certificación Escolar",
  classes: "clases",
  averageScore: "Puntuación Promedio",
  noCertificationDataAvailable: "Aún no hay datos de certificación disponibles",
  
  // DistrictProfile Component
  districtAdministratorProfile: "Perfil de Administrador de Distrito",
  districtAdministrator: "Administrador de Distrito",
  schoolsManaged: "Escuelas Gestionadas",
  districtOverview: "Resumen del Distrito",
  schools: "Escuelas",
  districtAvgScore: "Punt. Promedio del Distrito",
  schoolsPerformance: "Rendimiento de Escuelas",
  avgScore: "Punt. Promedio",
  noSchoolsFoundInDistrict: "No se encontraron escuelas en este distrito",
  
  // Common
  success: "Éxito",
  pleaseEnterAccessCode: "Por favor ingresa un código de acceso",
  failedToProcessAccessCode: "Error al procesar el código de acceso. Inténtalo de nuevo.",
};

export default landingAuthTranslations;
