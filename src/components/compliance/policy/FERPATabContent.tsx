
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const FERPATabContent = () => {
  const { t } = useLocalization();
  
  return (
    <div className="prose prose-slate max-w-none">
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">FERPA {t("complianceStatement")}</h2>
        <p>
          {t("ferpaComplianceDescription") || 
            "This application is designed to comply with the Family Educational Rights and Privacy Act (FERPA), a federal law that protects the privacy of student education records. We implement comprehensive measures to ensure all educational data is protected in accordance with FERPA requirements."}
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("yourRightsUnderFerpa") || "Your Rights Under FERPA"}</h2>
        <p>
          {t("ferpaRightsDescription") || 
            "FERPA gives parents certain rights with respect to their children's education records. These rights transfer to the student when they reach the age of 18 or attend a school beyond the high school level."}
        </p>
        <ul className="list-disc pl-6 mt-4">
          <li>
            {t("ferpaRightInspect") || 
              "The right to inspect and review educational records maintained by the school"}
          </li>
          <li>
            {t("ferpaRightAmend") || 
              "The right to request that a school correct records believed to be inaccurate or misleading"}
          </li>
          <li>
            {t("ferpaRightConsent") || 
              "The right to consent to the disclosure of personally identifiable information from educational records, except as allowed by law"}
          </li>
          <li>
            {t("ferpaRightComplaint") || 
              "The right to file a complaint with the U.S. Department of Education concerning alleged failures to comply with FERPA requirements"}
          </li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("howWeComplyWithFerpa") || "How We Comply With FERPA"}</h2>
        <ul className="list-disc pl-6">
          <li>
            {t("ferpaComplianceDataAccess") || 
              "Access Controls: We limit access to educational records only to authorized users with legitimate educational interests"}
          </li>
          <li>
            {t("ferpaComplianceConsent") || 
              "Consent Mechanisms: We obtain proper consent before sharing any personally identifiable information (PII)"}
          </li>
          <li>
            {t("ferpaComplianceDirectory") || 
              "Directory Information: We allow users to control what directory information can be shared"}
          </li>
          <li>
            {t("ferpaComplianceAuditing") || 
              "Auditing and Logging: We maintain detailed logs of all access to educational records"}
          </li>
          <li>
            {t("ferpaComplianceEncryption") || 
              "Data Encryption: All educational data is encrypted in transit and at rest"}
          </li>
          <li>
            {t("ferpaComplianceTraining") || 
              "Staff Training: Our staff receives regular training on FERPA requirements and data privacy"}
          </li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">{t("managingYourFerpaPreferences") || "Managing Your FERPA Preferences"}</h2>
        <p>
          {t("ferpaManagementDescription") || 
            "You can manage your FERPA consent preferences and directory information settings at any time through your profile settings. This includes:"}
        </p>
        <ul className="list-disc pl-6 mt-4">
          <li>{t("ferpaManageConsent") || "Providing or revoking FERPA consent"}</li>
          <li>{t("ferpaManageDirectory") || "Specifying which directory information can be shared"}</li>
          <li>{t("ferpaManageAccess") || "Reviewing who has accessed your educational records"}</li>
          <li>{t("ferpaManageExport") || "Requesting an export of your educational data"}</li>
        </ul>
      </section>
    </div>
  );
};

export default FERPATabContent;
