
import React, { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PinProtectionProps {
  isLocked: boolean;
  onUnlock: () => void;
  error: string | null;
  pin: string;
  setPin: React.Dispatch<React.SetStateAction<string>>;
}

const PinProtection: React.FC<PinProtectionProps> = ({
  isLocked,
  onUnlock,
  error,
  pin,
  setPin
}) => {
  const { t } = useLocalization();
  
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="pin">{t("enterParentalPin")}</Label>
        <div className="flex gap-2 mt-1">
          <Input
            id="pin"
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            placeholder="****"
            maxLength={4}
          />
          <Button onClick={onUnlock}>{t("unlock")}</Button>
        </div>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        <p className="text-xs text-gray-500 mt-2">{t("defaultPinNote")}</p>
      </div>
    </div>
  );
};

export default PinProtection;
