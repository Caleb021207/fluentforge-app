
import { Link } from "react-router-dom";
import { Shield, BookOpen } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const HomeFooter = () => {
  const { t } = useLocalization();

  return (
    <div className="mt-8 flex flex-col items-center">
      <div className="flex flex-wrap justify-center gap-2 mb-2">
        <Link to="/settings" className="flex items-center text-sm text-gray-300 hover:text-white dark:text-gray-300 dark:hover:text-white">
          <Shield size={16} className="mr-1" />
          {t("parentalControls")}
        </Link>
        <span className="text-gray-400">•</span>
        <Link to="/safety-policy" className="flex items-center text-sm text-gray-300 hover:text-white dark:text-gray-300 dark:hover:text-white">
          <Shield size={16} className="mr-1" />
          {t("safetyPolicy")}
        </Link>
        <span className="text-gray-400">•</span>
        <Link to="/safety-policy?tab=ferpa" className="flex items-center text-sm text-gray-300 hover:text-white dark:text-gray-300 dark:hover:text-white">
          <BookOpen size={16} className="mr-1" />
          {t("ferpaPrivacy") || "FERPA Privacy"}
        </Link>
      </div>
      <div className="text-xs text-gray-400 dark:text-gray-300 text-center">
        © 2025 Caleb Jaworski. Palavox is a registered copyright work with the United States Copyright Office.
      </div>
    </div>
  );
};

export default HomeFooter;
