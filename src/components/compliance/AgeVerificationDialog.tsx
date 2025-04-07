
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
import { Checkbox } from "@/components/ui/checkbox";
import { useNavigate } from "react-router-dom";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Slider } from "@/components/ui/slider";

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
  
  const currentYear = new Date().getFullYear();
  const startYear = currentYear - 100;
  const years = Array.from({ length: 101 }, (_, i) => (startYear + i).toString());
  
  // Default to middle of the range (around 50 years old)
  const defaultYearIndex = 50;
  const [sliderValue, setSliderValue] = useState([defaultYearIndex]);
  const [selectedYearIndex, setSelectedYearIndex] = useState(defaultYearIndex);
  
  // Update birthYear based on selectedYearIndex
  useEffect(() => {
    if (selectedYearIndex !== defaultYearIndex || birthYear === "") {
      const year = years[selectedYearIndex];
      setBirthYear(year);
    }
  }, [selectedYearIndex, years]);
  
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => {
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  const handleSliderChange = (value: number[]) => {
    setSliderValue(value);
    setSelectedYearIndex(value[0]);
  };
  
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
            
            <div className="flex flex-col items-center space-y-4">
              <div className="w-full px-10">
                <Slider
                  value={sliderValue}
                  onValueChange={handleSliderChange}
                  max={100}
                  step={1}
                  className="w-full"
                />
              </div>
              
              <div className="h-32 w-full relative">
                <ScrollArea className="h-full w-full border rounded-md">
                  <div className="py-2">
                    {years.map((year, index) => (
                      <div 
                        key={year} 
                        className={`px-4 py-2 cursor-pointer text-center transition-colors
                          ${index === selectedYearIndex ? "bg-primary/20 font-bold" : "hover:bg-muted/60"}`}
                        onClick={() => {
                          setSelectedYearIndex(index);
                          setSliderValue([index]);
                        }}
                      >
                        {year}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
              
              <div className="text-lg font-medium text-center w-full">
                {birthYear}
              </div>
            </div>
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
