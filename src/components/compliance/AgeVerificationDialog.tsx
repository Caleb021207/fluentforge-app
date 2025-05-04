import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalization } from "@/hooks/useLocalization";

interface AgeVerificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVerified: (ageVerified: boolean) => void;
}

const AgeVerificationDialog: React.FC<AgeVerificationDialogProps> = ({
  isOpen,
  onOpenChange,
  onVerified,
}) => {
  const { t } = useLocalization();
  const [age, setAge] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setAge("");
      setError(null);
    }
  }, [isOpen]);

  const handleSubmit = () => {
    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge)) {
      setError(t("enterValidAge"));
      return;
    }

    if (parsedAge < 8) {
      setError(t("mustBeAtLeast8"));
      return;
    }

    onVerified(true);
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("ageVerification")}</DialogTitle>
          <DialogDescription>
            {t("ageVerificationDescription")}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="age" className="text-right">
              {t("age")}
            </Label>
            <Input
              type="number"
              id="age"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              className="col-span-3"
            />
          </div>
          {error && <p className="text-red-500 text-sm">{error}</p>}
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>{t("verifyAge")}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AgeVerificationDialog;

