
import { TranslationRecord } from "../types";

const authTranslations: TranslationRecord = {
  login: "Connexion",
  signUp: "S'inscrire",
  logout: "Déconnexion",
  email: "E-mail",
  password: "Mot de passe",
  confirmPassword: "Confirmer le mot de passe",
  forgotPassword: "Mot de passe oublié ?",
  resetPassword: "Réinitialiser le mot de passe",
  createAccount: "Créer un compte",
  alreadyHaveAccount: "Vous avez déjà un compte ?",
  dontHaveAccount: "Vous n'avez pas de compte ?",
  signIn: "Se connecter",
  signInWith: "Se connecter avec",
  signUpWith: "S'inscrire avec",
  or: "ou",
  welcomeBack: "Bienvenue",
  emailRequired: "E-mail requis",
  invalidEmail: "E-mail invalide",
  passwordRequired: "Mot de passe requis",
  passwordTooShort: "Le mot de passe doit contenir au moins 8 caractères",
  passwordsDoNotMatch: "Les mots de passe ne correspondent pas",
  invalidCredentials: "Identifiants invalides",
  checkYourEmail: "Vérifiez votre e-mail",
  passwordResetSent: "Un lien de réinitialisation du mot de passe a été envoyé à votre e-mail",
  errorResettingPassword: "Erreur lors de la réinitialisation du mot de passe",
  passwordResetSuccess: "Mot de passe réinitialisé avec succès",
  emailVerificationSent: "Un e-mail de vérification a été envoyé",
  emailVerified: "E-mail vérifié",
  verificationFailed: "Échec de la vérification",
  accountCreated: "Compte créé",
  accountCreationFailed: "Échec de la création du compte",
  passwordChanged: "Mot de passe changé",
  sessionExpired: "Session expirée, veuillez vous reconnecter",
  userNotFound: "Utilisateur non trouvé",
  unauthorizedAccess: "Accès non autorisé",
  
  // Login dialog specific translations
  signInToContinue: "Connectez-vous pour continuer",
  createAccountToGetStarted: "Créez un compte pour commencer",
  accessPasscode: "Code d'accès",
  incorrectPasscode: "Code d'accès incorrect",
  pleaseWait: "Veuillez patienter",
  continueWithGoogle: "Continuer avec Google",
  
  // Logout button translations
  loggedOutSuccessfully: "Déconnexion réussie",
  youHaveBeenSignedOut: "Vous avez été déconnecté de votre compte",
  errorSigningOut: "Erreur lors de la déconnexion",
  errorOccurredWhileSigningOut: "Une erreur s'est produite lors de la déconnexion",
  signOut: "Déconnexion",
  retrying: "Nouvelle tentative"
};

export default authTranslations;
