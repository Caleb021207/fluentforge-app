
import { useContext } from "react";
import { LocalizationContext, LocalizationContextType } from "@/context/LocalizationContext";

/**
 * Custom hook for using the localization context
 * @returns The localization context
 */
export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  
  if (!context) {
    throw new Error("useLocalization must be used within a LocalizationProvider");
  }
  
  return context;
};
