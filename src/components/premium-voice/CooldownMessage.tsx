
import { Clock } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface CooldownMessageProps {
  cooldownTimeRemaining: number | null;
  sessionStatus: 'available' | 'active' | 'cooldown' | 'unauthorized';
  formatCooldownTime: (seconds: number) => string;
}

const CooldownMessage = ({ 
  cooldownTimeRemaining, 
  sessionStatus, 
  formatCooldownTime 
}: CooldownMessageProps) => {
  const { t } = useLocalization();
  
  if (sessionStatus !== 'cooldown' || !cooldownTimeRemaining) {
    return null;
  }
  
  return (
    <div className="mb-6 rounded-lg bg-amber-50 p-4 border border-amber-200">
      <div className="flex items-center gap-2">
        <Clock className="h-5 w-5 text-amber-700" />
        <h3 className="font-medium text-amber-800">{t("cooldownPeriodActive")}</h3>
      </div>
      <p className="mt-2 text-amber-700">
        {t("resetsAt6AM", { time: formatCooldownTime(cooldownTimeRemaining) })}
      </p>
    </div>
  );
};

export default CooldownMessage;
