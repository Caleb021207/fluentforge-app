
export type FlashcardLevel = "A1" | "A2" | "B1" | "B2" | "C1" | "C2";
export type FlashcardCategory = "Basics" | "Greetings" | "Food" | "Travel" | "Business" | "Academic" | "Social" | "Technology" | "Health" | "Arts";

export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  example?: string;
  level: FlashcardLevel;
  category: FlashcardCategory;
}

export interface FlashcardProgress {
  id: string;
  flashcardId: string;
  familiarityLevel: number; // 0: New, 1: Learning, 2: Reviewing, 3: Known
  nextReviewDate?: Date;
  reviewCount: number;
}

export interface FlashcardSet {
  id: string;
  title: string;
  description: string;
  level: FlashcardLevel;
  category: FlashcardCategory;
  cardCount: number;
  masteredCount?: number;
  icon: React.ReactNode;
}
