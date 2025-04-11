
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { BookOpen, Lock, FileText } from "lucide-react";

const FERPATabContent = () => {
  const { t } = useLocalization();
  
  return (
    <div className="prose prose-slate max-w-none">
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <BookOpen className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("ferpaComplianceStatement") || "FERPA Compliance"}
        </h2>
        <p>
          {t("ferpaComplianceDescription") || 
            "Palavox supports all core FERPA principles and is designed to protect student education records:"}
        </p>
        
        <h3 className="text-lg font-medium mt-4 mb-2">
          {t("ferpaProtections") || "FERPA Protections"}
        </h3>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li className="text-base">{t("noPersonalInfo") || "No personally identifiable information (PII) is collected"}</li>
          <li className="text-base">{t("simpleLogin") || "No required student logins (classroom codes or aliases only)"}</li>
          <li className="text-base">{t("anonymizedData") || "Anonymized session data, securely stored"}</li>
          <li className="text-base">{t("noDataSelling") || "No advertising, data selling, or third-party sharing"}</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Lock className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("yourRightsUnderFerpa") || "Your Rights Under FERPA"}
        </h2>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li className="text-base">
            {t("ferpaRightInspect") || 
              "Right to Inspect: You may review educational records stored on our platform"}
          </li>
          <li className="text-base">
            {t("ferpaRightAmend") || 
              "Right to Amend: You may request corrections to inaccurate information"}
          </li>
          <li className="text-base">
            {t("ferpaRightConsent") || 
              "Right to Consent: We do not disclose student data without proper consent"}
          </li>
          <li className="text-base">
            {t("ferpaRightComplaint") || 
              "Right to File Complaint: You may contact the U.S. Department of Education for concerns"}
          </li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <FileText className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("needMore") || "Need More?"}
        </h2>
        <p>
          {t("fullComplianceAvailable") || 
            "A detailed FERPA compliance breakdown and technical documentation are available upon request. Please email: caleb@palavox.org for additional information or to request documentation for your district."}
        </p>
      </section>
    </div>
  );
};

export default FERPATabContent;
