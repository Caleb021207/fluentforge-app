
import { HeartPulse, GraduationCap } from "lucide-react";
import { createFlashcardSet } from "../utils/flashcardUtils";
import { FlashcardSet } from "../../types";

// B2 level flashcard sets
export const b2FlashcardSets: FlashcardSet[] = [
  createFlashcardSet(
    "b2-health",
    "Health & Medicine",
    "Discussing health issues and medical terms",
    "B2",
    "Health",
    25,
    HeartPulse
  ),
  createFlashcardSet(
    "b2-academic",
    "Academic Language",
    "Vocabulary for education and academic contexts",
    "B2",
    "Academic",
    25,
    GraduationCap
  ),
];
