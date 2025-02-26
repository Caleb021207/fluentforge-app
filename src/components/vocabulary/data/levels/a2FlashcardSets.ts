
import { Globe, Users, Clock, Cloud, Users2, User } from "lucide-react";
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
    25,
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
  createFlashcardSet(
    "a2-dates-times",
    "Dates & Times",
    "Vocabulary for talking about dates and time",
    "A2",
    "Basics",
    25,
    Clock
  ),
  createFlashcardSet(
    "a2-weather",
    "Describing Weather",
    "Terms for discussing weather conditions",
    "A2",
    "Basics",
    25,
    Cloud
  ),
  createFlashcardSet(
    "a2-family",
    "Describing Family",
    "Words for family members and relationships",
    "A2",
    "Social",
    25,
    Users2
  ),
  createFlashcardSet(
    "a2-people",
    "Describing People",
    "Vocabulary for describing appearance and personality",
    "A2",
    "Social",
    25,
    User
  ),
];
