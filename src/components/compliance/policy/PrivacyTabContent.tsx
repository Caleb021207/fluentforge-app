
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Lock, Shield, Server, FileText } from "lucide-react";

const PrivacyTabContent = () => {
  const { t } = useLocalization();
  
  return (
    <div className="prose prose-slate max-w-none">
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Lock className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("dataPrivacyOverview") || "Data Privacy Overview"}
        </h2>
        <p>
          {t("dataPrivacyDescription") || 
            "Palavox collects minimal, anonymized data for platform performance and support purposes only. We do not collect, store, or distribute personal information from students or educators."}
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("dataSecurity") || "Data Security"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">
            {t("dataSecurityEncryption") || 
              "All data is encrypted both in transit (TLS 1.2 or higher) and at rest using AES-256 protocols"}
          </li>
          <li className="text-base">
            {t("dataSecurityAccess") || 
              "Access to data is limited to authorized system administrators and monitored through role-based access control"}
          </li>
          <li className="text-base">
            {t("dataSecurityBackups") || 
              "Data backups are performed regularly and stored securely to prevent loss or corruption"}
          </li>
          <li className="text-base">
            {t("dataSecurityMonitoring") || 
              "We use real-time logging and automated alerts to detect suspicious activity or unauthorized access"}
          </li>
          <li className="text-base">
            {t("dataSecurityUpdates") || 
              "Security patches and system updates are applied frequently to maintain a secure infrastructure"}
          </li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Server className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("dataRetention") || "Data Retention"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">
            {t("dataRetentionPolicy1") || 
              "Palavox does not store student-identifying data. Session information is anonymized"}
          </li>
          <li className="text-base">
            {t("dataRetentionPolicy2") || 
              "Usage data is retained only as long as necessary to support learning analytics or platform improvements"}
          </li>
          <li className="text-base">
            {t("dataRetentionPolicy3") || 
              "School administrators or districts can request deletion of all related records at any time"}
          </li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("contactInfo") || "Need Full Documentation or Audit Info?"}
        </h2>
        <p>
          {t("safetyPolicyContactInfo") || 
            "A detailed FERPA/CIPA compliance packet and technical documentation are available upon request. Please email: info@palavox.org"}
        </p>
        <p className="mt-2">
          {t("salesContactInfo") || 
            "For school or district demo requests, please contact: sales@palavox.org"}
        </p>
      </section>
    </div>
  );
};

export default PrivacyTabContent;
