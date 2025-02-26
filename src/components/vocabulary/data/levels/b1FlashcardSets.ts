
import { Briefcase, Laptop } from "lucide-react";
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
    0,  // Updated to 0 since the actual flashcards haven't been implemented yet
    Briefcase
  ),
  createFlashcardSet(
    "b1-technology",
    "Technology",
    "Words related to computers and modern tech",
    "B1",
    "Technology",
    0,  // Updated to 0 since the actual flashcards haven't been implemented yet
    Laptop
  ),
];
