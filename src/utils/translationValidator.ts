import translations from "@/translations";
import { AVAILABLE_LANGUAGES } from "@/translations/constants";

// Master list of ALL translation keys used across the application
export const MASTER_TRANSLATION_KEYS = [
  // Core/General
  "welcomeToLanguageLearning",
  "yourPersonalAICompanion",
  "welcomeMessage",
  "pageNotFound",
  "networkConnectionIssue",
  "pleaseWait",
  "sessionExpired",
  "cooldownActive",
  "dailyLimitReached",
  "loginRequired",
  "failedToCreateSession",
  "cefrB1Description",
  "speechSynthesisNotSupported",

  // UI Elements - Core Actions
  "signIn",
  "signUp",
  "createAccount",
  "goToDashboard",
  "practiceWithAI",
  "processing",
  "error",
  "send",
  "cancel",
  "success",
  "home",
  "practice",
  "vocabulary",
  "lessons",
  "certificates",
  "progress",
  "settings",
  "profile",
  "help",
  "about",
  "contact",
  "logout",
  "voiceChat",
  "premiumVoiceChat",
  "startingUp",
  "login",
  "signup",
  "submit",
  "save",
  "edit",
  "delete",
  "loading",
  "warning",
  "info",
  "confirmation",
  "yes",
  "no",
  "ok",
  "next",
  "previous",
  "back",
  "finish",
  "restart",
  "language",
  "search",
  "filter",
  "sort",
  "all",
  "none",
  "startConversationIn",

  // Navigation
  "textPractice",
  "unlimitedVoicePractice",
  "accuracy",
  "classes",
  "teacherClasses",
  "studentClass",
  "switchLanguage",
  "termsOfService",
  "privacyPolicy",
  "cookiePolicy",
  "accessibilityStatement",
  "pronunciationPractice",
  "aiAnalysis",
  "premium",
  "register",

  // Landing Page & Auth Flow
  "getStarted",
  "swipeUpToGetStarted",
  "signInToContinue",
  "createAccountToGetStarted",
  "email",
  "password",
  "accessPasscode",
  "incorrectPasscode",
  "retrying",
  "authenticationRequired",
  "pleaseSignInToViewProfile",
  "autenticacionRequerida",
  "porFavorIniciaSession",
  "miPerfil",
  "myProfile",
  "roleNotAssigned",
  "pleaseUseAccessCode",
  "dontHaveAccount",
  "alreadyHaveAccount",
  "profileLoadError",

  // Profile & User Management
  "student",
  "teacher",
  "administrator",
  "districtAdmin",
  "admin",
  "district",
  "estudiante",
  "profesor",
  "administrador",
  "distrito",

  // Practice Interface
  "correctGrammar",
  "clearConversation",
  "authRequired",
  "pleaseLoginToAccessThisFeature",

  // Settings
  "parentalControlsDescription",

  // Profile Setup & Components
  "setUpProfile",
  "welcome",
  "accessCodeInstructions",
  "codeTypes",
  "schoolAdministrator",
  "teacherProfile",
  "school",
  "role",
  "notAssigned",
  "teachingOverview",
  "totalStudents",
  "classAverageScore",

  // AI Analysis
  "aiProgressAnalysis",
  "uploadLanguageTestTranscripts",
  "totalAnalyses",
  "currentLevel",
  "latestScore",
  "uploadAndAnalyze",
  "analysisResults",
  "progressTimeline",
  "uploadTestTranscript",
  "uploadLanguageTestScoreReport",
  "noFileChosen",
  "dragDropOrClickToUpload",
  "supportsFileFormats",
  "selectFile",
  "whatOurAiCanAnalyze",
  "overallScoresAndCefrLevels",
  "individualSkillBreakdowns",
  "strengthsAndAreasForImprovement",
  "progressTrackingOverTime",
  "latestAnalysisResults",
  "reading",
  "writing",
  "speaking",
  "listening",
  "detailedAnalysis",
  "analysisBreakdown",
  "strengths",
  "pronunciation",
  "oralCommunication",
  "areasForImprovement",
  "readingComprehension",
  "listeningComprehension",
  "writtenExpression",
  "aiRecommendations",
  "focusOnImprovingReading",
  "engageInActiveListening",
  "practiceWritingEssays",
  "analysisHistory",
  "yourPreviousAnalysisResults",
  "progressOverview",
  "trackLanguageLearningJourney",
  "firstTest",
  "latestTest",
  "improvement",
  "noAnalysesYet",
  "uploadTranscriptToGetStarted",

  // Language Selection
  "iSpeak",
  "iWantToLearn",
  "selectYourNativeLanguage",
  "selectLanguageToLearn",
  "saveLanguagePreferences",
  "languagePreferencesSaved",
  "youreNowLearning",
  "from",
  "pleaseSelectBothLanguages",
  "youNeedToSelectBoth",
  "studyMaterialsComingSoon",
  "someFeaturesLimited",
  "selectYourLanguagePreferences",

  // Practice
  "practiceYourLanguage",
  "chatWithAI",
  "startConversationIn",
  "practiceGuide",
  "practiceGuideDescription",
  "practiceGuideItem1",
  "practiceGuideItem2",
  "practiceGuideItem3",
  "practiceGuideItem4",
  "practiceDisclaimer",
  "learningLanguageFromNative",

  // Voice Chat
  "voiceChatTitle",
  "voiceChatSubtitle",
  "startVoiceChat",
  "endVoiceChat",
  "listening",
  "recording",
  "processing",
  "microphonePermissionRequired",
  "microphonePermissionDenied",

  // Premium Voice
  "unlimitedVoicePractice",
  "premiumVoiceFeatures",
  "upgradeForUnlimitedAccess",

  // Certificates
  "certificationProgress",
  "readingTest",
  "writingTest",
  "conversationalFluency",
  "overallCertificate",
  "skillAssessments",
  "certificationHistory",
  "viewDetails",
  "attemptDate",
  "testType",
  "score",
  "level",
  "noAttempts",
  "takeATest",
  "thisTestNotAvailable",
  "readyToTest",
  "startTest",
  "pleaseLoginToTakeTest",

  // Progress
  "yourProgress",
  "lessonsCompleted",
  "throughCurriculum",
  "experienceAchievements",
  "xpPoints",
  "dailyStreak",
  "days",
  "nextLevel",
  "yourLearningProgress",
  "scoreTrends",
  "noProgressData",
  "takeTestToSeeProgress",
  "completeTestsToSeeProgress",
  "offlineDataMayNotBeUpToDate",
  "networkConnectionIssue",
  "problemLoadingProgressData",
  "failedToLoadProgressData",
  "viewingDetails",
  "featureComingSoon",
  "recentCertificationAttempts",
  "refresh",
  "refreshing",
  "refreshingProgressData",
  "metricsRefreshed",
  "failedToRefreshMetrics",
  "textPracticeCalls",
  "unlimitedMinutes",
  "unlimitedSessions",

  // Languages
  "languages.english",
  "languages.spanish",
  "languages.portuguese",
  "languages.french",
  "languages.japanese",
  "languages.korean",
  "languages.mandarin",
  "languages.russian",
  "languages.arabic",
  "languages.hindi",
  "languages.vietnamese",
  "languages.ukrainian",
  "languages.indonesian",
  "languages.farsi",
  "languages.urdu",

  // Auth
  "signInToAccount",
  "createNewAccount",
  "emailAddress",
  "password",
  "confirmPassword",
  "firstName",
  "lastName",
  "forgotPassword",
  "alreadyHaveAccount",
  "dontHaveAccount",
  "signingIn",
  "creatingAccount",
  "checkEmail",
  "invalidEmailPassword",
  "passwordsDoNotMatch",
  "passwordTooShort",

  // Form related
  "yourName",
  "yourEmail",
  "languagesStudied",
  "learningProgress",
  "achievements",
  "notifications",
  "savePreferences",
  "privacySettingsSaved",
  "saving",
  "saveChanges",
  "preferencesUpdated",

  // Classroom Management
  "createNewClass",
  "className",
  "creating",
  "createClass",
  "joinClass",
  "enterClassCode",
  "joining",
  "unauthorized",
  "teacherAccessRequired",
  "generateCode",
  "classActivated",
  "classDeactivated",
  "active",
  "inactive",
  "code",
  "students",
  "created",
  "activate",
  "deactivate",
  "noClassesCreated",
  "noClassJoined",
  "teacher",
  "joined",
  "classCode",
  "viewStudents",
  "noStudentsInClass",
  "name",
  "completedLessons",
  "certificationAttempts",
  "avgScore",
  "voiceChatSessions",
  "lastActivity",
  "unnamed",
  "myClasses",
  "myClass",

  // Accuracy
  "accuracyMetrics",
  "accuracyMetricsDescription",
  "trackYourLanguageProgress",
  "accuracyAnalysis",
  "signInToViewAccuracyMetrics",
  "noAccuracyDataYet",
  "practiceMoreToSeeMetrics",
  "errorFetchingAccuracyData",
  "analyzing",
  "overview",
  "trends",
  "recommendations",
  "grammarAccuracy",
  "conversationComplexity",
  "vocabularyDiversity",
  "overallAccuracy",
  "progressOverTime",
  "accuracyTrendsDescription",
  "grammarAccuracyDescription",
  "conversationComplexityDescription",
  "vocabularyDiversityDescription",
  "overallAccuracyDescription",
  "basedOnMessagesCount",
  "notEnoughDataForTrends",
  "noConversationsFound",
  "grammarRecommendations",
  "complexityRecommendations",
  "vocabularyRecommendations",
  "generalImprovementTips",
  "basedOnYourGrammarScore",
  "basedOnYourComplexityScore",
  "basedOnYourVocabularyScore",

  // Improvement recommendations
  "practiceBasisGrammarStructures",
  "focusOnSimpleSentences",
  "reviewBasicConjugations",
  "practiceIntermediateGrammar",
  "workOnSentenceVariety",
  "practiceCorrectWordOrder",
  "focusOnAdvancedGrammar",
  "practiceComplexSentenceStructures",
  "workOnSubtleGrammaticalNuances",
  "expandYourVocabulary",
  "practiceBasicDialogues",
  "trySimpleTopics",
  "engageInMoreDetailedTopics",
  "practiceExplainingConcepts",
  "tryDebatingSimpleTopics",
  "engageInAbstractDiscussions",
  "practiceArgumentativeDialogues",
  "tryMediumSpecificVocabulary",
  "learnBasicVocabulary",
  "useFlashcardsRegularly",
  "practiceEverydayWords",
  "expandTopicalVocabulary",
  "learnSynonymsAndAntonyms",
  "incorporateIdiomsAndPhrases",
  "focusOnSpecializedVocabulary",
  "learnNuancedExpressions",
  "practiceRareAndAcademicWords",
  "practiceRegularly",
  "engageInDiverseTopics",
  "reviewPastConversations",
  "setSpecificGoals",
  "useVariedPracticeFormats",

  // Additional commonly used keys
  "startChatting",
  "continue",
  "incorrectPin",
  "salesContactInfo",
  "safetyPolicyContactInfo",
  "loginRequiredForFeature",
  "parentalControls",
  "safetyPolicy",
  "ferpaPrivacy",
  "remaining",
  "signedInAs",
] as const;

