import { TranslationRecord } from "../translations/types";
import { analyzeComponentFile, PRIORITY_COMPONENTS, ComponentAnalysis } from "./textExtractor";

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

  // Practice Interface
  "correctGrammar",
  "clearConversation",
  "authRequired",
  "pleaseLoginToAccessThisFeature",

  // Settings
  "parentalControls",
  "parentalControlsDescription",
  "safetyPolicy",

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

  // Language Selection
  "languagePreferencesSaved",
  "learningLanguageFromNative",
  "pleaseSelectBothLanguages",
  "youNeedToSelectBoth",

  // Auth Dialog
  "emailPlaceholder",
  "passwordPlaceholder",
  "accessCodePlaceholder",
  "signInButton",
  "createAccountButton",
  "switchToSignUp",
  "switchToSignIn",
  "authError",

  // UserInfo Component
  "personalInformation",
  "profilePicture",
  "uploadPhoto",
  "displayName",
  "enterDisplayName",
  "saving",
  "saveChanges",
  "profileInformationUpdated",
  "failedToUpdateProfile",
  "profilePictureUpdated",
  "failedToUploadProfilePicture",

  // AccessCodeInput Component
  "accessCode",
  "currentStatus",
  "at",
  "enterCode",
  "accessCodeExample",
  "apply",
  "pleaseEnterAccessCode",
  "failedToProcessAccessCode",

  // AuthRequiredPrompt Component
  "loginRequiredDescription",
  "redirectingToLogin",

  // LogoutButton Component
  "signOut",
  "loggedOutSuccessfully",
  "youHaveBeenSignedOut",
  "errorSigningOut",
  "errorOccurredWhileSigningOut",

  // StudentProfile Component
  "studentProfile",
  "gradeLevel",
  "studentId",
  "graduationYear",
  "notSet",
  "learningActivity",
  "activeClasses",
  "practiceSessions",
  "voiceChatMinutes",
  "recentGrades",
  "points",
  "pending",
  "currentClassesAndTeachers",
  "unnamedClass",
  "noSubject",
  "noCode",
  "currentYear",
  "noClassesYet",
  "haventJoinedClasses",
  "askTeacherForClassCode",

  // AdminProfile Component
  "schoolDataNotAvailable",
  "unableToLoadSchoolData",
  "schoolAdministratorProfile",
  "schoolAddress",
  "notProvided",
  "principal",
  "schoolOverview",
  "totalClasses",
  "teachers",
  "enrollments",
  "avgCertScore",
  "classroomManagement",
  "noPeriodAssigned",
  "students",
  "room",
  "tbd",
  "certificationPerformance",
  "noClassesFoundInSchool",
  "schoolCertificationPerformance",
  "classes",
  "averageScore",
  "noCertificationDataAvailable",

  // DistrictProfile Component
  "districtAdministratorProfile",
  "districtAdministrator",
  "schoolsManaged",
  "districtOverview",
  "schools",
  "districtAvgScore",
  "schoolsPerformance",
  "avgScore",
  "noSchoolsFoundInDistrict",

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
  "youreNowLearning",
  "from",
  "studyMaterialsComingSoon",
  "someFeaturesLimited",
  "selectYourLanguagePreferences",

  // Practice
  "practiceYourLanguage",
  "chatWithAI",
  "practiceGuide",
  "practiceGuideDescription",
  "practiceGuideItem1",
  "practiceGuideItem2",
  "practiceGuideItem3",
  "practiceGuideItem4",
  "practiceDisclaimer",

  // Voice Chat
  "voiceChatTitle",
  "voiceChatSubtitle",
  "startVoiceChat",
  "endVoiceChat",
  "listening",
  "recording",
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
  "confirmPassword",
  "firstName",
  "lastName",
  "forgotPassword",
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
  "preferencesUpdated",

  // Classroom Management
  "classroom",
  "classrooms", 
  "myClasses",
  "myClass",
  "joinClass",
  "createClass",
  "generateCode",
  "classCode",
  "className",
  "classDescription",
  "teacher",
  "student",
  "students",
  "teacherAccessRequired",
  "unauthorized",
  "createNewClass",
  "creatingClass",
  "creating",
  "classNameRequired",
  "errorCreatingClass",
  "classCreated",
  "classActivated",
  "classDeactivated",
  "generateClassCode",
  "copyCode",
  "copyInviteLink",
  "copied",
  "shareCodeWithStudents",
  "enterClassCode",
  "enterValidCode",
  "join",
  "joining",
  "joinedClass",
  "successJoining",
  "errorJoining",
  "invalidClassCode",
  "pleaseCheckCode",
  "classJoinCode",
  "studentsEnrolled",
  "noStudentsInClass",
  "unnamed",
  "studentName",
  "name",
  "lastActivity",
  "joinedOn",
  "joined",
  "viewStudents",
  "noStudentsEnrolled",
  "practiceTime",
  "practiceCalls",
  "practiceCallsShort",
  "voicePracticeCalls",
  "voicePracticeCallsShort",
  "premiumVoiceSessions",
  "premiumVoiceMinutes",
  "certificationAttempts",
  "highScore",
  "avgScore",
  "completedLessons",
  "voiceChatSessions",
  "voiceChatMinutes",
  "refreshMetrics",
  "refreshingMetrics",
  "refreshing",
  "studentMetricsRefreshed",
  "allMetricsRefreshed",
  "failedToRefreshMetrics",
  "active",
  "inactive",
  "activate",
  "deactivate",
  "created",
  "code",
  "room",
  "period",
  "noPeriodAssigned",
  "tbd",
  "noClassesCreated",
  "noClassJoined",
  "noClassesFound",
  "createOrJoinClass",
  "classManagement",
  "studentManagement",
  "classOverview",
  "classDetails",
  "classDashboard",
  "studentProgress",
  "viewProgress",
  "classMetrics",
  "teachingOverview",
  "totalStudents",
  "classAverageScore",
  "classSettings",
  "editClass",
  "deleteClass",
  "archiveClass",
  "restoreClass",
  "classArchived",
  "classRestored",
  "classDeleted",
  "confirmDeleteClass",
  "confirmArchiveClass",
  "exportData",
  "importStudents",
  "bulkActions",
  "selectAll",
  "deselectAll",
  "selectedStudents",
  "generateReport",
  "classReport",
  "progressReport",
  "attendanceReport",
  "errorLoadingClasses",
  "errorLoadingStudents",
  "errorUpdatingClass",
  "errorDeletingClass",
  "connectionError",
  "tryAgain",
  "classroomFeatures",
  "createAndManageVirtualClassrooms",
  "manageClassesAndTrackProgress",
  "classroomFeaturesComingSoon",

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
  "ferpaPrivacy",
  "remaining",
  "signedInAs",
  
  // Practice module keys (150+ keys)
  "practice",
  "startConversation", 
  "startChatting",
  "chatPlaceholder",
  "errorSendingMessage",
  "emptyMessage", 
  "sendingMessage",
  "practiceGuide",
  "practiceTip1",
  "practiceTip2", 
  "practiceTip3",
  "practiceTip4",
  "practiceTip5",
  "startConversationIn",
  "typeMessageIn",
  "translationNotAvailable",
  "contentFiltered",
  "networkConnectionIssue",
  "send",
  "error",
  "failedToGetTranslation",
  "translationError", 
  "startTextChatting",
  "typeMessageBelow",
  "realTimeTranscription",
  
  // Language metrics and analysis
  "viewLanguageMetrics",
  "hideMetrics",
  "languageMetrics", 
  "grammarAccuracy",
  "conversationComplexity",
  "vocabularyDiversity",
  "basedOnMessagesCount",
  "analyzeConversation",
  "analyzing",
  "analyzingConversation",
  "noLanguageDataYet",
  "notEnoughMessages",
  "needMoreMessagesToAnalyze", 
  "failedToAnalyzeConversation",
  
  // Grammar correction toggle
  "correctGrammar",
  "grammarCorrectionEnabled",
  "grammarCorrectionDisabled",
  "tutor.willCorrectGrammar",
  "tutor.wontCorrectGrammar",
  
  // Chat management
  "clearConversation",
  "conversationCleared",
  "success",
  
  // Empty states and warnings
  "emptyMessageReceived",
  "someContentWasFiltered",
  
  // Loading and status indicators
  "processing",
  "retrying", 
  "connecting",
  "thinking",
  "generating",
  
  // Audio and TTS functionality
  "play",
  "playAudio",
  "playTargetLanguageAudio",
  "playNativeLanguageAudio", 
  "failedToPlayAudio",
  "audioNotSupported",
  "ttsError",
  
  // Hint and suggestion system
  "getResponseSuggestions",
  "responseSuggestions",
  "clickPlayToHearPronunciation",
  "startConversationForSuggestions",
  "greetings",
  "questions",
  "responses",
  "topics",
  "couldNotGenerateHints",
  "hintGenerationFailed",
  
  // Practice prompts and starters
  "practicePrompt",
  "sendPracticePrompt",
  "languageLearningPrompt",
  "conversationStarters",
  "topicSuggestions",
  
  // Pronunciation practice
  "pronunciationPractice",
  "improvePronunciationSkills",
  "improvePronunciationSkillsWith",
  "practiceExercise",
  "selectComplexityLevel",
  "novice",
  "intermediate",
  "advanced", 
  "superior",
  "noviceLevelShortDescription",
  "intermediateLevelShortDescription",
  "advancedLevelShortDescription", 
  "superiorLevelShortDescription",
  "selectLevelToStart",
  "tryAgain",
  "newPhrase",
  "excellent",
  "good",
  "fair",
  "needsImprovement",
  "excellentPronunciationFeedback",
  "goodPronunciationFeedback",
  "fairPronunciationFeedback",
  "needsImprovementPronunciationFeedback",
  "failedToGeneratePhrase",
  "failedToAnalyzePronunciation",
  
  // Pronunciation practice interface
  "chooseDifficultyLevelBasedOn",
  "startExercise",
  "generatingExercise",
  "generatingNewPhrase",
  "levelDescription",
  "difficultyLevel",
  "noviceLevelDescription",
  "intermediateLevelDescription",
  "advancedLevelDescription",
  "superiorLevelDescription",
  "pronunciationPracticeTips",
  "listenCarefullyTip",
  "payAttentionToStressTip",
  "practiceDifficultSoundsTip",
  "recordYourselfTip",
  "bePatientTip",
  "listenToPhrase",
  "playing",
  "topic",
  "clickWordToHear",
  
  // Recording functionality
  "clickStartToRecord",
  "startRecording",
  "stopRecording",
  "yourPronunciation",
  "listeningToYou",
  "loading",
  "microphoneAccessRequired",
  "allowMicAccess",
  "microphoneAccessFailed",
  "speechRecognitionError",
  "speechRecognitionNotSupported",
  "noSpeechDetected",
  "pleaseTryAgain",
  
  // Chat interface
  "messageCouldNotBeSent",
  "pleaseTypeMessage",
  "typeYourMessage",
  "messageIsBeingSent",
  "chatInputPlaceholder",
  "enterToSend",
  "shiftEnterNewLine",
  
  // Message content and translation
  "originalMessage",
  "translatedMessage",
  "showTranslation",
  "hideTranslation",
  "translationUnavailable",
  "translationFailed",
  
  // Practice guide and tips
  "practiceGuideDescription",
  "practiceGuideItem1",
  "practiceGuideItem2",
  "practiceGuideItem3",
  "practiceGuideItem4",
  "practiceDisclaimer",
  
  // Voice chat functionality
  "startVoiceChat",
  "stopVoiceChat",
  "voiceChatActive",
  "voiceChatInactive",
  "clickToStartVoice",
  "voiceChatNotSupported",
  "voiceRecognitionError",
  
  // Practice session management
  "practiceSession",
  "practiceComplete",
  "practiceScore",
  "practiceTime",
  "practiceProgress",
  "sessionSaved",
  "sessionEnded",
  
  // Skills assessment
  "getSkillsAssessment",
  "skillsAssessment",
  "reading",
  "writing",
  "speaking",
  "listening",
  "overallLevel",
  "assessmentComplete",
  "assessmentInProgress",
  
  // Additional practice features
  "practiceWithTextChat",
  "textConversationPractice",
  "noticeTextBasedPractice",
  "sendEnglishPracticePrompt",
  "askAboutGrammarRules",
  "practiceConversationsDifferentSituations",
  "learnNewVocabulary",
  "discussCulturalTopics",
  "practiceConversation",
  
  // Error handling
  "somethingWentWrong",
  "tryRefreshing",
  "connectionLost",
  "reconnecting",
  "requestTimeout",
  "serverError",
  "unknownError",

  // Assessment/Certification keys (50 new keys)
  "testInstructions", "readInstructions", "timeLimit", "minutes", "questions", "difficulty",
  "beginTest", "nextQuestion", "previousQuestion", "submitTest", "confirmSubmission",
  "areYouSureSubmit", "cannotChangeAfterSubmit", "testResults", "yourScore", "passingScore",
  "congratulations", "youPassed", "keepPracticing", "retakeTest", "viewCertificate",
  "downloadCertificate", "shareResults", "cefrLevel", "a1Beginner", "a2Elementary",
  "b1Intermediate", "b2UpperIntermediate", "c1Advanced", "c2Proficient",
  "a1Description", "a2Description", "b1Description", "b2Description", "c1Description", "c2Description",
  "readingSkill", "writingSkill", "speakingSkill", "listeningSkill", "grammarSkill",
  "vocabularySkill", "pronunciationSkill", "fluencySkill", "excellentWork", "goodJob",
  "needsImprovement", "keepTrying", "almostThere", "greatProgress", "placementTest",
  "progressTest", "finalTest", "practiceTest", "mockTest",

  // Navigation keys (25 new keys)
  "dashboard", "overview", "details", "results", "menu", "search", "filter", "sort",
  "changeLanguage", "languageSettings", "support", "transcriptAnalysis",

  // Settings/Compliance keys (50 new keys)
  "generalSettings", "accountSettings", "privacySettings", "notificationSettings",
  "languageSettings", "accountInformation", "changePassword", "currentPassword",
  "newPassword", "privacyControls", "dataSettings", "safetySettings", "contentFilter",
  "ageVerification", "ferpaSettings", "ferpaCompliance", "dataConsent", "directoryInformation",
  "educationalRecords", "privacyNotice", "emailNotifications", "pushNotifications",
  "practiceReminders", "progressUpdates", "certificateNotifications", "classroomNotifications",
  "interfaceLanguage", "nativeLanguage", "targetLanguage", "translationSettings",
  "audioSettings", "voiceSettings", "reset", "apply", "update", "settingsSaved",
  "settingsError", "passwordChanged", "passwordError", "profileUpdated", "profileError"
] as const;

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
  const translations = require("@/translations").default;
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
  const translations = require("@/translations").default;
  const report: Record<string, ReturnType<typeof validateLanguageTranslations>> = {};
  
  Object.keys(translations).forEach((languageCode) => {
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
  const AVAILABLE_LANGUAGES = require("@/translations/constants").AVAILABLE_LANGUAGES;
  
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
  classroom: ["classroom", "classrooms", "myClasses", "myClass", "joinClass", "createClass", "generateCode", "classCode", "className", "classDescription", "teacher", "student", "students", "teacherAccessRequired", "unauthorized", "createNewClass", "creatingClass", "creating", "classNameRequired", "errorCreatingClass", "classCreated", "classActivated", "classDeactivated", "generateClassCode", "copyCode", "copyInviteLink", "copied", "shareCodeWithStudents", "enterClassCode", "enterValidCode", "join", "joining", "joinedClass", "successJoining", "errorJoining", "invalidClassCode", "pleaseCheckCode", "classJoinCode", "studentsEnrolled", "noStudentsInClass", "unnamed", "studentName", "name", "lastActivity", "joinedOn", "joined", "viewStudents", "noStudentsEnrolled", "practiceTime", "practiceCalls", "practiceCallsShort", "voicePracticeCalls", "voicePracticeCallsShort", "premiumVoiceSessions", "premiumVoiceMinutes", "certificationAttempts", "highScore", "avgScore", "completedLessons", "voiceChatSessions", "voiceChatMinutes", "refreshMetrics", "refreshingMetrics", "refreshing", "studentMetricsRefreshed", "allMetricsRefreshed", "failedToRefreshMetrics", "active", "inactive", "activate", "deactivate", "created", "code", "room", "period", "noPeriodAssigned", "tbd", "noClassesCreated", "noClassJoined", "noClassesFound", "createOrJoinClass", "classManagement", "studentManagement", "classOverview", "classDetails", "classDashboard", "studentProgress", "viewProgress", "classMetrics", "teachingOverview", "totalStudents", "classAverageScore", "classSettings", "editClass", "deleteClass", "archiveClass", "restoreClass", "classArchived", "classRestored", "classDeleted", "confirmDeleteClass", "confirmArchiveClass", "exportData", "importStudents", "bulkActions", "selectAll", "deselectAll", "selectedStudents", "generateReport", "classReport", "progressReport", "attendanceReport", "errorLoadingClasses", "errorLoadingStudents", "errorUpdatingClass", "errorDeletingClass", "connectionError", "tryAgain", "classroomFeatures", "createAndManageVirtualClassrooms", "manageClassesAndTrackProgress", "classroomFeaturesComingSoon"],
  accuracy: ["accuracyMetrics", "grammarAccuracy", "vocabularyDiversity", "overallAccuracy"],
} as const;
