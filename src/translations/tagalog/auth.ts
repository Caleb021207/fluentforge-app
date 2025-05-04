
import { TranslationRecord } from "../types";

const authTranslations: TranslationRecord = {
  // Sign In/Out translations
  signIn: "Mag-sign In",
  signUp: "Mag-sign Up",
  signOut: "Mag-sign Out",
  email: "Email",
  password: "Password",
  forgotPassword: "Nakalimutan ang Password?",
  resetPassword: "I-reset ang Password",
  continueWithGoogle: "Magpatuloy gamit ang Google",
  continueWithFacebook: "Magpatuloy gamit ang Facebook",
  continueWithApple: "Magpatuloy gamit ang Apple",
  createAccount: "Gumawa ng Account",
  alreadyHaveAccount: "Mayroon ka nang account? Mag-Sign In",
  dontHaveAccount: "Wala ka pang account? Mag-Sign Up",
  enterEmail: "Ilagay ang iyong email",
  enterPassword: "Ilagay ang iyong password",
  loginToYourAccount: "Mag-login sa iyong account",
  createYourAccount: "Gumawa ng iyong account",
  orContinueWith: "O magpatuloy gamit ang",
  checkEmailForResetLink: "Tingnan ang iyong email para sa reset link",
  resetLinkSent: "Naipadala na ang reset link",
  
  // Logout button translations
  loggedOutSuccessfully: "Matagumpay na naka-log out",
  youHaveBeenSignedOut: "Naka-sign out ka na sa iyong account",
  errorSigningOut: "Error sa pag-sign out",
  errorOccurredWhileSigningOut: "May nangyaring error habang nag-sign out",
  logout: "Mag-logout",
  
  // Auth dialog translations
  signInToContinue: "Mag-sign in sa iyong account para magpatuloy",
  createAccountToGetStarted: "Gumawa ng bagong account para makapagsimula",
  accessPasscode: "I-access ang Passcode",
  incorrectPasscode: "Mali ang passcode, pakisubukang muli.",
  pleaseWait: "Mangyaring maghintay...",
  processing: "Pinoproseso...",
  
  // Additional auth translations
  authRequired: "Kailangan ng Authentication",
  pleaseSignInDashboard: "Mangyaring mag-sign in para ma-access ang dashboard",
  
  // Auth status messages
  signInSuccess: "Matagumpay na naka-sign in",
  signUpSuccess: "Matagumpay na nagawa ang account",
  resetSuccess: "Naipadala ang email para sa pag-reset ng password",
  verifyEmailSent: "Naipadala ang verification email",
  accountVerified: "Matagumpay na na-verify ang account",
  passwordChanged: "Matagumpay na nabago ang password",
  
  // Auth errors
  invalidEmail: "Hindi wastong email address",
  invalidPassword: "Hindi wastong password",
  wrongCredentials: "Mali ang email o password",
  accountExists: "May account na gumagamit ng email na ito",
  weakPassword: "Masyadong mahina ang password",
  verificationRequired: "Mangyaring i-verify muna ang iyong email",
  sessionExpired: "Nag-expire ang iyong session. Mangyaring mag-sign in muli.",
  authFailed: "Hindi matagumpay ang authentication. Pakisubukang muli.",
  
  // New translations
  loginRequired: "Kailangan ng Login",
  loginRequiredDescription: "Mangyaring mag-sign in para ma-access ang feature na ito",
  pleaseLoginToAccessFeature: "Mangyaring mag-log in para ma-access ang feature na ito",
  redirectingToLogin: "Nire-redirect sa login page...",
  loginRequiredForFeature: "Kailangan ng login para ma-access ang feature na ito"
};

export default authTranslations;
