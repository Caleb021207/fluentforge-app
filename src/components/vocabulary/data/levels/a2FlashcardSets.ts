
import { Globe, Users, Clock, Cloud, Users2, User, Utensils, Heart, ShoppingCart, Gamepad2, Briefcase, GraduationCap } from "lucide-react";
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
    30,  // Updated to 30 to reflect the actual count
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
    "a2-date-time",
    "Dates & Times",
    "Vocabulary for talking about dates and time",
    "A2",
    "Basics",
    40,  // Updated to 40 to reflect the actual count
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
  createFlashcardSet(
    "a2-food-restaurants",
    "Food & Restaurants",
    "Vocabulary for ordering food and dining out",
    "A2",
    "Food",
    25,
    Utensils
  ),
  createFlashcardSet(
    "a2-health-body",
    "Health & Body",
    "Basic medical terms and body parts",
    "A2",
    "Health",
    25,
    Heart
  ),
  createFlashcardSet(
    "a2-shopping-money",
    "Shopping & Money",
    "Advanced shopping and commerce vocabulary",
    "A2",
    "Social",
    25,
    ShoppingCart
  ),
  createFlashcardSet(
    "a2-hobbies",
    "Hobbies & Free Time",
    "Activities, sports, and entertainment vocabulary",
    "A2",
    "Social",
    25,
    Gamepad2
  ),
  createFlashcardSet(
    "a2-work",
    "Work & Jobs",
    "Basic workplace vocabulary and job terms",
    "A2",
    "Business",
    25,
    Briefcase
  ),
  createFlashcardSet(
    "a2-education",
    "Education",
    "School subjects and academic vocabulary",
    "A2",
    "Academic",
    25,
    GraduationCap
  ),
];
