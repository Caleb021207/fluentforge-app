import { BookOpen, MessageCircle, Utensils, Calculator, Link, BookMarked, Clock, Calendar, Briefcase, Home, Cloud, ShoppingBag, Shirt, Bus } from "lucide-react";
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
    "a1-ar-verbs",
    "-AR Verb Conjugations",
    "Basic conjugations of regular -AR verbs",
    "A1",
    "Basics",
    20,
    BookOpen
  ),
  createFlashcardSet(
    "a1-erir-verbs",
    "-ER/-IR Verb Conjugations",
    "Basic conjugations of regular -ER and -IR verbs",
    "A1",
    "Basics",
    20,
    BookOpen
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
    25,
    Utensils
  ),
  createFlashcardSet(
    "a1-numbers-colors",
    "Numbers & Colors",
    "Basic numbers and colors vocabulary",
    "A1",
    "Basics",
    25,
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
  ),
  createFlashcardSet(
    "a1-time",
    "Days & Time",
    "Days of the week and basic time expressions",
    "A1",
    "Basics",
    25,
    Clock
  ),
  createFlashcardSet(
    "a1-calendar",
    "Months & Dates",
    "Months and date-related vocabulary",
    "A1",
    "Basics",
    20,
    Calendar
  ),
  createFlashcardSet(
    "a1-professions",
    "Basic Professions",
    "Common jobs and occupations",
    "A1",
    "Basics",
    20,
    Briefcase
  ),
  createFlashcardSet(
    "a1-daily-routines",
    "Daily Routines",
    "Common daily activities and schedules",
    "A1",
    "Basics",
    25,
    Clock
  ),
  createFlashcardSet(
    "a1-house",
    "House & Home",
    "Basic house vocabulary and furniture",
    "A1",
    "Basics",
    25,
    Home
  ),
  createFlashcardSet(
    "a1-weather",
    "Basic Weather",
    "Simple weather expressions",
    "A1",
    "Basics",
    25,
    Cloud
  ),
  createFlashcardSet(
    "a1-shopping",
    "Shopping Basics",
    "Essential shopping vocabulary",
    "A1",
    "Basics",
    25,
    ShoppingBag
  ),
  createFlashcardSet(
    "a1-clothing",
    "Basic Clothing",
    "Common clothing items",
    "A1",
    "Basics",
    25,
    Shirt
  ),
  createFlashcardSet(
    "a1-transportation",
    "Transportation",
    "Basic transportation vocabulary",
    "A1",
    "Basics",
    25,
    Bus
  )
];
