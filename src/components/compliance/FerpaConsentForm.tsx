import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { BookOpen, Check } from "lucide-react";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/hooks/useLocalization";

interface FerpaConsentFormProps {
  onConsentChange: (consent: boolean) => void;
  initialConsent: boolean;
}

const FerpaConsentForm: React.FC<FerpaConsentFormProps> = ({ onConsentChange, initialConsent }) => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [consentGiven, setConsentGiven] = useState(initialConsent);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setConsentGiven(initialConsent);
  }, [initialConsent]);

  const handleConsentChange = async (checked: boolean) => {
    setIsSaving(true);
    try {
      // Optimistically update the local state
      setConsentGiven(checked);
      onConsentChange(checked);

      toast({
        title: t("consentUpdated"),
        description: checked ? t("dataCollectionEnabled") : t("dataCollectionDisabled"),
      });
    } catch (error) {
      console.error("Error updating consent:", error);
      toast({
        title: t("error"),
        description: t("consentUpdateFailed"),
        variant: "destructive",
      });
      // Revert the local state if the update fails
      setConsentGiven(!checked);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-lg font-semibold flex items-center">
            <BookOpen className="mr-2 h-5 w-5 text-blue-500" />
            {t("ferpaPrivacySettings")}
          </CardTitle>
          <CardDescription>{t("ferpaConsentDescription")}</CardDescription>
        </div>
        <Button variant="outline" size="icon" disabled={isSaving}>
          {consentGiven ? (
            <Check className="h-4 w-4" />
          ) : (
            <BookOpen className="h-4 w-4" />
          )}
        </Button>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="consent-toggle">{t("dataCollectionConsent")}</Label>
            <p className="text-sm text-muted-foreground">
              {t("dataCollectionExplanation")}
            </p>
          </div>
          <Switch
            id="consent-toggle"
            checked={consentGiven}
            onCheckedChange={handleConsentChange}
            disabled={isSaving}
          />
        </div>
      </CardContent>
      <CardFooter className="justify-end">
        {isSaving && <p className="text-sm text-muted-foreground">{t("saving")}...</p>}
      </CardFooter>
    </Card>
  );
};

export default FerpaConsentForm;

