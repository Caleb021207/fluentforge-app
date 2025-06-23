
import { TranslationRecord } from "../types";

const landingAuthTranslations: TranslationRecord = {
  // Landing Page
  getStarted: "開始使用",
  swipeUpToGetStarted: "向上滑動開始使用",
  signUp: "註冊",
  welcomeToLanguageLearning: "歡迎來到Palavox",
  yourPersonalAICompanion: "你嘅個人AI學習夥伴",
  
  // Auth Flow
  signInToContinue: "登入以繼續",
  createAccountToGetStarted: "創建帳戶開始使用",
  email: "電子郵件",
  password: "密碼",
  accessPasscode: "訪問密碼",
  incorrectPasscode: "密碼錯誤",
  retrying: "重試緊",
  processing: "處理緊",
  createAccount: "創建帳戶",
  
  // Profile Auth
  authenticationRequired: "需要身份驗證",
  pleaseSignInToViewProfile: "請登入查看你嘅個人資料",
  myProfile: "我嘅個人資料",
  roleNotAssigned: "角色未分配",
  pleaseUseAccessCode: "請使用訪問代碼分配你喺系統中嘅角色",
  profileLoadError: "加載你嘅個人資料數據時出現問題",
  
  // User Roles
  student: "學生",
  teacher: "教師", 
  administrator: "管理員",
  districtAdmin: "學區管理員",
  admin: "管理員",
  district: "學區管理員",
  
  // Practice Interface
  correctGrammar: "糾正語法",
  clearConversation: "清除對話",
  authRequired: "需要身份驗證",
  pleaseLoginToAccessThisFeature: "請登入使用呢個功能",
  
  // Navigation & Interface
  textPractice: "文字練習",
  myClasses: "我嘅班級",
  myClass: "我嘅班級",
  
  // Settings
  settings: "設置",
  parentalControls: "家長控制",
  parentalControlsDescription: "配置家長控制同安全設置",
  safetyPolicy: "安全政策",
  
  // Auth Dialog Navigation
  dontHaveAccount: "冇帳戶？",
  alreadyHaveAccount: "已經有帳戶？",
  
  // Profile Setup
  setUpProfile: "設置個人資料",
  welcome: "歡迎",
  accessCodeInstructions: "要開始使用，你需要一個訪問代碼。呢啲代碼由你嘅學區、學校或老師提供。",
  codeTypes: "代碼類型：",
  schoolAdministrator: "學校管理員",
  studentClass: "學生（班級）",
  teacherProfile: "教師資料",
  school: "學校",
  role: "角色",
  notAssigned: "未分配",
  teachingOverview: "教學概覽",
  totalStudents: "學生總數",
  classAverageScore: "班級平均分",
  
  // Auth Dialog
  signIn: "登入",
  emailPlaceholder: "輸入你嘅電郵",
  passwordPlaceholder: "輸入你嘅密碼",
  accessCodePlaceholder: "輸入訪問代碼",
  signInButton: "登入",
  createAccountButton: "創建帳戶",
  switchToSignUp: "註冊",
  switchToSignIn: "登入",
  authError: "身份驗證失敗。請重試。",
  
  // Language Selection
  languagePreferencesSaved: "語言偏好已保存",
  learningLanguageFromNative: "你而家正在從{{nativeLanguage}}學習{{targetLanguage}}",
  pleaseSelectBothLanguages: "請選擇兩種語言",
  youNeedToSelectBoth: "你需要選擇母語同目標語言",
  
  // Profile Page
  error: "錯誤",
  
  // UserInfo Component
  personalInformation: "個人資料",
  cancel: "取消",
  edit: "編輯",
  profilePicture: "個人頭像",
  uploadPhoto: "上傳相片",
  displayName: "顯示名稱",
  enterDisplayName: "輸入你嘅顯示名稱",
  saving: "保存緊...",
  saveChanges: "保存更改",
  profileInformationUpdated: "個人資料已成功更新",
  failedToUpdateProfile: "更新個人資料失敗。請重試。",
  profilePictureUpdated: "個人頭像已成功更新",
  failedToUploadProfilePicture: "上傳個人頭像失敗",
  
  // AccessCodeInput Component
  accessCode: "訪問代碼",
  currentStatus: "當前狀態",
  at: "喺",
  enterCode: "輸入代碼",
  accessCodeExample: "例如：DIST123456",
  apply: "應用",
  
  // AuthRequiredPrompt Component
  loginRequired: "需要登入",
  loginRequiredDescription: "請登入使用呢個功能",
  redirectingToLogin: "重定向到登入頁面",
  
  // LogoutButton Component
  signOut: "登出",
  logout: "登出",
  loggedOutSuccessfully: "成功登出",
  youHaveBeenSignedOut: "你已經登出",
  errorSigningOut: "登出錯誤",
  errorOccurredWhileSigningOut: "登出時發生錯誤",
  
  // StudentProfile Component
  studentProfile: "學生檔案",
  gradeLevel: "年級",
  studentId: "學生編號",
  graduationYear: "畢業年份",
  notSet: "未設置",
  learningActivity: "學習活動",
  activeClasses: "活躍班級",
  practiceSessions: "練習會話",
  voiceChatMinutes: "語音聊天分鐘",
  recentGrades: "最近成績",
  points: "分",
  pending: "待處理",
  currentClassesAndTeachers: "當前班級同老師",
  unnamedClass: "未命名班級",
  noSubject: "冇科目",
  noCode: "冇代碼",
  currentYear: "當前年份",
  noClassesYet: "暫時冇班級",
  haventJoinedClasses: "你仲未加入任何班級。",
  askTeacherForClassCode: "問老師要班級代碼開始使用。",
  
  // AdminProfile Component
  schoolDataNotAvailable: "學校數據不可用",
  unableToLoadSchoolData: "無法加載學校管理數據。請聯繫支援。",
  schoolAdministratorProfile: "學校管理員檔案",
  schoolAddress: "學校地址",
  notProvided: "未提供",
  principal: "校長",
  schoolOverview: "學校概覽",
  totalClasses: "班級總數",
  teachers: "教師",
  enrollments: "註冊",
  avgCertScore: "平均認證分數",
  classroomManagement: "課室管理",
  noPeriodAssigned: "未分配課節",
  students: "學生",
  room: "課室",
  tbd: "待定",
  certificationPerformance: "認證表現",
  noClassesFoundInSchool: "學校中冇搵到班級",
  schoolCertificationPerformance: "學校認證表現",
  classes: "班級",
  averageScore: "平均分",
  noCertificationDataAvailable: "暫時冇認證數據可用",
  
  // DistrictProfile Component
  districtAdministratorProfile: "學區管理員檔案",
  districtAdministrator: "學區管理員",
  schoolsManaged: "管理嘅學校",
  districtOverview: "學區概覽",
  schools: "學校",
  districtAvgScore: "學區平均分",
  schoolsPerformance: "學校表現",
  avgScore: "平均分",
  noSchoolsFoundInDistrict: "學區中冇搵到學校",
  
  // Common
  success: "成功",
  pleaseEnterAccessCode: "請輸入訪問代碼",
  failedToProcessAccessCode: "處理訪問代碼失敗。請重試。",
};

export default landingAuthTranslations;
