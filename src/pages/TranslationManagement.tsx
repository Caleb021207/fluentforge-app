
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import TranslationDashboard from "@/components/admin/TranslationDashboard";

const TranslationManagement: React.FC = () => {
  const { t } = useLocalization();

  return (
    <div className="min-h-screen bg-gray-50">
      <TranslationDashboard />
    </div>
  );
};

export default TranslationManagement;
