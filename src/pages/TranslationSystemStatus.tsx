
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import TranslationSystemDashboard from "@/components/admin/TranslationSystemDashboard";

const TranslationSystemStatus: React.FC = () => {
  const { t } = useLocalization();

  return (
    <div className="min-h-screen bg-gray-50">
      <TranslationSystemDashboard />
    </div>
  );
};

export default TranslationSystemStatus;
