
import { TranslationRecord } from "../types";

const classroomTranslations: TranslationRecord = {
  // Core classroom functionality
  classroom: "कक्षाकोठा",
  classrooms: "कक्षाकोठाहरू", 
  myClasses: "मेरा कक्षाहरू",
  myClass: "मेरो कक्षा",
  joinClass: "कक्षामा सामेल हुनुहोस्",
  createClass: "कक्षा सिर्जना गर्नुहोस्",
  generateCode: "कोड उत्पन्न गर्नुहोस्",
  classCode: "कक्षा कोड",
  className: "कक्षाको नाम",
  classDescription: "कक्षाको विवरण",
  teacher: "शिक्षक",
  student: "विद्यार्थी",
  students: "विद्यार्थीहरू",
  teacherAccessRequired: "शिक्षक पहुँच आवश्यक",
  unauthorized: "अनधिकृत",
  
  // Class creation and management
  createNewClass: "नयाँ कक्षा सिर्जना गर्नुहोस्",
  creatingClass: "कक्षा सिर्जना गर्दै",
  creating: "सिर्जना गर्दै",
  classNameRequired: "कक्षाको नाम आवश्यक",
  errorCreatingClass: "कक्षा सिर्जना गर्न त्रुटि",
  classCreated: "कक्षा सिर्जना भयो",
  classActivated: "कक्षा सक्रिय भयो",
  classDeactivated: "कक्षा निष्क्रिय भयो",
  
  // Code generation and sharing
  generateClassCode: "कक्षा कोड उत्पन्न गर्नुहोस्",
  copyCode: "कोड प्रतिलिपि गर्नुहोस्",
  copyInviteLink: "निमन्त्रणा लिंक प्रतिलिपि गर्नुहोस्",
  copied: "प्रतिलिपि गरियो",
  shareCodeWithStudents: "विद्यार्थीहरूसँग कोड साझा गर्नुहोस्",
  
  // Joining classes
  enterClassCode: "कक्षा कोड प्रविष्ट गर्नुहोस्",
  enterValidCode: "मान्य कोड प्रविष्ट गर्नुहोस्",
  join: "सामेल हुनुहोस्",
  joining: "सामेल हुँदै",
  joinedClass: "कक्षामा सामेल भयो",
  successJoining: "सफलतापूर्वक सामेल भयो",
  errorJoining: "सामेल हुन त्रुटि",
  invalidClassCode: "अमान्य कक्षा कोड",
  pleaseCheckCode: "कृपया कोड जाँच गर्नुहोस्",
  classJoinCode: "कक्षा सामेल हुने कोड",
  
  // Student management
  studentsEnrolled: "भर्ना भएका विद्यार्थीहरू",
  noStudentsInClass: "कक्षामा कुनै विद्यार्थी छैन",
  unnamed: "नामरहित",
  studentName: "विद्यार्थीको नाम",
  name: "नाम",
  lastActivity: "अन्तिम गतिविधि",
  joinedOn: "सामेल भएको मिति",
  joined: "सामेल भयो",
  viewStudents: "विद्यार्थीहरू हेर्नुहोस्",
  noStudentsEnrolled: "कुनै विद्यार्थी भर्ना भएको छैन",
  
  // Metrics and progress
  practiceTime: "अभ्यास समय",
  practiceCalls: "अभ्यास कलहरू",
  practiceCallsShort: "अभ्यास कलहरू",
  voicePracticeCalls: "आवाज अभ्यास कलहरू",
  voicePracticeCallsShort: "आवाज कलहरू",
  premiumVoiceSessions: "प्रिमियम आवाज सत्रहरू",
  premiumVoiceMinutes: "प्रिमियम आवाज मिनेटहरू",
  certificationAttempts: "प्रमाणपत्र प्रयासहरू",
  highScore: "उच्च अंक",
  avgScore: "औसत अंक",
  completedLessons: "सम्पन्न पाठहरू",
  voiceChatSessions: "आवाज च्याट सत्रहरू",
  voiceChatMinutes: "आवाज च्याट मिनेटहरू",
  
  // Refresh functionality
  refreshMetrics: "मेट्रिक्स रिफ्रेश गर्नुहोस्",
  refreshingMetrics: "मेट्रिक्स रिफ्रेश गर्दै",
  refreshing: "रिफ्रेश गर्दै",
  studentMetricsRefreshed: "विद्यार्थी मेट्रिक्स रिफ्रेश भयो",
  allMetricsRefreshed: "सबै मेट्रिक्स रिफ्रेश भयो",
  failedToRefreshMetrics: "मेट्रिक्स रिफ्रेश गर्न असफल",
  
  // Class status
  active: "सक्रिय",
  inactive: "निष्क्रिय",
  activate: "सक्रिय गर्नुहोस्",
  deactivate: "निष्क्रिय गर्नुहोस्",
  created: "सिर्जना गरियो",
  code: "कोड",
  room: "कोठा",
  period: "अवधि",
  noPeriodAssigned: "कुनै अवधि तोकिएको छैन",
  tbd: "निर्धारण हुन बाँकी",
  
  // Empty states
  noClassesCreated: "कुनै कक्षा सिर्जना गरिएको छैन",
  noClassJoined: "कुनै कक्षामा सामेल भएको छैन",
  noClassesFound: "कुनै कक्षा फेला परेन",
  createOrJoinClass: "कक्षा सिर्जना गर्नुहोस् वा सामेल हुनुहोस्",
  
  // Advanced classroom features
  classManagement: "कक्षा व्यवस्थापन",
  studentManagement: "विद्यार्थी व्यवस्थापन",
  classOverview: "कक्षा अवलोकन",
  classDetails: "कक्षा विवरण",
  classDashboard: "कक्षा ड्यासबोर्ड",
  studentProgress: "विद्यार्थी प्रगति",
  viewProgress: "प्रगति हेर्नुहोस्",
  classMetrics: "कक्षा मेट्रिक्स",
  teachingOverview: "शिक्षण अवलोकन",
  totalStudents: "कुल विद्यार्थीहरू",
  classAverageScore: "कक्षाको औसत अंक",
  
  // Class settings and actions
  classSettings: "कक्षा सेटिङहरू",
  editClass: "कक्षा सम्पादन गर्नुहोस्",
  deleteClass: "कक्षा मेटाउनुहोस्",
  archiveClass: "कक्षा संग्रह गर्नुहोस्",
  restoreClass: "कक्षा पुनर्स्थापना गर्नुहोस्",
  classArchived: "कक्षा संग्रह गरियो",
  classRestored: "कक्षा पुनर्स्थापना गरियो",
  classDeleted: "कक्षा मेटाइयो",
  confirmDeleteClass: "कक्षा मेटाउने पुष्टि गर्नुहोस्",
  confirmArchiveClass: "कक्षा संग्रह गर्ने पुष्टि गर्नुहोस्",
  
  // Data management
  exportData: "डाटा निर्यात गर्नुहोस्",
  importStudents: "विद्यार्थीहरू आयात गर्नुहोस्",
  bulkActions: "समूहिक कार्यहरू",
  selectAll: "सबै चयन गर्नुहोस्",
  deselectAll: "सबै अचयन गर्नुहोस्",
  selectedStudents: "चयनित विद्यार्थीहरू",
  
  // Reports
  generateReport: "रिपोर्ट उत्पन्न गर्नुहोस्",
  classReport: "कक्षा रिपोर्ट",
  progressReport: "प्रगति रिपोर्ट",
  attendanceReport: "उपस्थिति रिपोर्ट",
  
  // Error handling
  errorLoadingClasses: "कक्षाहरू लोड गर्न त्रुटि",
  errorLoadingStudents: "विद्यार्थीहरू लोड गर्न त्रुटि",
  errorUpdatingClass: "कक्षा अपडेट गर्न त्रुटि",
  errorDeletingClass: "कक्षा मेटाउन त्रुटि",
  connectionError: "जडान त्रुटि",
  tryAgain: "फेरि प्रयास गर्नुहोस्",
  
  // Feature descriptions
  classroomFeatures: "कक्षाकोठा सुविधाहरू",
  createAndManageVirtualClassrooms: "भर्चुअल कक्षाकोठाहरू सिर्जना र व्यवस्थापन गर्नुहोस्",
  manageClassesAndTrackProgress: "कक्षाहरू व्यवस्थापन गर्नुहोस् र प्रगति ट्र्याक गर्नुहोस्",
  classroomFeaturesComingSoon: "कक्षाकोठा सुविधाहरू छिट्टै आउँदैछ"
};

export default classroomTranslations;
