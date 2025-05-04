import React from "react";
import { useLocalization } from "@/hooks/useLocalization";
import { BookOpen, Lock, FileText, CheckSquare } from "lucide-react";

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
            "Palavox is designed to comply fully with the Family Educational Rights and Privacy Act (FERPA), implementing strict measures to safeguard student privacy and educational data. We believe every student deserves access to language education without compromising their personal information or digital safety."}
        </p>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Lock className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("ferpaProtections") || "FERPA Protections"}
        </h2>
        <p>{t("ferpaProtectionsIntro") || "Palavox protects student data through the following safeguards:"}</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li className="text-base">{t("noPersonalInfo") || "No personally identifiable information (PII) is collected from students"}</li>
          <li className="text-base">{t("simpleLogin") || "No logins are required beyond classroom codes or aliases (if preferred)"}</li>
          <li className="text-base">{t("anonymizedData") || "All session data is anonymized and stored using secure, encrypted systems"}</li>
          <li className="text-base">{t("noDataSelling") || "Palavox does not sell or share any data with third parties or advertisers"}</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <CheckSquare className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("yourRightsUnderFerpa") || "Your Rights Under FERPA"}
        </h2>
        <p>{t("ferpaRightsIntro") || "Under the Family Educational Rights and Privacy Act, parents and eligible students have the right to:"}</p>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li className="text-base font-medium">
            {t("ferpaRightInspectTitle") || "Inspect and Review"}
            <p className="font-normal mt-1">
              {t("ferpaRightInspect") || 
                "You may request access to any education records Palavox stores or transmits on behalf of your school or district."}
            </p>
          </li>
          <li className="text-base font-medium">
            {t("ferpaRightAmendTitle") || "Request Amendment"}
            <p className="font-normal mt-1">
              {t("ferpaRightAmend") || 
                "If you believe any stored data is inaccurate or misleading, you may request that it be corrected."}
            </p>
          </li>
          <li className="text-base font-medium">
            {t("ferpaRightConsentTitle") || "Provide or Withhold Consent"}
            <p className="font-normal mt-1">
              {t("ferpaRightConsent") || 
                "We will never share data with third parties without written consent, except as permitted by law or district guidelines."}
            </p>
          </li>
          <li className="text-base font-medium">
            {t("ferpaRightComplaintTitle") || "File a Complaint"}
            <p className="font-normal mt-1">
              {t("ferpaRightComplaint") || 
                "If you believe Palavox has violated your FERPA rights, you may file a complaint with the U.S. Department of Education."}
            </p>
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
            "A detailed FERPA compliance breakdown and technical documentation are available upon request. Please email: info@palavox.org for additional information or to request documentation for your district."}
        </p>
        <p className="mt-2">
          {t("salesContactInfo") || 
            "For school or district demo requests, please contact: sales@palavox.org"}
        </p>
      </section>
    </div>
  );
};

export default FERPATabContent;
