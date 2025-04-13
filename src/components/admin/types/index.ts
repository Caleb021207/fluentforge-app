
/**
 * Shared types for the Access Code Generator components
 */

// Tiers available for access code generation
export type AccessCodeTier = 2 | 3 | 4 | 5;

// Generated code information
export interface AccessCode {
  code: string;
  tier: AccessCodeTier;
  is_used: boolean;
}

// Props for the CodeGeneratorForm component
export interface CodeGeneratorFormProps {
  selectedTier: AccessCodeTier;
  quantity: number;
  isLoading: boolean;
  onTierChange: (tier: AccessCodeTier) => void;
  onQuantityChange: (quantity: number) => void;
  onGenerateClick: () => void;
}

// Props for the GeneratedCodesList component
export interface GeneratedCodesListProps {
  generatedCodes: string[];
  copiedIndex: number | null;
  onCopyCode: (code: string, index: number) => void;
}
