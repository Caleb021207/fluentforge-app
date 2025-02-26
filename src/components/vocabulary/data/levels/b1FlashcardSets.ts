
import { BookOpen, Laptop, Clock, Briefcase, MessageSquare, Book, Globe, Heart, Music, Home, ShoppingBag, Plane, Users, Utensils, Camera } from "lucide-react";
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
    25,
    Briefcase
  ),
  createFlashcardSet(
    "b1-technology",
    "Technology",
    "Words related to computers and modern tech",
    "B1",
    "Technology",
    25,
    Laptop
  ),
  createFlashcardSet(
    "b1-past-tense",
    "Past Tense & Conjugations",
    "Learn to speak about the past in Spanish",
    "B1",
    "Academic",
    25,
    Clock
  ),
  createFlashcardSet(
    "b1-irregular-verbs",
    "Irregular Verbs",
    "Essential irregular verbs for intermediate Spanish",
    "B1",
    "Academic",
    25,
    Book
  ),
  createFlashcardSet(
    "b1-intermediate-phrases",
    "Intermediate Phrases",
    "Useful expressions for everyday conversations",
    "B1",
    "Social",
    25,
    MessageSquare
  ),
  createFlashcardSet(
    "b1-cultural-expressions",
    "Cultural Expressions",
    "Common idiomatic expressions and cultural sayings",
    "B1",
    "Social",
    25,
    Globe
  ),
  createFlashcardSet(
    "b1-emotions-feelings",
    "Emotions & Feelings",
    "Express complex emotions and feelings",
    "B1",
    "Social",
    25,
    Heart
  ),
  createFlashcardSet(
    "b1-entertainment",
    "Entertainment & Media",
    "Vocabulary for movies, music, and media",
    "B1",
    "Arts",
    25,
    Music
  ),
  createFlashcardSet(
    "b1-home-living",
    "Home & Living",
    "Advanced household and living vocabulary",
    "B1",
    "Social",
    25,
    Home
  ),
  createFlashcardSet(
    "b1-shopping-commerce",
    "Shopping & Commerce",
    "Advanced shopping and business transactions",
    "B1",
    "Business",
    25,
    ShoppingBag
  ),
  createFlashcardSet(
    "b1-travel-tourism",
    "Travel & Tourism",
    "Intermediate travel and tourism vocabulary",
    "B1",
    "Travel",
    25,  // Updated to match actual number of flashcards
    Plane
  ),
  createFlashcardSet(
    "b1-social-relationships",
    "Social Relationships",
    "Complex social interactions and relationships",
    "B1",
    "Social",
    25,
    Users
  ),
  createFlashcardSet(
    "b1-food-cuisine",
    "Food & Cuisine",
    "Advanced culinary and dining vocabulary",
    "B1",
    "Food",
    25,
    Utensils
  ),
  createFlashcardSet(
    "b1-hobbies-interests",
    "Hobbies & Interests",
    "Vocabulary for various leisure activities",
    "B1",
    "Social",
    25,
    Camera
  ),
  createFlashcardSet(
    "b1-environment",
    "Environment & Nature",
    "Vocabulary about nature and environmental topics",
    "B1",
    "Academic",
    25,
    Globe
  )
];

