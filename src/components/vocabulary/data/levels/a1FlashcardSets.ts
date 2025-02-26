
import { BookOpen, MessageCircle, Utensils, Calculator, Link, BookMarked } from "lucide-react";
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
    "a1-connector-words",
    "Essential Connector Words",
    "Important connecting words and phrases",
    "A1",
    "Basics",
    25,
    Link
  ),
  createFlashcardSet(
    "a1-verbs-conjugations",
    "Essential Verbs & Conjugations",
    "Common verbs and their basic conjugations",
    "A1",
    "Basics",
    30,
    BookMarked
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
  createFlashcardSet(
    "a1-classroom",
    "Classroom & School",
    "Common classroom objects and school vocabulary",
    "A1",
    "Basics",
    25,
    BookOpen
  ),
  createFlashcardSet(
    "a1-personal-info",
    "Personal Information",
    "Words and phrases for sharing personal details",
    "A1",
    "Basics",
    25,
    MessageCircle
  ),
  createFlashcardSet(
    "a1-directions",
    "Simple Directions",
    "Basic words for locations and directions",
    "A1",
    "Basics",
    25,
    Link
  )
];

