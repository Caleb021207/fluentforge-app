
import { Volume2, Headphones, Clock } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const BenefitsList = () => {
  const { t } = useLocalization();

  return (
    <div className="mt-8 bg-gray-100 rounded-lg p-6">
      <h3 className="font-semibold mb-3">
        {t("premiumVoiceChatBenefits")}
      </h3>
      <ul className="space-y-2">
        <li className="flex items-start gap-2">
          <Volume2 className="h-5 w-5 text-lingua-primary mt-0.5" />
          <span>{t("benefitNaturalVoice")}</span>
        </li>
        <li className="flex items-start gap-2">
          <Headphones className="h-5 w-5 text-lingua-primary mt-0.5" />
          <span>{t("benefitAccentPronunciation")}</span>
        </li>
        <li className="flex items-start gap-2">
          <Clock className="h-5 w-5 text-lingua-primary mt-0.5" />
          <span>{t("benefitRegularPractice")}</span>
        </li>
      </ul>
    </div>
  );
};

export default BenefitsList;
