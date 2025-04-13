
import React, { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { redeemAccessCode } from "@/utils/tierUtils";
import { supabase } from "@/integrations/supabase/client";

interface AccessCodeRedemptionProps {
  onSuccess?: (tier: number) => void;
}

const AccessCodeRedemption = ({ onSuccess }: AccessCodeRedemptionProps) => {
  const { t } = useLocalization();
  const [accessCode, setAccessCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  
  const handleRedeemCode = async () => {
    setIsLoading(true);
    try {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const userId = data.session.user.id;
        const result = await redeemAccessCode(accessCode, userId);
        
        if (result.success) {
          toast({
            title: t("success"),
            description: t(result.message, { tier: result.tier?.toString() }),
          });
          onSuccess?.(result.tier || 1);
        } else {
          toast({
            title: t("error"),
            description: t(result.message),
            variant: "destructive",
          });
        }
      } else {
        toast({
          title: t("error"),
          description: t("pleaseEnterAccessCode"),
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Redeem code error:", error);
      toast({
        title: t("error"),
        description: t("unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Key className="h-5 w-5 mr-2" />
          {t("redeemAccessCode")}
        </CardTitle>
        <CardDescription>
          {t("enterAccessCodeDescription")}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Input 
              id="access-code" 
              className="col-span-3" 
              placeholder={t("accessCodePlaceholder")}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              disabled={isLoading}
            />
            <Button 
              className="col-span-1" 
              onClick={handleRedeemCode}
              disabled={isLoading}
            >
              {isLoading ? t("processing") : t("redeemCode")}
            </Button>
          </div>
        </div>
      </CardContent>
      <CardFooter className="text-sm">
        {t("accessCodeHelp")}
      </CardFooter>
    </Card>
  );
};

export default AccessCodeRedemption;
