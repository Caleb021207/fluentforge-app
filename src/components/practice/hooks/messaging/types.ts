
import { TranslationType } from "../translation/types";

export interface ChatResponse {
  content: string;
  translation?: TranslationType;
  usingFallbackModel?: boolean;
}
