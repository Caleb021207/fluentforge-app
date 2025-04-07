
import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";

interface AgeVerificationDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const AgeVerificationDialog = ({ isOpen, onOpenChange }: AgeVerificationDialogProps) => {
  const { t } = useLocalization();
  const [birthYear, setBirthYear] = useState<string>("");
  const [parentalConsent, setParentalConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 100 }, (_, i) => currentYear - i);
  
  const handleVerification = () => {
    if (!birthYear) {
      setError(t("pleaseSelectBirthYear"));
      return;
    }
    
    const age = currentYear - parseInt(birthYear);
    
    // COPPA/CIPA compliance typically requires parental consent for users under 13
    if (age < 13 && !parentalConsent) {
      setError(t("parentalConsentRequired"));
      return;
    }
    
    // Store age verification status in localStorage
    localStorage.setItem("ageVerified", "true");
    
    if (age < 13) {
      // Set child-safety mode for users under 13
      localStorage.setItem("safetyMode", "strict");
    } else {
      localStorage.setItem("safetyMode", "standard");
    }
    
    onOpenChange(false);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{t("ageVerification")}</DialogTitle>
          <DialogDescription>
            {t("ageVerificationDescription")}
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              {t("birthYear")}
            </label>
            <Select onValueChange={setBirthYear} value={birthYear}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectYear")} />
              </SelectTrigger>
              <SelectContent>
                {years.map((year) => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {birthYear && parseInt(birthYear) > (currentYear - 13) && (
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="parental-consent" 
                checked={parentalConsent} 
                onCheckedChange={(checked) => setParentalConsent(checked === true)}
              />
              <label htmlFor="parental-consent" className="text-sm">
                {t("parentalConsentCheckbox")}
              </label>
            </div>
          )}
          
          {error && (
            <div className="flex items-center text-red-500 text-sm">
              <AlertCircle className="h-4 w-4 mr-1" />
              <span>{error}</span>
            </div>
          )}
          
          <Button 
            onClick={handleVerification}
            className="w-full"
          >
            {t("continue")}
          </Button>
          
          <div className="text-xs text-center text-gray-500">
            {t("privacyPolicyNote")}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AgeVerificationDialog;
