
import { TranslationRecord } from "../types";

const dataPrivacyTranslations: TranslationRecord = {
  // Data Privacy specific
  dataPrivacy: "Data Privacy",
  dataPrivacyOverview: "Data Privacy Overview", 
  dataPrivacyDescription: "Palavox collects minimal, anonymized data for platform performance and support purposes only. We implement industry-leading security measures to ensure all learning data remains private, secure, and exclusively used for improving educational outcomes.",
  dataSecurity: "Data Security",
  dataSecurityEncryption: "All data is encrypted both in transit (TLS 1.2 or higher) and at rest using AES-256 protocols, meeting or exceeding educational security standards",
  dataSecurityAccess: "Access to data is strictly limited to authorized system administrators and monitored through comprehensive role-based access control and audit logs",
  dataSecurityBackups: "Automated data backups are performed regularly and stored in geo-redundant, encrypted systems to prevent loss while maintaining strict privacy controls",
  dataSecurityMonitoring: "Our 24/7 security monitoring uses real-time logging, anomaly detection, and automated alerts to detect and respond to suspicious activity",
  dataSecurityUpdates: "Security patches and system updates are applied through a rigorous testing and deployment process to maintain the highest level of infrastructure protection",
  dataRetention: "Data Retention",
  dataRetentionPolicy1: "Palavox does not store student-identifying data without explicit consent. All session information is anonymized using advanced privacy-preserving techniques",
  dataRetentionPolicy2: "Learning analytics data is retained only as long as necessary to support educational outcomes, and is automatically purged according to configurable retention policies",
  dataRetentionPolicy3: "School administrators or districts can request immediate deletion of all related records at any time through our educator dashboard or compliance team",
  
  // Data Privacy Controls
  parentalDataConsent: "Parental Data Consent",
  parentalDataConsentDesc: "Palavox complies with child privacy regulations by requiring verified parental or school administrator consent before collecting any data from students under 13",
  dataConsent: "Consent to Data Use",
  dataConsentDescription: "Allows Palavox to store anonymized learning progress data to improve educational outcomes while maintaining strict privacy safeguards. No personally identifiable information is collected without explicit consent",
  dataPrivacyConsent: "Educational Data Privacy Consent",
  dataWeCollect: "Data We Collect",
  assessmentResults: "Language assessment results and progress metrics",
  progressData: "Learning progress data and skill development tracking",
  practiceHistory: "Practice session history and performance analytics",
  certificationsEarned: "Certifications earned and achievement records",
  directoryInformation: "Directory Information",
  directoryInfoDescription: "Schools may designate certain basic information as directory information that can be shared for educational purposes. Palavox implements strict controls on all directory information sharing, giving institutions and individuals complete control over what, if any, information is shared.",
  
  // Download Data
  downloadMyData: "Download My Data",
  downloadDataDescription: "Download a comprehensive summary of your usage history, achievements, and learning analytics. All exports are encrypted and contain only your authorized data",
  dataPreparing: "Data export preparing",
  dataExportDescription: "Your secure data export is being prepared and will be delivered to your verified email address shortly. For security reasons, the download link will expire after 24 hours",
};

export default dataPrivacyTranslations;
