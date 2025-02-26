
import { Palette, Briefcase, GraduationCap, Users, BookOpen, Globe, HeartPulse, LucideIcon } from "lucide-react";
import { createFlashcardSet } from "../utils/flashcardUtils";
import { FlashcardSet } from "../../types";

// Combined C1-C2 level flashcard sets
export const c1c2FlashcardSets: FlashcardSet[] = [
  createFlashcardSet(
    "c1-arts",
    "Arts & Culture",
    "Discussing literature, art, and cultural topics",
    "C1-C2",
    "Arts",
    10,
    Palette
  ),
  createFlashcardSet(
    "c1-business",
    "Business Negotiations",
    "Advanced business and negotiation terminology",
    "C1-C2",
    "Business",
    10,
    Briefcase
  ),
  createFlashcardSet(
    "c2-academic",
    "Academic Research",
    "Vocabulary for academic research and publishing",
    "C1-C2",
    "Academic",
    10,
    GraduationCap
  ),
  createFlashcardSet(
    "c2-social",
    "Colloquial Expressions",
    "Advanced idioms and expressions",
    "C1-C2",
    "Social",
    10,
    Users
  ),
  createFlashcardSet(
    "c1c2-literature",
    "Literature Analysis",
    "Vocabulary for discussing and analyzing literature",
    "C1-C2",
    "Arts",
    10,
    BookOpen
  ),
  createFlashcardSet(
    "c1c2-global-affairs",
    "Global Affairs",
    "Advanced vocabulary for international topics and current events",
    "C1-C2",
    "Social",
    10,
    Globe
  ),
  createFlashcardSet(
    "c1c2-medical-scientific",
    "Medical & Scientific",
    "Technical vocabulary for medical and scientific contexts",
    "C1-C2",
    "Academic",
    10,
    HeartPulse
  )
];
