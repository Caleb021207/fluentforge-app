
import React from "react";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import CodeGeneratorForm from "./components/CodeGeneratorForm";
import GeneratedCodesList from "./components/GeneratedCodesList";
import { useAccessCodeGenerator } from "./hooks/useAccessCodeGenerator";

const AccessCodeGenerator = () => {
  const { t } = useLocalization();
  const {
    selectedTier,
    setSelectedTier,
    quantity,
    setQuantity,
    isLoading,
    generatedCodes,
    copiedIndex,
    generateAccessCodes,
    copyToClipboard,
  } = useAccessCodeGenerator();

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>{t("accessCodeGenerator")}</CardTitle>
        <CardDescription>{t("generateAccessCodesForUsers")}</CardDescription>
      </CardHeader>
      
      <CodeGeneratorForm
        selectedTier={selectedTier}
        quantity={quantity}
        isLoading={isLoading}
        onTierChange={setSelectedTier}
        onQuantityChange={setQuantity}
        onGenerateClick={generateAccessCodes}
      />
      
      {generatedCodes.length > 0 && (
        <GeneratedCodesList
          generatedCodes={generatedCodes}
          copiedIndex={copiedIndex}
          onCopyCode={copyToClipboard}
        />
      )}
    </Card>
  );
};

export default AccessCodeGenerator;