// Enhanced categories for better organization
export const TRANSLATION_CATEGORIES = {
  core: ["welcomeToLanguageLearning", "yourPersonalAICompanion", "welcomeMessage", "getStarted", "swipeUpToGetStarted"],
  ui: ["signIn", "createAccount", "loading", "error", "success", "submit", "save", "cancel", "yes", "no", "ok"],
  navigation: ["home", "practice", "progress", "certificates", "profile", "settings", "help", "about"],
  landingAuth: ["signInToContinue", "createAccountToGetStarted", "email", "password", "accessPasscode", "incorrectPasscode", "retrying"],
  profile: ["authenticationRequired", "pleaseSignInToViewProfile", "myProfile", "student", "teacher", "administrator", "roleNotAssigned"],
  practiceInterface: ["correctGrammar", "clearConversation", "authRequired", "pleaseLoginToAccessThisFeature"],
  aiAnalysis: ["aiProgressAnalysis", "uploadLanguageTestTranscripts", "totalAnalyses", "analysisResults", "progressTimeline"],
  languageSelection: ["iSpeak", "iWantToLearn", "selectYourNativeLanguage", "selectLanguageToLearn"],
  practice: ["practiceYourLanguage", "chatWithAI", "startConversationIn", "practiceGuide"],
  voiceChat: ["voiceChatTitle", "startVoiceChat", "endVoiceChat", "listening", "recording"],
  certificates: ["certificationProgress", "readingTest", "writingTest", "conversationalFluency"],
  progress: ["yourProgress", "lessonsCompleted", "scoreTrends", "noProgressData"],
  auth: ["signInToAccount", "createNewAccount", "emailAddress", "forgotPassword"],
  classroom: ["createNewClass", "joinClass", "myClasses", "generateCode", "students"],
  accuracy: ["accuracyMetrics", "grammarAccuracy", "vocabularyDiversity", "overallAccuracy"],
} as const;

