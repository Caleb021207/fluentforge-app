
import { Link } from "react-router-dom";
import { Shield, BookOpen } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const HomeFooter = () => {
  const { t } = useLocalization();

  return (
    <div className="mt-8 flex flex-wrap justify-center gap-2">
      <Link to="/settings" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
        <Shield size={16} className="mr-1" />
        {t("parentalControls")}
      </Link>
      <span className="text-gray-400">•</span>
      <Link to="/safety-policy" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
        <Shield size={16} className="mr-1" />
        {t("safetyPolicy")}
      </Link>
      <span className="text-gray-400">•</span>
      <Link to="/safety-policy?tab=ferpa" className="flex items-center text-sm text-gray-500 hover:text-gray-700">
        <BookOpen size={16} className="mr-1" />
        {t("ferpaPrivacy") || "FERPA Privacy"}
      </Link>
    </div>
  );
};

export default HomeFooter;
