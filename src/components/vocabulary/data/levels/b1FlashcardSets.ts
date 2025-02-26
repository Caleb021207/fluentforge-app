
import { BookOpen, Laptop, Clock, Briefcase, MessageSquare, Book } from "lucide-react";
import { createFlashcardSet } from "../utils/flashcardUtils";
import { FlashcardSet } from "../../types";

// B1 level flashcard sets
export const b1FlashcardSets: FlashcardSet[] = [
  createFlashcardSet(
    "b1-work",
    "Work & Career",
    "Professional vocabulary for the workplace",
    "B1",
    "Business",
    25,  // Set to 25 based on the flashcard count
    Briefcase
  ),
  createFlashcardSet(
    "b1-technology",
    "Technology",
    "Words related to computers and modern tech",
    "B1",
    "Technology",
    25,  // Set to 25 based on the flashcard count
    Laptop
  ),
  createFlashcardSet(
    "b1-past-tense",
    "Past Tense & Conjugations",
    "Learn to speak about the past in Spanish",
    "B1",
    "Academic",
    30,  // Set to 30 based on the flashcard count
    Clock
  ),
  createFlashcardSet(
    "b1-irregular-verbs",
    "Irregular Verbs",
    "Essential irregular verbs for intermediate Spanish",
    "B1",
    "Academic",
    25,  // Set to 25 based on the flashcard count
    Book
  ),
  createFlashcardSet(
    "b1-intermediate-phrases",
    "Intermediate Phrases",
    "Useful expressions for everyday conversations",
    "B1",
    "Social",
    25,  // Set to 25 based on the flashcard count
    MessageSquare
  )
];
