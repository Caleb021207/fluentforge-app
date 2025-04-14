
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield, Users, Clock, Sliders, AlertCircle, Lock } from "lucide-react";

const CIPATabContent = () => {
  const { t } = useLocalization();
  
  return (
    <div className="prose prose-slate max-w-none">
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("cipaComplianceStatement") || "CIPA Compliance"}
        </h2>
        <p>{t("cipaComplianceDescription") || "Palavox maintains a safe digital learning space through the following features:"}</p>
        
        <h3 className="text-lg font-medium mt-4 mb-2">
          {t("contentFiltering") || "Content Filtering"}
        </h3>
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li className="text-base">{t("contentFilteringPoint1") || "Automatic detection and filtering of inappropriate language or content"}</li>
          <li className="text-base">{t("contentFilteringPoint2") || "AI moderation for all conversations"}</li>
          <li className="text-base">{t("contentFilteringPoint3") || "Curated, age-appropriate topics and vocabulary"}</li>
          <li className="text-base">{t("cipaNoExternalContent") || "No access to external search engines, media, or third-party websites"}</li>
          <li className="text-base">{t("smartFiltering") || "Smart filtering that understands language learning context, preventing false positives in educational settings"}</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("parentalControls") || "Parental & Educator Controls"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">{t("parentalControlsPoint1") || "PIN-protected settings to prevent unauthorized changes"}</li>
          <li className="text-base">{t("parentalControlsPoint2") || "Optional screen time limits for students"}</li>
          <li className="text-base">{t("parentalControlsPoint3") || "Adjustable content levels by age or proficiency"}</li>
          <li className="text-base">{t("parentalControlsPoint4") || "Separate profiles for different users with independent settings"}</li>
          <li className="text-base">{t("parentalControlsPoint5") || "Activity reports available for parents and educators"}</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Clock className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("sessionLimits") || "Session Limits & Monitoring"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">{t("sessionLimitsPoint1") || "Configurable time limits for practice sessions"}</li>
          <li className="text-base">{t("sessionLimitsPoint2") || "Automatic timeouts for inactive sessions"}</li>
          <li className="text-base">{t("sessionLimitsPoint3") || "Usage reports and analytics for educators"}</li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <AlertCircle className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("userSafetyTips") || "Student Safety Reminders"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">{t("userSafetyTip1") || "Never share personal information with AI assistants"}</li>
          <li className="text-base">{t("userSafetyTip2") || "Report any inappropriate content immediately"}</li>
          <li className="text-base">{t("userSafetyTip3") || "Under 13? Use with adult supervision"}</li>
          <li className="text-base">{t("userSafetyTip4") || "Take breaks during long sessions"}</li>
          <li className="text-base">{t("userSafetyTip5") || "Focus on educational topics and language learning"}</li>
          <li className="text-base">{t("userSafetyTip6") || "If something doesn't seem right, notify a teacher or parent"}</li>
        </ul>
      </section>
    </div>
  );
};

export default CIPATabContent;
