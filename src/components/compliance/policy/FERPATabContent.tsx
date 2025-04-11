
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
          {t("ferpaComplianceStatement") || "FERPA & Data Privacy"}
        </h2>
        <p>
          {t("ferpaComplianceDescription") || 
            "Palavox is designed to comply with the Family Educational Rights and Privacy Act (FERPA), implementing comprehensive measures to protect student privacy and educational data:"}
        </p>
        
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li className="text-base">{t("noPersonalInfo") || "No personally identifiable student information is collected"}</li>
          <li className="text-base">{t("simpleLogin") || "No login required beyond a simple classroom code or alias if preferred"}</li>
          <li className="text-base">{t("anonymizedData") || "All session data is anonymized and stored securely"}</li>
          <li className="text-base">{t("noDataSelling") || "Palavox does not use or sell any user data for advertising or third-party services"}</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Lock className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("yourRightsUnderFerpa") || "Your Rights Under FERPA"}
        </h2>
        <p>
          {t("ferpaRightsDescription") || 
            "FERPA gives parents certain rights with respect to their children's education records. These rights transfer to the student when they reach the age of 18 or attend a school beyond the high school level."}
        </p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li className="text-base">
            {t("ferpaRightInspect") || 
              "The right to inspect and review educational records maintained by the school"}
          </li>
          <li className="text-base">
            {t("ferpaRightAmend") || 
              "The right to request that a school correct records believed to be inaccurate or misleading"}
          </li>
          <li className="text-base">
            {t("ferpaRightConsent") || 
              "The right to consent to the disclosure of personally identifiable information from educational records, except as allowed by law"}
          </li>
          <li className="text-base">
            {t("ferpaRightComplaint") || 
              "The right to file a complaint with the U.S. Department of Education concerning alleged failures to comply with FERPA requirements"}
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
            "A full compliance breakdown and data security policy can be made available upon request. Contact us at safety@palavox.com for additional information or to request documentation for your district."}
        </p>
      </section>
    </div>
  );
};

export default FERPATabContent;
