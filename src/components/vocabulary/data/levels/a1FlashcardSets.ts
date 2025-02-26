
import { BookOpen, MessageCircle, Utensils, Calculator } from "lucide-react";
import { createFlashcardSet } from "../utils/flashcardUtils";
import { FlashcardSet } from "../../types";

// A1 level flashcard sets
export const a1FlashcardSets: FlashcardSet[] = [
  createFlashcardSet(
    "a1-basics",
    "Basic Vocabulary",
    "Essential words for absolute beginners",
    "A1",
    "Basics",
    25,
    BookOpen
  ),
  createFlashcardSet(
    "a1-greetings",
    "Greetings & Introductions",
    "Common phrases for meeting people",
    "A1",
    "Greetings",
    20,
    MessageCircle
  ),
  createFlashcardSet(
    "a1-food",
    "Food & Drinks",
    "Basic food and drink vocabulary",
    "A1",
    "Food",
    30,
    Utensils
  ),
  createFlashcardSet(
    "a1-numbers-colors",
    "Numbers & Colors",
    "Basic numbers and colors vocabulary",
    "A1",
    "Basics",
    56,
    Calculator
  ),
];
