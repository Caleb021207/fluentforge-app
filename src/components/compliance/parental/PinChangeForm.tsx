
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

interface PinChangeFormProps {
  newPin: string;
  setNewPin: React.Dispatch<React.SetStateAction<string>>;
  confirmPin: string;
  setConfirmPin: React.Dispatch<React.SetStateAction<string>>;
  onSavePin: () => void;
  error: string | null;
}

const PinChangeForm: React.FC<PinChangeFormProps> = ({
  newPin,
  setNewPin,
  confirmPin,
  setConfirmPin,
  onSavePin,
  error
}) => {
  const { t } = useLocalization();
  
  return (
    <div className="space-y-2 pt-6 mt-6 border-t">
      <h3 className="font-medium">{t("changeParentalPin")}</h3>
      <div className="space-y-2">
        <div>
          <Label htmlFor="new-pin">{t("newPin")}</Label>
          <Input
            id="new-pin"
            type="password"
            value={newPin}
            onChange={(e) => setNewPin(e.target.value)}
            placeholder="****"
            maxLength={4}
          />
        </div>
        <div>
          <Label htmlFor="confirm-pin">{t("confirmPin")}</Label>
          <Input
            id="confirm-pin"
            type="password"
            value={confirmPin}
            onChange={(e) => setConfirmPin(e.target.value)}
            placeholder="****"
            maxLength={4}
          />
        </div>
        <Button onClick={onSavePin} className="w-full mt-2">
          {t("updatePin")}
        </Button>
        {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    </div>
  );
};

export default PinChangeForm;
