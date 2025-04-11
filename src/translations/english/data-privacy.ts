
import { TranslationRecord } from "../types";

const dataPrivacyTranslations: TranslationRecord = {
  // Data Privacy specific
  dataPrivacy: "Data Privacy",
  dataPrivacyOverview: "Data Privacy Overview", 
  dataPrivacyDescription: "Palavox collects minimal, anonymized data for platform performance and support purposes only. We do not collect, store, or distribute personal information from students or educators.",
  dataSecurity: "Data Security",
  dataSecurityEncryption: "All data is encrypted both in transit (TLS 1.2 or higher) and at rest using AES-256 protocols",
  dataSecurityAccess: "Access to data is limited to authorized system administrators and monitored through role-based access control",
  dataSecurityBackups: "Data backups are performed regularly and stored securely to prevent loss or corruption",
  dataSecurityMonitoring: "We use real-time logging and automated alerts to detect suspicious activity or unauthorized access",
  dataSecurityUpdates: "Security patches and system updates are applied frequently to maintain a secure infrastructure",
  dataRetention: "Data Retention",
  dataRetentionPolicy1: "Palavox does not store student-identifying data. Session information is anonymized",
  dataRetentionPolicy2: "Usage data is retained only as long as necessary to support learning analytics or platform improvements",
  dataRetentionPolicy3: "School administrators or districts can request deletion of all related records at any time",
  
  // Data Privacy Controls
  parentalDataConsent: "Parental Data Consent",
  parentalDataConsentDesc: "Palavox does not collect personal data from students under 13 without parental or school administrator consent",
  dataConsent: "Consent to Data Use",
  dataConsentDescription: "Allows Palavox to store anonymized learning progress data to improve educational outcomes. No personal information is collected",
  dataPrivacyConsent: "Educational Data Privacy Consent",
  dataWeCollect: "Data We Collect",
  assessmentResults: "Language assessment results",
  progressData: "Learning progress data",
  practiceHistory: "Practice history and performance",
  certificationsEarned: "Certifications earned",
  directoryInformation: "Directory Information",
  directoryInfoDescription: "Schools may allow limited information (like grade level or learning language) to be shared for educational purposes. Palavox does not share any student data externally.",
  
  // Download Data
  downloadMyData: "Download My Data",
  downloadDataDescription: "Download an anonymized summary of your usage history and achievements. No personal data is stored or exported",
  dataPreparing: "Data export preparing",
  dataExportDescription: "Your data export is being prepared and will be emailed to you shortly",
};

export default dataPrivacyTranslations;
