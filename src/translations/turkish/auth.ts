
import { TranslationRecord } from "../types";

const authTranslations: TranslationRecord = {
  // Sign In/Out translations
  signIn: "Giriş Yap",
  signUp: "Kayıt Ol",
  signOut: "Çıkış Yap",
  email: "E-posta",
  password: "Şifre",
  forgotPassword: "Şifrenizi mi Unuttunuz?",
  resetPassword: "Şifreyi Sıfırla",
  continueWithGoogle: "Google ile Devam Et",
  continueWithFacebook: "Facebook ile Devam Et",
  continueWithApple: "Apple ile Devam Et",
  createAccount: "Hesap Oluştur",
  alreadyHaveAccount: "Zaten bir hesabınız var mı? Giriş Yapın",
  dontHaveAccount: "Hesabınız yok mu? Kayıt Olun",
  enterEmail: "E-posta adresinizi girin",
  enterPassword: "Şifrenizi girin",
  loginToYourAccount: "Hesabınıza giriş yapın",
  createYourAccount: "Hesabınızı oluşturun",
  orContinueWith: "Veya şununla devam edin",
  checkEmailForResetLink: "Sıfırlama bağlantısı için e-postanızı kontrol edin",
  resetLinkSent: "Sıfırlama bağlantısı gönderildi",
  
  // Logout button translations
  loggedOutSuccessfully: "Başarıyla çıkış yapıldı",
  youHaveBeenSignedOut: "Hesabınızdan çıkış yaptınız",
  errorSigningOut: "Çıkış yaparken hata",
  errorOccurredWhileSigningOut: "Çıkış yaparken bir hata oluştu",
  logout: "Çıkış Yap",
  
  // Auth dialog translations
  signInToContinue: "Devam etmek için hesabınıza giriş yapın",
  createAccountToGetStarted: "Başlamak için yeni bir hesap oluşturun",
  accessPasscode: "Erişim Şifresi",
  incorrectPasscode: "Yanlış şifre, lütfen tekrar deneyin.",
  pleaseWait: "Lütfen bekleyin...",
  processing: "İşleniyor...",
  
  // Additional auth translations
  authRequired: "Kimlik Doğrulama Gerekli",
  pleaseSignInDashboard: "Panoya erişmek için lütfen giriş yapın",
  
  // Auth status messages
  signInSuccess: "Başarıyla giriş yapıldı",
  signUpSuccess: "Hesap başarıyla oluşturuldu",
  resetSuccess: "Şifre sıfırlama e-postası gönderildi",
  verifyEmailSent: "Doğrulama e-postası gönderildi",
  accountVerified: "Hesap başarıyla doğrulandı",
  passwordChanged: "Şifre başarıyla değiştirildi",
  
  // Auth errors
  invalidEmail: "Geçersiz e-posta adresi",
  invalidPassword: "Geçersiz şifre",
  wrongCredentials: "Yanlış e-posta veya şifre",
  accountExists: "Bu e-posta ile bir hesap zaten var",
  weakPassword: "Şifre çok zayıf",
  verificationRequired: "Lütfen önce e-postanızı doğrulayın",
  sessionExpired: "Oturumunuz sona erdi. Lütfen tekrar giriş yapın.",
  authFailed: "Kimlik doğrulama başarısız oldu. Lütfen tekrar deneyin.",
};

export default authTranslations;