/**
 * Validates translation completeness for a specific language
 */
export function validateLanguageTranslations(languageCode: string): {
  isComplete: boolean;
  missingKeys: string[];
  totalKeys: number;
  foundKeys: number;
  completionPercentage: number;
} {
  const languageTranslations = translations[languageCode];
  const missingKeys: string[] = [];
  let foundKeys = 0;

  if (!languageTranslations) {
    return {
      isComplete: false,
      missingKeys: [...MASTER_TRANSLATION_KEYS],
      totalKeys: MASTER_TRANSLATION_KEYS.length,
      foundKeys: 0,
      completionPercentage: 0,
    };
  }

  MASTER_TRANSLATION_KEYS.forEach((key) => {
    if (key.includes('.')) {
      // Handle nested keys like "languages.english"
      const [parentKey, childKey] = key.split('.');
      const parentObject = languageTranslations[parentKey];
      if (parentObject && typeof parentObject === 'object' && !Array.isArray(parentObject)) {
        const nestedValue = (parentObject as Record<string, any>)[childKey];
        if (typeof nestedValue === 'string') {
          foundKeys++;
        } else {
          missingKeys.push(key);
        }
      } else {
        missingKeys.push(key);
      }
    } else {
      // Handle regular keys
      const value = languageTranslations[key];
      if (typeof value === 'string') {
        foundKeys++;
      } else {
        missingKeys.push(key);
      }
    }
  });

  const completionPercentage = Math.round((foundKeys / MASTER_TRANSLATION_KEYS.length) * 100);

  return {
    isComplete: missingKeys.length === 0,
    missingKeys,
    totalKeys: MASTER_TRANSLATION_KEYS.length,
    foundKeys,
    completionPercentage,
  };
}

