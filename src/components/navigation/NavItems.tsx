
// If this file exists, update it to ensure 'textPractice' is properly translated

import { useLocalization } from "@/context/LocalizationContext";
import { Link } from "react-router-dom";

export const NavItems = () => {
  const { t } = useLocalization();
  
  // Log for debugging
  console.debug("NavItems rendering, textPractice translation:", t("textPractice"));
  
  return (
    <nav className="flex gap-4">
      <Link to="/voice-chat" className="text-sm font-medium">
        {t("unlimitedVoicePractice") || "Unlimited Voice Practice"}
      </Link>
      <Link to="/practice" className="text-sm font-medium">
        {t("textPractice") || "Text Practice"}
      </Link>
    </nav>
  );
};

export default NavItems;
