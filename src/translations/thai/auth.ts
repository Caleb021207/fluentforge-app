import { TranslationRecord } from "../types";

const authTranslations: TranslationRecord = {
  // Sign In/Out translations
  signIn: "เข้าสู่ระบบ",
  signUp: "สมัครสมาชิก",
  signOut: "ออกจากระบบ",
  email: "อีเมล",
  password: "รหัสผ่าน",
  forgotPassword: "ลืมรหัสผ่าน?",
  resetPassword: "รีเซ็ตรหัสผ่าน",
  createAccount: "สร้างบัญชี",
  alreadyHaveAccount: "มีบัญชีอยู่แล้ว? เข้าสู่ระบบ",
  dontHaveAccount: "ยังไม่มีบัญชี? สมัครสมาชิก",
  
  // Logout button translations
  loggedOutSuccessfully: "ออกจากระบบสำเร็จ",
  youHaveBeenSignedOut: "คุณได้ออกจากระบบแล้ว",
  errorSigningOut: "ข้อผิดพลาดในการออกจากระบบ",
  errorOccurredWhileSigningOut: "เกิดข้อผิดพลาดขณะออกจากระบบ",
  logout: "ออกจากระบบ",
  
  // Auth dialog translations
  signInToContinue: "เข้าสู่ระบบบัญชีของคุณเพื่อดำเนินการต่อ",
  createAccountToGetStarted: "สร้างบัญชีใหม่เพื่อเริ่มต้น",
  accessPasscode: "รหัสเข้าถึง",
  incorrectPasscode: "รหัสเข้าถึงไม่ถูกต้อง กรุณาลองใหม่",
  pleaseWait: "กรุณารอสักครู่...",
  processing: "กำลังประมวลผล...",
  retrying: "กำลังลองใหม่",
  
  // Additional auth translations
  loginRequired: "จำเป็นต้องเข้าสู่ระบบ",
  loginRequiredDescription: "กรุณาเข้าสู่ระบบเพื่อเข้าใช้คุณสมบัตินี้",
  pleaseLoginToAccessFeature: "กรุณาเข้าสู่ระบบเพื่อเข้าใช้คุณสมบัตินี้",
  redirectingToLogin: "กำลังนำไปยังหน้าเข้าสู่ระบบ...",
  loginRequiredForFeature: "จำเป็นต้องเข้าสู่ระบบเพื่อเข้าใช้คุณสมบัตินี้",
  
  // Auth errors
  invalidEmail: "ที่อยู่อีเมลไม่ถูกต้อง",
  invalidPassword: "รหัสผ่านไม่ถูกต้อง",
  wrongCredentials: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
  authFailed: "การตรวจสอบสิทธิ์ล้มเหลว กรุณาลองใหม่อีกครั้ง"
};

export default authTranslations;