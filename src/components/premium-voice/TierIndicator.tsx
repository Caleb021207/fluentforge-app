
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Badge } from "@/components/ui/badge";
import { getTierDescription } from "@/utils/tierUtils";
import { InfoIcon } from "lucide-react";
import { Link } from "react-router-dom";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface TierIndicatorProps {
  userTier: number;
}

const TierIndicator = ({ userTier }: TierIndicatorProps) => {
  const { t } = useLocalization();

  return (
    <div className="flex items-center gap-2">
      <Badge
        variant="outline"
        className={`px-2 py-1 ${
          userTier > 1 ? "bg-lingua-100/50" : "bg-gray-100"
        }`}
      >
        {getTierDescription(userTier, t)}
      </Badge>

      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link to="/profile">
              <InfoIcon className="h-4 w-4 text-gray-500 hover:text-lingua-600 cursor-pointer" />
            </Link>
          </TooltipTrigger>
          <TooltipContent>
            <p>{t("viewTierDetails")}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default TierIndicator;
