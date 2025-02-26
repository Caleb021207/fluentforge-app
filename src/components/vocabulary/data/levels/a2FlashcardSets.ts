
import { Globe, Users } from "lucide-react";
import { createFlashcardSet } from "../utils/flashcardUtils";
import { FlashcardSet } from "../../types";

// A2 level flashcard sets
export const a2FlashcardSets: FlashcardSet[] = [
  createFlashcardSet(
    "a2-travel",
    "Travel Essentials",
    "Vocabulary for basic travel situations",
    "A2",
    "Travel",
    35,
    Globe
  ),
  createFlashcardSet(
    "a2-social",
    "Social Interactions",
    "Words and phrases for everyday conversations",
    "A2",
    "Social",
    25,
    Users
  ),
];
