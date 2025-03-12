
export interface Flashcard {
  id: string;
  term: string;
  definition: string;
  example: string;
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
  icon?: React.ReactNode;
  masteredCount: number;
  cards?: Flashcard[];
}
