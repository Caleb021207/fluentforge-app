import React, { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { redeemAccessCode } from "@/utils/tierUtils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

// Fix the type in the props interface
const AccessCodeRedemption = ({ onSuccess }: { onSuccess?: (tier: number) => void }) => {
  const { t } = useLocalization();
  const [accessCode, setAccessCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessCode.trim()) {
      toast({
        title: t("formError"),
        description: t("pleaseEnterAccessCode"),
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: t("error"),
          description: t("loginRequired"),
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }

      const result = await redeemAccessCode(accessCode.trim(), user.id);
      
      if (result.success) {
        toast({
          title: t("success"),
          description: t(result.message, { tier: result.tier }),
        });
        
        setAccessCode("");
        
        // Fix type issue: pass the numeric tier value to the callback
        if (onSuccess && result.tier) {
          onSuccess(result.tier);
        }
      } else {
        toast({
          title: t("error"),
          description: t(result.message),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error redeeming access code:", error);
      toast({
        title: t("error"),
        description: t("unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("redeemAccessCode")}</CardTitle>
        <CardDescription>{t("enterAccessCodeDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              id="access-code"
              placeholder={t("accessCodePlaceholder")}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("processing")}
              </>
            ) : (
              t("redeemCode")
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="text-xs text-gray-500">
        {t("accessCodeHelp")}
      </CardFooter>
    </Card>
  );
};

export default AccessCodeRedemption;
