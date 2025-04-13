
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { generateRandomCode } from "../utils/codeGeneratorUtils";

export const useAccessCodeGenerator = () => {
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
            tier: selectedTier, // This is a number as required by the DB
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
        description: t("accessCodesGenerated", { count: quantity.toString() }),
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

  return {
    selectedTier,
    setSelectedTier,
    quantity,
    setQuantity,
    isLoading,
    generatedCodes,
    copiedIndex,
    generateAccessCodes,
    copyToClipboard,
  };
};
