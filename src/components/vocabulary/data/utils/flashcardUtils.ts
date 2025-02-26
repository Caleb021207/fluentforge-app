
import { FlashcardSet } from "../../types";
import { LucideIcon } from "lucide-react";

export const createFlashcardSet = (
  id: string,
  title: string,
  description: string,
  level: string,
  category: string,
  cardCount: number,
  IconComponent: LucideIcon
): FlashcardSet => {
  return {
    id,
    title,
    description,
    level,
    category,
    cardCount,
    icon: <IconComponent size={24} />,
    masteredCount: 0,
  };
};
