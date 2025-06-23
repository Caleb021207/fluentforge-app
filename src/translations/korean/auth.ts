
import { TranslationRecord } from "../types";

const authTranslations: TranslationRecord = {
  // Authentication
  signIn: "로그인",
  signUp: "회원가입",
  signOut: "로그아웃",
  logout: "로그아웃",
  login: "로그인",
  register: "회원가입",
  
  // Form fields
  email: "이메일",
  password: "비밀번호",
  confirmPassword: "비밀번호 확인",
  accessCode: "액세스 코드",
  accessPasscode: "액세스 패스코드",
  
  // Auth flow
  signInToContinue: "계속하려면 로그인하세요",
  createAccountToGetStarted: "시작하려면 계정을 만드세요",
  dontHaveAnAccount: "계정이 없으신가요?",
  alreadyHaveAnAccount: "이미 계정이 있으신가요?",
  forgotPassword: "비밀번호를 잊으셨나요?",
  resetPassword: "비밀번호 재설정",
  
  // Auth states
  signingIn: "로그인 중...",
  signingUp: "회원가입 중...",
  signedInAs: "다음으로 로그인됨:",
  
  // Auth errors
  incorrectPasscode: "잘못된 패스코드",
  retrying: "재시도 중",
  authenticationRequired: "인증이 필요합니다",
  authRequired: "인증 필요",
  pleaseSignInToViewProfile: "프로필을 보려면 로그인해 주세요",
  pleaseLoginToAccessThisFeature: "이 기능에 액세스하려면 로그인해 주세요",
  
  // Success messages
  signInSuccessful: "로그인 성공",
  signUpSuccessful: "회원가입 성공",
  passwordResetSent: "비밀번호 재설정 이메일이 전송되었습니다",
  
  // Logout messages
  loggedOutSuccessfully: "성공적으로 로그아웃했습니다",
  youHaveBeenSignedOut: "계정에서 로그아웃되었습니다",
  errorSigningOut: "로그아웃 오류",
  errorOccurredWhileSigningOut: "로그아웃하는 동안 오류가 발생했습니다"
};

export default authTranslations;
