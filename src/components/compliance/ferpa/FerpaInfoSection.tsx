
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { BookOpen, Shield } from "lucide-react";

const FerpaInfoSection = () => {
  const { t } = useLocalization();
  
  return (
    <div className="bg-blue-50 p-4 rounded-md">
      <h3 className="font-medium text-blue-700 flex items-center mb-2">
        <Shield className="mr-2 h-4 w-4" />
        {t("whatIsFerpa") || "What is FERPA?"}
      </h3>
      <p className="text-sm text-blue-600">
        {t("ferpaExplanationShort") || "FERPA is a federal law that protects the privacy of student education records and gives students certain rights to their educational information."}
      </p>
    </div>
  );
};

export default FerpaInfoSection;
