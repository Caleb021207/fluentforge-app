
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { Lock, Shield, BookOpen, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  getSafetyMode, 
  setSafetyMode, 
  getDailyTimeLimit, 
  areParentalControlsLocked,
  setParentalControlsLock,
  getParentalDataConsentStatus,
  setParentalDataConsentStatus
} from "@/utils/safety";

// Import refactored components
import SafetyTabContent from "./parental/SafetyTabContent";
import TimeControlsTabContent from "./parental/TimeControlsTabContent";
import PrivacyTabContent from "./parental/PrivacyTabContent";
import PinProtection from "./parental/PinProtection";
import PinChangeForm from "./parental/PinChangeForm";

const ParentalControls = () => {
  const { t } = useLocalization();
  const [isLocked, setIsLocked] = useState(areParentalControlsLocked());
  const [pin, setPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [safetyMode, setSafetyModeState] = useState<'strict' | 'standard'>(getSafetyMode());
  const [timedUsage, setTimedUsage] = useState(getDailyTimeLimit() > 0);
  const [dailyTimeLimit, setDailyTimeLimit] = useState(getDailyTimeLimit() || 60); // minutes
  const [parentalDataConsent, setParentalDataConsentState] = useState(getParentalDataConsentStatus());
  
  const storedPin = localStorage.getItem("parentalPin") || "0000";
  
  const handleUnlock = () => {
    if (pin === storedPin) {
      setIsLocked(false);
      setParentalControlsLock(false);
      setPin("");
      setError(null);
    } else {
      setError(t("incorrectPin"));
    }
  };
  
  const handleLock = () => {
    setIsLocked(true);
    setParentalControlsLock(true);
  };
  
  const handleSavePin = () => {
    if (newPin.length < 4) {
      setError(t("pinTooShort"));
      return;
    }
    
    if (newPin !== confirmPin) {
      setError(t("pinMismatch"));
      return;
    }
    
    localStorage.setItem("parentalPin", newPin);
    setNewPin("");
    setConfirmPin("");
    setError(t("pinUpdated"));
    
    // Clear error message after 3 seconds
    setTimeout(() => setError(null), 3000);
  };
  
  const handleSafeModeChange = (checked: boolean) => {
    const newMode = checked ? 'strict' : 'standard';
    setSafetyModeState(newMode);
    setSafetyMode(newMode);
  };
  
  const handleTimeLimitChange = (value: string) => {
    const limit = parseInt(value);
    if (!isNaN(limit) && limit >= 0) {
      setDailyTimeLimit(limit);
      localStorage.setItem("dailyTimeLimit", limit.toString());
    }
  };

  const handleTimedUsageChange = (checked: boolean) => {
    setTimedUsage(checked);
    if (!checked) {
      localStorage.setItem("dailyTimeLimit", "0");
    } else {
      localStorage.setItem("dailyTimeLimit", dailyTimeLimit.toString());
    }
  };
  
  const handleParentalDataConsentChange = (checked: boolean) => {
    setParentalDataConsentState(checked);
    setParentalDataConsentStatus(checked);
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield size={20} className="text-lingua-primary" /> {t("parentalControls")}
        </CardTitle>
        <CardDescription>
          {t("parentalControlsDescription")}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLocked ? (
          <PinProtection
            isLocked={isLocked}
            onUnlock={handleUnlock}
            error={error}
            pin={pin}
            setPin={setPin}
          />
        ) : (
          <Tabs defaultValue="safety">
            <TabsList className="mb-4">
              <TabsTrigger value="safety" className="flex items-center">
                <Shield className="mr-2 h-4 w-4" />
                <span>{t("contentSafety") || "Content Safety"}</span>
              </TabsTrigger>
              <TabsTrigger value="time" className="flex items-center">
                <Clock className="mr-2 h-4 w-4" />
                <span>{t("timeControls") || "Time Controls"}</span>
              </TabsTrigger>
              <TabsTrigger value="privacy" className="flex items-center">
                <BookOpen className="mr-2 h-4 w-4" />
                <span>{t("dataPrivacy") || "Data Privacy"}</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="safety">
              <SafetyTabContent 
                safetyMode={safetyMode}
                onSafeModeChange={handleSafeModeChange}
              />
            </TabsContent>
            
            <TabsContent value="time">
              <TimeControlsTabContent
                timedUsage={timedUsage}
                dailyTimeLimit={dailyTimeLimit}
                onTimedUsageChange={handleTimedUsageChange}
                onTimeLimitChange={handleTimeLimitChange}
              />
            </TabsContent>
            
            <TabsContent value="privacy">
              <PrivacyTabContent
                parentalDataConsent={parentalDataConsent}
                onParentalDataConsentChange={handleParentalDataConsentChange}
              />
            </TabsContent>
            
            <PinChangeForm
              newPin={newPin}
              setNewPin={setNewPin}
              confirmPin={confirmPin}
              setConfirmPin={setConfirmPin}
              onSavePin={handleSavePin}
              error={error}
            />
          </Tabs>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!isLocked && (
          <Button variant="outline" onClick={handleLock} className="flex items-center">
            <Lock size={16} className="mr-2" />
            {t("lockSettings")}
          </Button>
        )}
        <div className="text-xs text-gray-500">
          {t("cipaFerpaCompliance") || "CIPA and FERPA compliant"}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ParentalControls;
