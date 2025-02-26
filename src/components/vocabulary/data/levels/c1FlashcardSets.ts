
import { Palette, Briefcase } from "lucide-react";
import { createFlashcardSet } from "../utils/flashcardUtils";
import { FlashcardSet } from "../../types";

// C1 level flashcard sets
export const c1FlashcardSets: FlashcardSet[] = [
  createFlashcardSet(
    "c1-arts",
    "Arts & Culture",
    "Discussing literature, art, and cultural topics",
    "C1",
    "Arts",
    0,  // Updated to 0 since the actual flashcards haven't been implemented yet
    Palette
  ),
  createFlashcardSet(
    "c1-business",
    "Business Negotiations",
    "Advanced business and negotiation terminology",
    "C1",
    "Business",
    0,  // Updated to 0 since the actual flashcards haven't been implemented yet
    Briefcase
  ),
];
