
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLocalization } from "@/context/LocalizationContext";
import { Lock } from "lucide-react";
import { 
  getSafetyMode, 
  setSafetyMode, 
  getDailyTimeLimit, 
  areParentalControlsLocked,
  setParentalControlsLock
} from "@/utils/contentSafetyUtils";

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

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lock size={20} /> {t("parentalControls")}
        </CardTitle>
        <CardDescription>
          {t("parentalControlsDescription")}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {isLocked ? (
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
                <Button onClick={handleUnlock}>{t("unlock")}</Button>
              </div>
              {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              <p className="text-xs text-gray-500 mt-2">{t("defaultPinNote")}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t("strictContentFiltering")}</h3>
                  <p className="text-sm text-gray-500">{t("strictContentFilteringDescription")}</p>
                </div>
                <Switch 
                  checked={safetyMode === 'strict'} 
                  onCheckedChange={handleSafeModeChange}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{t("timeUsageLimits")}</h3>
                  <p className="text-sm text-gray-500">{t("timeUsageLimitsDescription")}</p>
                </div>
                <Switch 
                  checked={timedUsage} 
                  onCheckedChange={handleTimedUsageChange}
                />
              </div>
              
              {timedUsage && (
                <div>
                  <Label>{t("dailyTimeLimit")}</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input 
                      type="number" 
                      value={dailyTimeLimit}
                      onChange={(e) => handleTimeLimitChange(e.target.value)}
                      min={0}
                    />
                    <span>{t("minutes")}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-2 pt-4 border-t">
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
                <Button onClick={handleSavePin} className="w-full mt-2">
                  {t("updatePin")}
                </Button>
                {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      
      <CardFooter className="flex justify-between">
        {!isLocked && (
          <Button variant="outline" onClick={handleLock}>
            {t("lockSettings")}
          </Button>
        )}
        <div className="text-xs text-gray-500">
          {t("cipaCompliance")}
        </div>
      </CardFooter>
    </Card>
  );
};

export default ParentalControls;
