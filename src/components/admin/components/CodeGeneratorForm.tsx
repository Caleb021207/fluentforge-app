
import React from "react";
import { CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalization } from "@/context/LocalizationContext";

interface CodeGeneratorFormProps {
  selectedTier: number;
  quantity: number;
  isLoading: boolean;
  onTierChange: (tier: number) => void;
  onQuantityChange: (quantity: number) => void;
  onGenerateClick: () => void;
}

const CodeGeneratorForm = ({
  selectedTier,
  quantity,
  isLoading,
  onTierChange,
  onQuantityChange,
  onGenerateClick
}: CodeGeneratorFormProps) => {
  const { t } = useLocalization();

  return (
    <>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="tier">{t("selectTier")}</Label>
            <Select 
              value={String(selectedTier)} 
              onValueChange={(value) => onTierChange(parseInt(value))}
            >
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
                  onQuantityChange(value);
                } else {
                  onQuantityChange(1);
                }
              }}
              min="1"
              max="100"
            />
          </div>
        </div>
      </CardContent>
      <CardFooter>
        <Button onClick={onGenerateClick} disabled={isLoading}>
          {isLoading ? t("generating") : t("generateAccessCodes")}
        </Button>
      </CardFooter>
    </>
  );
};

export default CodeGeneratorForm;
