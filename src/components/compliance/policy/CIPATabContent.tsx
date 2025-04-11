
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield, Users, Clock, Sliders } from "lucide-react";

const CIPATabContent = () => {
  const { t } = useLocalization();
  
  return (
    <div className="prose prose-slate max-w-none">
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Shield className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("cipaComplianceStatement") || "CIPA Compliance"}
        </h2>
        <p>{t("cipaComplianceDescription") || "Palavox maintains a safe digital learning environment through:"}</p>
        
        <ul className="list-disc pl-6 mt-4 space-y-2">
          <li className="text-base">{t("contentFilteringPoint1") || "Automated content filtering to detect and block inappropriate language or material"}</li>
          <li className="text-base">{t("contentFilteringPoint2") || "AI moderation of conversations to ensure safe, appropriate interactions"}</li>
          <li className="text-base">{t("contentFilteringPoint3") || "Curated, age-appropriate practice scenarios and vocabulary"}</li>
          <li className="text-base">{t("cipaNoExternalContent") || "No access to external links, search engines, or user-uploaded media"}</li>
        </ul>
      </section>
      
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("parentalControls") || "Parental & Educator Controls"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">{t("parentalControlsPoint1") || "PIN-protected settings to prevent unauthorized configuration changes"}</li>
          <li className="text-base">{t("parentalControlsPoint2") || "Optional time limits to encourage healthy screen time"}</li>
          <li className="text-base">{t("parentalControlsPoint3") || "Adjustable content maturity levels for different age groups"}</li>
        </ul>
      </section>
      
      <section>
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Users className="mr-2 h-5 w-5 text-lingua-primary" />
          {t("userSafetyTips") || "Safety Tips for Users"}
        </h2>
        <ul className="list-disc pl-6 space-y-2">
          <li className="text-base">{t("userSafetyTip1") || "Do not share personal information with the AI assistant"}</li>
          <li className="text-base">{t("userSafetyTip2") || "Report any inappropriate content or errors through teacher feedback"}</li>
          <li className="text-base">{t("userSafetyTip3") || "For users under 13, we recommend use with teacher or parent supervision"}</li>
          <li className="text-base">{t("userSafetyTip4") || "Encourage breaks during long sessions to support healthy usage habits"}</li>
        </ul>
      </section>
    </div>
  );
};

export default CIPATabContent;