/**
 * Validates all languages and returns a comprehensive report
 */
export function validateAllLanguageTranslations(): Record<string, ReturnType<typeof validateLanguageTranslations>> {
  const report: Record<string, ReturnType<typeof validateLanguageTranslations>> = {};
  
  Object.keys(AVAILABLE_LANGUAGES).forEach((languageCode) => {
    report[languageCode] = validateLanguageTranslations(languageCode);
  });

  return report;
}

/**
 * Gets languages sorted by completion percentage
 */
export function getLanguagesByCompleteness(): Array<{
  language: string;
  displayName: string;
  completionPercentage: number;
  missingKeys: number;
}> {
  const report = validateAllLanguageTranslations();
  
  return Object.entries(report)
    .map(([language, data]) => ({
      language,
      displayName: AVAILABLE_LANGUAGES[language] || language,
      completionPercentage: data.completionPercentage,
      missingKeys: data.missingKeys.length,
    }))
    .sort((a, b) => b.completionPercentage - a.completionPercentage);
}

/**
 * Generates missing translation keys for a specific category
 */
export function getMissingKeysForCategory(
  languageCode: string, 
  category: keyof typeof TRANSLATION_CATEGORIES
): string[] {
  const validation = validateLanguageTranslations(languageCode);
  const categoryKeys = TRANSLATION_CATEGORIES[category];
  
  // Create a Set for efficient lookup of category keys
  const categoryKeySet = new Set<string>(categoryKeys);
  
  return validation.missingKeys.filter(key => 
    categoryKeySet.has(key)
  );
}
