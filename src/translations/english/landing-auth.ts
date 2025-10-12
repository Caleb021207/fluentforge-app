
import { TranslationRecord } from "../types";

const landingAuthTranslations: TranslationRecord = {
  // Landing Page
  getStarted: "Get Started",
  swipeUpToGetStarted: "Swipe up to get started",
  signUp: "Sign Up",
  welcomeToLanguageLearning: "giving words a voice",
  yourPersonalAICompanion: "Your Personal AI Companion for Language Mastery",
  startPracticing: "Start Practicing",
  practiceYourLanguageSkills: "Practice your language skills",
  
  // Auth Flow
  signInToContinue: "Sign in to continue",
  createAccountToGetStarted: "Create account to get started",
  email: "Email",
  password: "Password",
  accessPasscode: "Access Passcode",
  incorrectPasscode: "Incorrect passcode",
  retrying: "Retrying",
  processing: "Processing",
  createAccount: "Create Account",
  
  // Profile Auth
  authenticationRequired: "Authentication Required",
  pleaseSignInToViewProfile: "Please sign in to view your profile",
  myProfile: "My Profile",
  roleNotAssigned: "Role Not Assigned",
  pleaseUseAccessCode: "Please use an access code to assign your role in the system",
  profileLoadError: "There was a problem loading your profile data",
  
  // User Roles
  student: "Student",
  teacher: "Teacher", 
  administrator: "Administrator",
  districtAdmin: "District Admin",
  admin: "Administrator",
  district: "District Admin",
  
  // Practice Interface
  correctGrammar: "Correct Grammar",
  clearConversation: "Clear Conversation",
  authRequired: "Authentication required",
  pleaseLoginToAccessThisFeature: "Please login to access this feature",
  
  // Navigation & Interface
  textPractice: "Text Practice",
  myClasses: "My Classes",
  myClass: "My Class",
  
  // Settings
  settings: "Settings",
  parentalControls: "Parental Controls",
  parentalControlsDescription: "Configure parental controls and safety settings",
  safetyPolicy: "Safety Policy",
  
  // Auth Dialog Navigation
  dontHaveAccount: "Don't have an account?",
  alreadyHaveAccount: "Already have an account?",
  
  // Profile Setup
  setUpProfile: "Set Up Profile",
  welcome: "Welcome",
  accessCodeInstructions: "To get started, you need an access code. These codes are provided by your district, school, or teacher.",
  codeTypes: "Code Types:",
  schoolAdministrator: "School Administrator",
  studentClass: "Student (Class)",
  teacherProfile: "Teacher Profile",
  school: "School",
  role: "Role",
  notAssigned: "Not assigned",
  teachingOverview: "Teaching Overview",
  totalStudents: "Total Students",
  classAverageScore: "Class Average Score",
  
  // Auth Dialog
  signIn: "Sign In",
  emailPlaceholder: "Enter your email",
  passwordPlaceholder: "Enter your password",
  accessCodePlaceholder: "Enter access code",
  signInButton: "Sign In",
  createAccountButton: "Create Account",
  switchToSignUp: "Sign Up",
  switchToSignIn: "Sign In",
  authError: "Authentication failed. Please try again.",
  
  // Language Selection
  languagePreferencesSaved: "Language Preferences Saved",
  learningLanguageFromNative: "You're now learning {{targetLanguage}} from {{nativeLanguage}}",
  pleaseSelectBothLanguages: "Please select both languages",
  youNeedToSelectBoth: "You need to select both native and target languages",
  
  // Profile Page
  error: "Error",
  
  // UserInfo Component
  personalInformation: "Personal Information",
  cancel: "Cancel",
  edit: "Edit",
  profilePicture: "Profile Picture",
  uploadPhoto: "Upload Photo",
  displayName: "Display Name",
  enterDisplayName: "Enter your display name",
  saving: "Saving...",
  saveChanges: "Save Changes",
  profileInformationUpdated: "Profile information updated successfully",
  failedToUpdateProfile: "Failed to update profile information. Please try again.",
  profilePictureUpdated: "Profile picture updated successfully",
  failedToUploadProfilePicture: "Failed to upload profile picture",
  
  // AccessCodeInput Component
  accessCode: "Access Code",
  currentStatus: "Current Status",
  at: "at",
  enterCode: "Enter Code",
  accessCodeExample: "e.g., DIST123456",
  apply: "Apply",
  
  // AuthRequiredPrompt Component
  loginRequired: "Login Required",
  loginRequiredDescription: "Please sign in to access this feature",
  redirectingToLogin: "Redirecting to login",
  
  // LogoutButton Component
  signOut: "Sign Out",
  logout: "Logout",
  loggedOutSuccessfully: "Logged Out Successfully",
  youHaveBeenSignedOut: "You have been signed out",
  errorSigningOut: "Error Signing Out",
  errorOccurredWhileSigningOut: "An error occurred while signing out",
  
  // StudentProfile Component
  studentProfile: "Student Profile",
  gradeLevel: "Grade Level",
  studentId: "Student ID",
  graduationYear: "Graduation Year",
  notSet: "Not set",
  learningActivity: "Learning Activity",
  activeClasses: "Active Classes",
  practiceSessions: "Practice Sessions",
  voiceChatMinutes: "Voice Chat Minutes",
  recentGrades: "Recent Grades",
  points: "points",
  pending: "Pending",
  currentClassesAndTeachers: "Current Classes & Teachers",
  unnamedClass: "Unnamed Class",
  noSubject: "No Subject",
  noCode: "No Code",
  currentYear: "Current Year",
  noClassesYet: "No Classes Yet",
  haventJoinedClasses: "You haven't joined any classes yet.",
  askTeacherForClassCode: "Ask your teacher for a class code to get started.",
  
  // AdminProfile Component
  schoolDataNotAvailable: "School Data Not Available",
  unableToLoadSchoolData: "Unable to load school administration data. Please contact support.",
  schoolAdministratorProfile: "School Administrator Profile",
  schoolAddress: "School Address",
  notProvided: "Not provided",
  principal: "Principal",
  schoolOverview: "School Overview",
  totalClasses: "Total Classes",
  teachers: "Teachers",
  enrollments: "Enrollments",
  avgCertScore: "Avg Cert Score",
  classroomManagement: "Classroom Management",
  noPeriodAssigned: "No period assigned",
  students: "Students",
  room: "Room",
  tbd: "TBD",
  certificationPerformance: "Certification Performance",
  noClassesFoundInSchool: "No classes found in your school",
  schoolCertificationPerformance: "School Certification Performance",
  classes: "classes",
  averageScore: "Average Score",
  noCertificationDataAvailable: "No certification data available yet",
  
  // DistrictProfile Component
  districtAdministratorProfile: "District Administrator Profile",
  districtAdministrator: "District Administrator",
  schoolsManaged: "Schools Managed",
  districtOverview: "District Overview",
  schools: "Schools",
  districtAvgScore: "District Avg Score",
  schoolsPerformance: "Schools Performance",
  avgScore: "Avg Score",
  noSchoolsFoundInDistrict: "No schools found in this district",
  
  // Common
  success: "Success",
  pleaseEnterAccessCode: "Please enter an access code",
  failedToProcessAccessCode: "Failed to process access code. Please try again.",
};

export default landingAuthTranslations;
