
import { LockIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";

interface CooldownMessageProps {
  cooldownTimeRemaining: number | null;
  sessionStatus: 'available' | 'active' | 'cooldown';
  formatCooldownTime: (seconds: number) => string;
}

const CooldownMessage = ({ cooldownTimeRemaining, sessionStatus, formatCooldownTime }: CooldownMessageProps) => {
  const { t } = useLocalization();

  if (sessionStatus !== 'cooldown' || !cooldownTimeRemaining) {
    return null;
  }

  return (
    <Card className="p-4 mb-6 bg-red-50 border-red-200">
      <div className="flex items-center space-x-3">
        <LockIcon className="h-6 w-6 text-red-500" />
        <div>
          <h3 className="font-medium text-red-800">
            {t("premiumSessionLimitReached")}
          </h3>
          <p className="text-sm text-red-600">
            {t("resetsAt6AM", {
              time: formatCooldownTime(cooldownTimeRemaining)
            })}
          </p>
        </div>
      </div>
    </Card>
  );
};

export default CooldownMessage;
