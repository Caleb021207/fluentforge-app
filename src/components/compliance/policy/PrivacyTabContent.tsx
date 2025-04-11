
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Lock, Shield, Server } from "lucide-react";

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
            "We take the privacy and security of all user data seriously, implementing strict measures to protect information in accordance with FERPA and industry best practices."}
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("dataSecurity") || "Data Security Measures"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">
            {t("dataSecurityEncryption") || 
              "Encryption: All data is encrypted in transit and at rest using industry-standard encryption methods"}
          </li>
          <li className="text-base">
            {t("dataSecurityAccess") || 
              "Access Controls: Strict access controls limit who can view and modify user data"}
          </li>
          <li className="text-base">
            {t("dataSecurityBackups") || 
              "Regular Backups: We maintain secure backups of all data to prevent loss"}
          </li>
          <li className="text-base">
            {t("dataSecurityMonitoring") || 
              "Continuous Monitoring: Our systems are monitored 24/7 for suspicious activity"}
          </li>
          <li className="text-base">
            {t("dataSecurityUpdates") || 
              "Security Updates: All systems are regularly updated with the latest security patches"}
          </li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Server className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("dataRetention") || "Data Retention Policy"}
        </h2>
        <p>
          {t("dataRetentionDescription") || 
            "We retain your data only as long as necessary for the purposes for which it was collected, or as required by law. You can request deletion of your account and associated data at any time through your profile settings."}
        </p>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("contactInfo") || "Contact Information"}
        </h2>
        <p>
          {t("safetyPolicyContactInfo") || 
            "If you have any questions about our safety practices or need documentation for your district, please contact us at safety@palavox.com."}
        </p>
      </section>
    </div>
  );
};

export default PrivacyTabContent;
