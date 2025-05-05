
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";

export const useErrorHandler = () => {
  const [hasError, setHasError] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();

  const handleError = (error: unknown) => {
    console.error('Error:', error);
    setHasError(true);
    toast({
      title: t("error"),
      description: t("networkConnectionIssue"),
      variant: "destructive",
    });
  };

  const clearError = () => {
    setHasError(false);
  };

  return {
    hasError,
    setHasError,
    handleError,
    clearError
  };
};
