
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
          {t("dataPrivacyOverview") || "Data Privacy & Security Practices"}
        </h2>
        <p>
          {t("dataPrivacyDescription") || 
            "Palavox is designed with security-first architecture and clear retention standards:"}
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("dataSecurity") || "Data Handling & Security"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">
            {t("dataSecurityEncryption") || 
              "End-to-end encryption (in transit and at rest)"}
          </li>
          <li className="text-base">
            {t("dataSecurityAccess") || 
              "Role-based access control for staff and admins"}
          </li>
          <li className="text-base">
            {t("dataSecurityBackups") || 
              "Regular secure data backups"}
          </li>
          <li className="text-base">
            {t("dataSecurityMonitoring") || 
              "Real-time monitoring for unauthorized activity"}
          </li>
          <li className="text-base">
            {t("dataSecurityUpdates") || 
              "Routine software and security updates"}
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
              "We retain session data only as long as needed for educational use"}
          </li>
          <li className="text-base">
            {t("dataRetentionPolicy2") || 
              "No permanent storage of PII or student-created content"}
          </li>
          <li className="text-base">
            {t("dataRetentionPolicy3") || 
              "Full data deletion available on request"}
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
            "A detailed FERPA/CIPA compliance packet and technical documentation are available upon request. Please email: caleb@palavox.org"}
        </p>
      </section>
    </div>
  );
};

export default PrivacyTabContent;
