
import { LucideIcon } from "lucide-react";

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  example?: string;
  level: string;
  category: string;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  level: string;
  category: string;
  cardCount: number;
  icon: JSX.Element;
  masteredCount?: number;
  completed?: boolean;
  score?: number;
}

export interface LevelSelectorProps {
  currentLevel: string;
  onLevelChange: (level: string) => void;
  onB1Selected?: () => void;
  onB2Selected?: () => void;
  onC1Selected?: () => void;
  onC2Selected?: () => void;
}
