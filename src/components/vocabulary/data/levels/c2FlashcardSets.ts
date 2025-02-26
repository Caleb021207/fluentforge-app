
import { GraduationCap, Users } from "lucide-react";
import { createFlashcardSet } from "../utils/flashcardUtils";
import { FlashcardSet } from "../../types";

// C2 level flashcard sets
export const c2FlashcardSets: FlashcardSet[] = [
  createFlashcardSet(
    "c2-academic",
    "Academic Research",
    "Vocabulary for academic research and publishing",
    "C2",
    "Academic",
    50,
    GraduationCap
  ),
  createFlashcardSet(
    "c2-social",
    "Colloquial Expressions",
    "Advanced idioms and expressions",
    "C2",
    "Social",
    45,
    Users
  ),
];
