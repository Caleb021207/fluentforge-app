
import { TranslationRecord } from "../types";

const authTranslations: TranslationRecord = {
  // Sign in and account creation
  signInToAccount: "खातामा साइन इन गर्नुहोस्",
  createNewAccount: "नयाँ खाता सिर्जना गर्नुहोस्",
  signIn: "साइन इन गर्नुहोस्",
  signUp: "साइन अप गर्नुहोस्",
  createAccount: "खाता सिर्जना गर्नुहोस्",
  login: "लगइन",
  logout: "लगआउट",
  register: "दर्ता गर्नुहोस्",
  
  // Form fields
  emailAddress: "इमेल ठेगाना",
  email: "इमेल",
  password: "पासवर्ड",
  confirmPassword: "पासवर्ड पुष्टि गर्नुहोस्",
  firstName: "पहिलो नाम",
  lastName: "अन्तिम नाम",
  accessPasscode: "पहुँच पासकोड",
  accessCode: "पहुँच कोड",
  
  // Placeholders
  emailPlaceholder: "तपाईंको इमेल प्रविष्ट गर्नुहोस्",
  passwordPlaceholder: "तपाईंको पासवर्ड प्रविष्ट गर्नुहोस्",
  accessCodePlaceholder: "पहुँच कोड प्रविष्ट गर्नुहोस्",
  
  // Actions
  forgotPassword: "पासवर्ड बिर्सनुभयो?",
  signingIn: "साइन इन गर्दै",
  creatingAccount: "खाता सिर्जना गर्दै",
  signInButton: "साइन इन गर्नुहोस्",
  createAccountButton: "खाता सिर्जना गर्नुहोस्",
  
  // Toggle between forms
  switchToSignUp: "साइन अपमा स्विच गर्नुहोस्",
  switchToSignIn: "साइन इनमा स्विच गर्नुहोस्",
  dontHaveAccount: "खाता छैन?",
  alreadyHaveAccount: "पहिले नै खाता छ?",
  
  // Status messages
  checkEmail: "इमेल जाँच गर्नुहोस्",
  authError: "प्रमाणीकरण त्रुटि",
  invalidEmailPassword: "अमान्य इमेल वा पासवर्ड",
  passwordsDoNotMatch: "पासवर्डहरू मेल खाँदैन",
  passwordTooShort: "पासवर्ड धेरै छोटो छ",
  incorrectPasscode: "गलत पासकोड",
  retrying: "पुनः प्रयास गर्दै",
  
  // Authentication requirements
  authenticationRequired: "प्रमाणीकरण आवश्यक",
  loginRequired: "लगइन आवश्यक",
  signInToContinue: "जारी राख्न साइन इन गर्नुहोस्",
  createAccountToGetStarted: "सुरु गर्न खाता सिर्जना गर्नुहोस्",
  pleaseSignInToViewProfile: "प्रोफाइल हेर्न कृपया साइन इन गर्नुहोस्",
  loginRequiredForFeature: "यो सुविधाका लागि लगइन आवश्यक",
  authRequired: "प्रमाणीकरण आवश्यक",
  pleaseLoginToAccessThisFeature: "यो सुविधा पहुँच गर्न कृपया लगइन गर्नुहोस्",
  pleaseLoginToTakeTest: "परीक्षा दिनका लागि कृपया लगइन गर्नुहोस्",
  
  // Profile and user info
  myProfile: "मेरो प्रोफाइल",
  profileLoadError: "प्रोफाइल लोड त्रुटि",
  signedInAs: "रूपमा साइन इन गरिएको",
  
  // Access codes and roles
  accessCodeInstructions: "पहुँच कोड निर्देशनहरू",
  codeTypes: "कोड प्रकारहरू",
  schoolAdministrator: "विद्यालय प्रशासक",
  teacherProfile: "शिक्षक प्रोफाइल",
  school: "विद्यालय",
  role: "भूमिका",
  roleNotAssigned: "भूमिका तोकिएको छैन",
  notAssigned: "तोकिएको छैन",
  pleaseUseAccessCode: "कृपया पहुँच कोड प्रयोग गर्नुहोस्",
  
  // User roles
  student: "विद्यार्थी",
  teacher: "शिक्षक",
  administrator: "प्रशासक",
  districtAdmin: "जिल्ला प्रशासक",
  admin: "प्रशासक",
  district: "जिल्ला",
  
  // Session management
  sessionExpired: "तपाईंको सत्र समाप्त भएको छ। कृपया फेरि लगइन गर्नुहोस्",
  failedToCreateSession: "सत्र सिर्जना गर्न असफल",
  
  // Sign out
  signOut: "साइन आउट गर्नुहोस्",
  loggedOutSuccessfully: "सफलतापूर्वक लगआउट गरियो",
  youHaveBeenSignedOut: "तपाईं साइन आउट गरिनुभएको छ",
  errorSigningOut: "साइन आउट गर्न त्रुटि",
  errorOccurredWhileSigningOut: "साइन आउट गर्दा त्रुटि भयो"
};

export default authTranslations;
