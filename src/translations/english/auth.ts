
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
};

export default authTranslations;
