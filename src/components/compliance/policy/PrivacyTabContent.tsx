
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const PrivacyTabContent = () => {
  const { t } = useLocalization();
  
  return (
    <div className="prose prose-slate max-w-none">
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("dataPrivacyOverview") || "Data Privacy Overview"}</h2>
        <p>
          {t("dataPrivacyDescription") || 
            "We take the privacy and security of your data seriously. This section explains how we collect, use, store, and protect all user data, with special attention to educational data protected under FERPA."}
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("dataSecurity") || "Data Security Measures"}</h2>
        <ul className="list-disc pl-6">
          <li>
            {t("dataSecurityEncryption") || 
              "Encryption: All data is encrypted in transit and at rest using industry-standard encryption methods"}
          </li>
          <li>
            {t("dataSecurityAccess") || 
              "Access Controls: Strict access controls limit who can view and modify user data"}
          </li>
          <li>
            {t("dataSecurityBackups") || 
              "Regular Backups: We maintain secure backups of all data to prevent loss"}
          </li>
          <li>
            {t("dataSecurityMonitoring") || 
              "Continuous Monitoring: Our systems are monitored 24/7 for suspicious activity"}
          </li>
          <li>
            {t("dataSecurityUpdates") || 
              "Security Updates: All systems are regularly updated with the latest security patches"}
          </li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("dataRetention") || "Data Retention Policy"}</h2>
        <p>
          {t("dataRetentionDescription") || 
            "We retain your data only as long as necessary for the purposes for which it was collected, or as required by law. You can request deletion of your account and associated data at any time through your profile settings."}
        </p>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4">{t("contactInfo")}</h2>
        <p>{t("safetyPolicyContactInfo")}</p>
      </section>
    </div>
  );
};

export default PrivacyTabContent;
