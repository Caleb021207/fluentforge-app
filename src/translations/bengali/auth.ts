import { TranslationRecord } from "../types";

const authTranslations: TranslationRecord = {
  // Sign In/Out translations
  signIn: "সাইন ইন",
  signUp: "সাইন আপ",
  signOut: "সাইন আউট",
  email: "ইমেইল",
  password: "পাসওয়ার্ড",
  forgotPassword: "পাসওয়ার্ড ভুলে গেছেন?",
  resetPassword: "পাসওয়ার্ড রিসেট করুন",
  continueWithGoogle: "Google এর সাথে চালিয়ে যান",
  continueWithFacebook: "Facebook এর সাথে চালিয়ে যান",
  continueWithApple: "Apple এর সাথে চালিয়ে যান",
  createAccount: "অ্যাকাউন্ট তৈরি করুন",
  alreadyHaveAccount: "ইতিমধ্যে অ্যাকাউন্ট আছে? সাইন ইন করুন",
  dontHaveAccount: "অ্যাকাউন্ট নেই? সাইন আপ করুন",
  enterEmail: "আপনার ইমেইল প্রবেশ করান",
  enterPassword: "আপনার পাসওয়ার্ড প্রবেশ করান",
  loginToYourAccount: "আপনার অ্যাকাউন্টে লগইন করুন",
  createYourAccount: "আপনার অ্যাকাউন্ট তৈরি করুন",
  orContinueWith: "অথবা এর সাথে চালিয়ে যান",
  checkEmailForResetLink: "রিসেট লিঙ্কের জন্য আপনার ইমেইল চেক করুন",
  resetLinkSent: "রিসেট লিঙ্ক পাঠানো হয়েছে",
  
  // Logout button translations
  loggedOutSuccessfully: "সফলভাবে লগআউট হয়েছে",
  youHaveBeenSignedOut: "আপনি আপনার অ্যাকাউন্ট থেকে সাইন আউট হয়েছেন",
  errorSigningOut: "সাইন আউট করতে ত্রুটি",
  errorOccurredWhileSigningOut: "সাইন আউট করার সময় একটি ত্রুটি ঘটেছে",
  logout: "লগআউট",
  
  // Auth dialog translations
  signInToContinue: "চালিয়ে যেতে আপনার অ্যাকাউন্টে সাইন ইন করুন",
  createAccountToGetStarted: "শুরু করতে একটি নতুন অ্যাকাউন্ট তৈরি করুন",
  accessPasscode: "অ্যাক্সেস পাসকোড",
  incorrectPasscode: "ভুল পাসকোড, অনুগ্রহ করে আবার চেষ্টা করুন।",
  pleaseWait: "অনুগ্রহ করে অপেক্ষা করুন...",
  processing: "প্রক্রিয়াকরণ...",
  retrying: "পুনরায় চেষ্টা করা হচ্ছে",
  
  // Additional auth translations
  authRequired: "প্রমাণীকরণ প্রয়োজন",
  pleaseSignInDashboard: "ড্যাশবোর্ড অ্যাক্সেস করতে অনুগ্রহ করে সাইন ইন করুন",
  
  // Auth status messages
  signInSuccess: "সফলভাবে সাইন ইন হয়েছে",
  signUpSuccess: "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে",
  resetSuccess: "পাসওয়ার্ড রিসেট ইমেইল পাঠানো হয়েছে",
  verifyEmailSent: "যাচাইকরণ ইমেইল পাঠানো হয়েছে",
  accountVerified: "অ্যাকাউন্ট সফলভাবে যাচাই করা হয়েছে",
  passwordChanged: "পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে",
  
  // Auth errors
  invalidEmail: "অবৈধ ইমেইল ঠিকানা",
  invalidPassword: "অবৈধ পাসওয়ার্ড",
  wrongCredentials: "ভুল ইমেইল বা পাসওয়ার্ড",
  accountExists: "এই ইমেইলের সাথে একটি অ্যাকাউন্ট ইতিমধ্যে বিদ্যমান",
  weakPassword: "পাসওয়ার্ড খুবই দুর্বল",
  verificationRequired: "অনুগ্রহ করে প্রথমে আপনার ইমেইল যাচাই করুন",
  sessionExpired: "আপনার সেশনের মেয়াদ শেষ হয়েছে। অনুগ্রহ করে আবার সাইন ইন করুন।",
  authFailed: "প্রমাণীকরণ ব্যর্থ। অনুগ্রহ করে আবার চেষ্টা করুন।",
  
  // New translations
  loginRequired: "লগইন প্রয়োজন",
  loginRequiredDescription: "এই বৈশিষ্ট্য অ্যাক্সেস করতে অনুগ্রহ করে সাইন ইন করুন",
  pleaseLoginToAccessFeature: "এই বৈশিষ্ট্য অ্যাক্সেস করতে অনুগ্রহ করে লগ ইন করুন",
  redirectingToLogin: "লগইন পৃষ্ঠায় পুনঃনির্দেশিত হচ্ছে...",
  loginRequiredForFeature: "এই বৈশিষ্ট্য অ্যাক্সেস করতে লগইন প্রয়োজন"
};

export default authTranslations;