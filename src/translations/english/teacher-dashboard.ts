import { TranslationRecord } from "../types";

const teacherDashboardTranslations: TranslationRecord = {
  // Dashboard header and tabs
  teacherDashboard: "Teacher Dashboard",
  newNotifications: "new notifications",
  classes: "Classes",
  overview: "Overview",
  myClasses: "My Classes",
  
  // Classes tab
  manageClassesDescription: "Create and manage your classes",
  createClass: "Create Class",
  createClassDescription: "Enter a name for your new class",
  createFirstClass: "Create Your First Class",
  noClassesCreated: "You haven't created any classes yet",
  className: "Class Name",
  classNamePlaceholder: "e.g., Spanish 101",
  classCode: "Class Code",
  classCodeCopied: "Class code copied to clipboard",
  classCreated: "Class created successfully",
  classDeleted: "Class deleted successfully",
  viewStudents: "Students",
  deleteClass: "Delete Class",
  confirmDeleteClass: "Are you sure you want to delete this class? This action cannot be undone.",
  
  // Students tab
  studentProgress: "Student Progress",
  searchStudents: "Search students...",
  filterByClass: "Filter by class",
  filterByStatus: "Filter by status",
  allClasses: "All Classes",
  allStatus: "All Status",
  noStudentsFound: "No students found",
  unknownStudent: "Unknown Student",
  unknownClass: "Unknown Class",
  atRisk: "At Risk",
  active: "Active",
  inactive: "Inactive",
  never: "Never",
  avgScore: "Avg Score",
  lastActive: "Last Active",
  
  // Assignments tab
  assignmentCompletion: "Assignment Completion",
  statusDistribution: "Status Distribution",
  recentAssignments: "Recent Assignments",
  noAssignmentsYet: "No assignments yet",
  noDataAvailable: "No data available",
  totalAssignments: "Total Assignments",
  completionRate: "Completion Rate",
  averageScore: "Average Score",
  totalSubmissions: "Total Submissions",
  completed: "Completed",
  pending: "Pending",
  overdue: "Overdue",
  
  // Overview tab
  totalStudents: "Total Students",
  totalClasses: "Total Classes",
  completedAssignments: "Completed",
  averageGrade: "Average Grade",
  studentsNeedAttention: "students need attention",
  noActivityIn7Days: "No activity in 7 days",
  topPerformers: "Top Performers",
  noClassesYet: "No Classes Yet",
  noClassesYetDescription: "Create your first class to start tracking student progress.",
  goToClassesTab: "Go to Classes Tab",
  
  // Export
  exportReport: "Export Report",
  exportAsCSV: "Export as CSV",
  exportAsJSON: "Export as JSON",
  selectDateRange: "Select Date Range",
  selectDateRangeDescription: "Choose the date range for your report",
  generateReport: "Generate Report",
  exportSuccess: "Export Successful",
  exportError: "Export Error",
  reportDownloaded: "Report has been downloaded",
  failedToGenerateReport: "Failed to generate report. Please try again.",
  startDate: "Start Date",
  endDate: "End Date",
  
  // Student detail modal
  textPracticeSessions: "Text Practice Sessions",
  voicePracticeSessions: "Voice Practice Sessions",
  grammar: "Grammar",
  complexity: "Complexity",
  pronunciation: "Pronunciation",
  testScores: "Test Scores",
  grammarAccuracyOverTime: "Grammar Accuracy Over Time",
  conversationComplexityOverTime: "Conversation Complexity Over Time",
  pronunciationAccuracyOverTime: "Pronunciation Accuracy Over Time",
  testScoresOverTime: "Test Scores Over Time",
  recentSubmissions: "Recent Submissions",
  noSubmissionsYet: "No submissions yet",
  inProgress: "In Progress",
  
  // Charts
  classScoreProgression: "Class Score Progression",
  noClassDataYet: "No class data yet",
  classGrammarAccuracy: "Class Grammar Accuracy",
  classConversationComplexity: "Class Conversation Complexity",
  classPronunciationAccuracy: "Class Pronunciation Accuracy",
  
  // Misc
  creating: "Creating...",
  copied: "Copied!",
};

export default teacherDashboardTranslations;
