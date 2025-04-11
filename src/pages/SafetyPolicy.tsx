
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield, FileText, BookOpen, Lock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const SafetyPolicy = () => {
  const { t } = useLocalization();
  
  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-2 flex items-center">
        <Shield className="mr-2 h-8 w-8 text-lingua-primary" />
        {t("safetyAndPrivacyPolicy")}
      </h1>
      <p className="text-gray-600 mb-6">
        {t("safetyPolicyIntro") || "Our commitment to providing a safe, secure, and privacy-focused learning environment"}
      </p>
      
      <Tabs defaultValue="cipa">
        <TabsList className="mb-4">
          <TabsTrigger value="cipa" className="flex items-center">
            <Shield className="mr-2 h-4 w-4" />
            <span>CIPA {t("compliance")}</span>
          </TabsTrigger>
          <TabsTrigger value="ferpa" className="flex items-center">
            <BookOpen className="mr-2 h-4 w-4" />
            <span>FERPA {t("compliance")}</span>
          </TabsTrigger>
          <TabsTrigger value="privacy" className="flex items-center">
            <Lock className="mr-2 h-4 w-4" />
            <span>{t("dataPrivacy")}</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="cipa" className="prose prose-slate max-w-none">
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("cipaComplianceStatement")}</h2>
            <p>{t("cipaComplianceDescription")}</p>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("contentFiltering")}</h2>
            <p>{t("contentFilteringDescription")}</p>
            <ul className="list-disc pl-6 mt-4">
              <li>{t("contentFilteringPoint1")}</li>
              <li>{t("contentFilteringPoint2")}</li>
              <li>{t("contentFilteringPoint3")}</li>
            </ul>
          </section>
          
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">{t("parentalControls")}</h2>
            <p>{t("parentalControlsFullDescription")}</p>
            <ul className="list-disc pl-6 mt-4">
              <li>{t("parentalControlsPoint1")}</li>
              <li>{t("parentalControlsPoint2")}</li>
              <li>{t("parentalControlsPoint3")}</li>
            </ul>
          </section>
          
          <section>
            <h2 className="text-xl font-semibold mb-4">{t("userSafetyTips")}</h2>
            <ul className="list-disc pl-6">
              <li>{t("userSafetyTip1")}</li>
              <li>{t("userSafetyTip2")}</li>
              <li>{t("userSafetyTip3")}</li>
              <li>{t("userSafetyTip4")}</li>
            </ul>
          </section>
        </TabsContent>
        
        <TabsContent value="ferpa" className="prose prose-slate max-w-none">
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
        </TabsContent>
        
        <TabsContent value="privacy" className="prose prose-slate max-w-none">
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
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SafetyPolicy;
