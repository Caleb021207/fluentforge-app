// Re-export from the new consolidated location for backward compatibility
// This file exists to maintain imports from the old @/context/ path
// New code should import from @/contexts/LocalizationContext instead
export * from "@/contexts/LocalizationContext";
export { useLocalization, LocalizationProvider } from "@/contexts/LocalizationContext";
