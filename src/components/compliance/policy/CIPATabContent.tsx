
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const CIPATabContent = () => {
  const { t } = useLocalization();
  
  return (
    <div className="prose prose-slate max-w-none">
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
    </div>
  );
};

export default CIPATabContent;
