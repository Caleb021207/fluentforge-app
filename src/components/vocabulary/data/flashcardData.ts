
import { FlashcardSet, Flashcard } from "../types";
import { a1FlashcardSets } from "./levels/a1FlashcardSets";
import { a2FlashcardSets } from "./levels/a2FlashcardSets";
import { b1FlashcardSets } from "./levels/b1FlashcardSets";
import { b2FlashcardSets } from "./levels/b2FlashcardSets";
import { c1FlashcardSets } from "./levels/c1FlashcardSets";
import { c2FlashcardSets } from "./levels/c2FlashcardSets";
import { a1BasicsFlashcards } from "./flashcards/a1BasicsFlashcards";
import { a1GreetingsFlashcards } from "./flashcards/a1GreetingsFlashcards";
import { a1FoodFlashcards } from "./flashcards/a1FoodFlashcards";

// Combine all flashcard sets by CEFR level
export const flashcardSets: Record<string, FlashcardSet[]> = {
  A1: a1FlashcardSets,
  A2: a2FlashcardSets,
  B1: b1FlashcardSets,
  B2: b2FlashcardSets,
  C1: c1FlashcardSets,
  C2: c2FlashcardSets,
};

// Map of all flashcards organized by set ID
export const sampleFlashcards: Record<string, Flashcard[]> = {
  "a1-basics": a1BasicsFlashcards,
  "a1-greetings": a1GreetingsFlashcards,
  "a1-food": a1FoodFlashcards,
};

// Function to get all flashcard sets
export const getAllFlashcardSets = (): FlashcardSet[] => {
  return Object.values(flashcardSets).flat();
};

// Function to get flashcard sets by level
export const getFlashcardSetsByLevel = (level: string): FlashcardSet[] => {
  return flashcardSets[level] || [];
};

// Function to get flashcards by set ID
export const getFlashcardsBySetId = (setId: string): Flashcard[] => {
  return sampleFlashcards[setId] || [];
};
