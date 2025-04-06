
import { useLocalization } from "@/context/LocalizationContext";

interface PageHeaderProps {
  practice: string;
}

const PageHeader = ({ practice }: PageHeaderProps) => {
  const { t } = useLocalization();

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        {t("premiumVoiceTitle")}
      </h1>
      <p className="text-gray-600 mb-4">
        {t("premiumVoiceChatDescription", { practice })}
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-amber-800 text-sm font-normal">
          {t("premiumVoiceNoteWithReset")}
        </p>
      </div>
    </div>
  );
};

export default PageHeader;
