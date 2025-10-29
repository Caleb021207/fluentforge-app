import { TranslationRecord } from "../types";

const authTranslations: TranslationRecord = {
  // Sign In/Out translations
  signIn: "Sign In",
  signUp: "Sign Up",
  signOut: "Sign Out",
  email: "Email",
  password: "Password",
  forgotPassword: "Forgot Password?",
  resetPassword: "Reset Password",
  continueWithGoogle: "Continue with Google",
  continueWithFacebook: "Continue with Facebook",
  continueWithApple: "Continue with Apple",
  createAccount: "Create Account",
  alreadyHaveAccount: "Already have an account? Sign In",
  dontHaveAccount: "Don't have an account? Sign Up",
  enterEmail: "Enter your email",
  enterPassword: "Enter your password",
  loginToYourAccount: "Login to your account",
  createYourAccount: "Create your account",
  orContinueWith: "Or continue with",
  checkEmailForResetLink: "Check your email for reset link",
  resetLinkSent: "Reset link sent",
  
  // Logout button translations
  loggedOutSuccessfully: "Logged out successfully",
  youHaveBeenSignedOut: "You have been signed out of your account",
  errorSigningOut: "Error signing out",
  errorOccurredWhileSigningOut: "An error occurred while signing out",
  logout: "Logout",
  
  // Auth dialog translations
  signInToContinue: "Sign in to your account to continue",
  createAccountToGetStarted: "Create a new account to get started",
  accessPasscode: "Access Passcode",
  incorrectPasscode: "Incorrect passcode, please try again.",
  pleaseWait: "Please wait...",
  processing: "Processing...",
  retrying: "Retrying",
  
  // Additional auth translations
  authRequired: "Authentication Required",
  pleaseSignInDashboard: "Please sign in to access the dashboard",
  
  // Auth status messages
  signInSuccess: "Signed in successfully",
  signUpSuccess: "Account created successfully",
  resetSuccess: "Password reset email sent",
  verifyEmailSent: "Verification email sent",
  accountVerified: "Account verified successfully",
  passwordChanged: "Password changed successfully",
  
  // Auth errors
  invalidEmail: "Invalid email address",
  invalidPassword: "Invalid password",
  wrongCredentials: "Wrong email or password",
  accountExists: "An account with this email already exists",
  weakPassword: "Password is too weak",
  verificationRequired: "Please verify your email first",
  sessionExpired: "Your session has expired. Please sign in again.",
  authFailed: "Authentication failed. Please try again.",
  
  // New translations
  loginRequired: "Login Required",
  loginRequiredDescription: "Please sign in to access this feature",
  pleaseLoginToAccessFeature: "Please log in to access this feature",
  redirectingToLogin: "Redirecting to login page...",
  loginRequiredForFeature: "Login required to access this feature",
  
  // Header translations
  signedInAs: "Signed in as",
  loggedInAs: "Logged in as",
  
  // Compliance dialogs
  educationalDataPrivacyConsent: "Educational Data Privacy Consent",
  ferpaConsentDescription: "Under the Family Educational Rights and Privacy Act (FERPA), we need your consent to collect and share certain educational information.",
  whatIsFerpa: "What is FERPA?",
  ferpaExplanation: "FERPA is a federal law that protects the privacy of student education records. It gives parents certain rights with respect to their children's education records. These rights transfer to the student when they reach the age of 18 or attend a post-secondary educational institution.",
  dataWeCollect: "Data We Collect",
  assessmentResults: "Language assessment results",
  progressData: "Learning progress data",
  practiceHistory: "Practice history and performance",
  certificationsEarned: "Certifications earned",
  dataCollectionNote: "Note: Palavox collects minimal, anonymized data for educational purposes only.",
  directoryInformation: "Directory Information",
  directoryInfoDescription: "Schools may allow limited information (like grade level or learning language) to be shared for educational purposes. Palavox does not share any student data externally.",
  yourName: "Your name",
  yourEmail: "Your email address",
  languagesStudied: "Languages you're studying",
  learningProgress: "Learning progress",
  achievements: "Achievements and certificates",
  consentCheckbox: "I consent to the collection and use of my educational data as described above. I understand I can revoke this consent at any time through my profile settings.",
  consentRequired: "Consent is required to use all features of this application. Without consent, certain features will be limited.",
  savePreferences: "Save Preferences",
  
  // District consent
  districtConsentTitle: "SCBOE Student Code of Conduct",
  districtConsentDescription: "This application is approved for use under the Shelby County Schools Student Code of Conduct.",
  byContinyuingYouAcknowledge: "By continuing, you acknowledge:",
  compliesWithCipaFerpa: "This platform complies with CIPA and FERPA requirements",
  governedByScboe: "Usage is governed by SCBOE's acceptable use policies",
  parentsOptOut: "Parents may opt-out by notifying the school in writing",
  acceptScboeTerms: "I accept the terms of use under the SCBOE Student Code of Conduct",
  consentRequiredMsg: "Consent Required",
  pleaseAcceptTerms: "Please accept the terms to continue",
  districtConsentSuccess: "District consent recorded successfully",
  failedToRecordConsent: "Failed to record consent. Please try again.",
  
  // Common
  success: "Success",
  error: "Error",
  continue: "Continue",
};

export default authTranslations;
