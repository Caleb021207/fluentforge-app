
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Clipboard, Check } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const AccessCodeGenerator = () => {
  const [selectedTier, setSelectedTier] = useState<number>(2);
  const [quantity, setQuantity] = useState<number>(5);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedCodes, setGeneratedCodes] = useState<string[]>([]);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const { toast } = useToast();
  const { t } = useLocalization();

  const generateAccessCodes = async () => {
    setIsLoading(true);
    setGeneratedCodes([]);
    setCopiedIndex(null);

    try {
      if (!selectedTier || !quantity) {
        toast({
          title: t("error"),
          description: t("pleaseSelectTierAndQuantity"),
          variant: "destructive",
        });
        return;
      }

      if (quantity < 1 || quantity > 100) {
        toast({
          title: t("error"),
          description: t("quantityMustBeBetween1And100"),
          variant: "destructive",
        });
        return;
      }

      const newCodes: string[] = [];
      for (let i = 0; i < quantity; i++) {
        const code = generateRandomCode(8);
        newCodes.push(code);
      }

      // Insert the generated codes into the database
      const { data, error } = await supabase
        .from('access_codes')
        .insert(
          newCodes.map(code => ({
            code: code,
            tier: selectedTier, // Keep as number to match database schema
            is_used: false,
          }))
        );

      if (error) {
        console.error("Error inserting access codes:", error);
        toast({
          title: t("error"),
          description: t("errorGeneratingAccessCodes"),
          variant: "destructive",
        });
        return;
      }

      setGeneratedCodes(newCodes);
      toast({
        title: t("success"),
        description: t("accessCodesGenerated", { count: quantity }),
      });
    } catch (error) {
      console.error("Error generating access codes:", error);
      toast({
        title: t("error"),
        description: t("errorGeneratingAccessCodes"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateRandomCode = (length: number): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let code = '';
    for (let i = 0; i < length; i++) {
      code += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return code;
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    toast({
      title: t("copied"),
      description: t("accessCodeCopiedToClipboard"),
    });
    setTimeout(() => {
      setCopiedIndex(null);
    }, 2000);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("accessCodeGenerator")}</CardTitle>
        <CardDescription>{t("generateAccessCodesForUsers")}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tier">{t("selectTier")}</Label>
            <Select value={selectedTier.toString()} onValueChange={(value) => setSelectedTier(parseInt(value))}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectTier")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2">Tier 2 (Basic)</SelectItem>
                <SelectItem value="3">Tier 3 (Standard)</SelectItem>
                <SelectItem value="4">Tier 4 (Premium)</SelectItem>
                <SelectItem value="5">Tier 5 (Unlimited)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="quantity">{t("quantity")}</Label>
            <Input
              id="quantity"
              type="number"
              value={quantity.toString()}
              onChange={(e) => {
                const value = parseInt(e.target.value);
                if (!isNaN(value)) {
                  setQuantity(value);
                } else {
                  setQuantity(1);
                }
              }}
              min="1"
              max="100"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={generateAccessCodes} disabled={isLoading}>
          {isLoading ? t("generating") : t("generateAccessCodes")}
        </Button>
      </CardFooter>
      {generatedCodes.length > 0 && (
        <CardContent>
          <div className="grid gap-2">
            <Label>{t("generatedAccessCodes")}</Label>
            {generatedCodes.map((code, index) => (
              <div key={index} className="flex items-center justify-between rounded-md border p-2">
                <Input
                  type="text"
                  value={code}
                  readOnly
                  className="mr-2"
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(code, index)}
                  disabled={copiedIndex === index}
                >
                  {copiedIndex === index ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t("copied")}
                    </>
                  ) : (
                    <>
                      <Clipboard className="mr-2 h-4 w-4" />
                      {t("copy")}
                    </>
                  )}
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default AccessCodeGenerator;
