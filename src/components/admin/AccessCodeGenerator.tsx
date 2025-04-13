
import React, { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Copy, Check } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface AccessCode {
  id: string;
  code: string;
  tier: number;
  is_used: boolean;
  used_by: string | null;
  created_at: string;
  used_at: string | null;
  generated_by: string | null;
}

const AccessCodeGenerator = () => {
  const { t } = useLocalization();
  const [selectedTier, setSelectedTier] = useState<string>("2");
  const [quantity, setQuantity] = useState<string>("1");
  const [generatedCodes, setGeneratedCodes] = useState<AccessCode[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [copied, setCopied] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session?.user) {
        const email = data.session.user.email;
        setIsAdmin(email?.includes('admin') || false);
      }
    };
    
    checkAdminStatus();
  }, []);

  const generateAccessCodes = async () => {
    if (!selectedTier || !quantity) {
      toast({
        title: t("formError"),
        description: t("pleaseSelectTierAndQuantity"),
        variant: "destructive",
      });
      return;
    }

    const parsedQuantity = parseInt(quantity);
    if (isNaN(parsedQuantity) || parsedQuantity < 1 || parsedQuantity > 100) {
      toast({
        title: t("invalidQuantity"),
        description: t("quantityMustBeBetween1And100"),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userEmail = userData.user?.email || 'unknown';
      
      const codes: AccessCode[] = [];
      
      for (let i = 0; i < parsedQuantity; i++) {
        const randomCode = Array(3).fill(0).map(() => 
          Math.random().toString(36).substring(2, 5).toUpperCase()
        ).join('-');
        
        const { data, error } = await supabase
          .from('access_codes')
          .insert({
            code: randomCode,
            tier: parseInt(selectedTier), // Convert string to number for database
            generated_by: userEmail
          })
          .select()
          .single();
          
        if (error) {
          console.error("Error generating access code:", error);
          throw error;
        }
        
        if (data) {
          codes.push(data as AccessCode);
        }
      }
      
      setGeneratedCodes(codes);
      
      toast({
        title: t("success"),
        description: t("accessCodesGenerated", { count: codes.length }),
      });
    } catch (error) {
      console.error("Error generating access codes:", error);
      toast({
        title: t("error"),
        description: t("errorGeneratingAccessCodes"),
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(prev => ({ ...prev, [code]: true }));
    
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [code]: false }));
    }, 2000);
    
    toast({
      title: t("copied"),
      description: t("accessCodeCopiedToClipboard"),
    });
  };

  if (!isAdmin) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>{t("accessCodeGenerator")}</CardTitle>
          <CardDescription>{t("adminOnlyFeature")}</CardDescription>
        </CardHeader>
        <CardContent>
          <p>{t("mustBeAdminToAccessThisFeature")}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("accessCodeGenerator")}</CardTitle>
        <CardDescription>{t("generateAccessCodesForUsers")}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label htmlFor="tier-select" className="text-sm font-medium">
                {t("selectTier")}
              </label>
              <Select value={selectedTier} onValueChange={setSelectedTier}>
                <SelectTrigger>
                  <SelectValue placeholder={t("selectTier")} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">{t("tierBasic")} - 10 min/week</SelectItem>
                  <SelectItem value="3">{t("tierStandard")} - 20 min/week</SelectItem>
                  <SelectItem value="4">{t("tierPremium")} - 30 min/week</SelectItem>
                  <SelectItem value="5">{t("tierUnlimited")} - 60 min/week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label htmlFor="quantity" className="text-sm font-medium">
                {t("quantity")}
              </label>
              <Input
                id="quantity"
                type="number"
                min="1"
                max="100"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
              />
            </div>
          </div>
          
          <Button 
            onClick={generateAccessCodes}
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t("generating")}
              </>
            ) : (
              t("generateAccessCodes")
            )}
          </Button>
          
          {generatedCodes.length > 0 && (
            <div className="mt-4 border rounded-md p-4">
              <h3 className="text-sm font-medium mb-2">{t("generatedAccessCodes")}</h3>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {generatedCodes.map((code) => (
                  <div key={code.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                    <div className="font-mono">{code.code}</div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => copyToClipboard(code.code)}
                    >
                      {copied[code.code] ? (
                        <Check className="h-4 w-4 text-green-500" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessCodeGenerator;
