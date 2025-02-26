
import { FlashcardSet, Flashcard } from "../types";
import { a1FlashcardSets } from "./levels/a1FlashcardSets";
import { a2FlashcardSets } from "./levels/a2FlashcardSets";
import { b1FlashcardSets } from "./levels/b1FlashcardSets";
import { b2FlashcardSets } from "./levels/b2FlashcardSets";
import { c1FlashcardSets } from "./levels/c1FlashcardSets";
import { c2FlashcardSets } from "./levels/c2FlashcardSets";
import { a1BasicsFlashcards } from "./flashcards/a1BasicsFlashcards";
import { a1ConnectorWordsFlashcards } from "./flashcards/a1ConnectorWordsFlashcards";
import { a1VerbsConjugationsFlashcards } from "./flashcards/a1VerbsConjugationsFlashcards";
import { a1GreetingsFlashcards } from "./flashcards/a1GreetingsFlashcards";
import { a1FoodFlashcards } from "./flashcards/a1FoodFlashcards";
import { a1NumbersColorsFlashcards } from "./flashcards/a1NumbersColorsFlashcards";
import { a1ClassroomFlashcards } from "./flashcards/a1ClassroomFlashcards";
import { a1PersonalInfoFlashcards } from "./flashcards/a1PersonalInfoFlashcards";
import { a1DirectionsFlashcards } from "./flashcards/a1DirectionsFlashcards";
import { a1TimeFlashcards } from "./flashcards/a1TimeFlashcards";
import { a1CalendarFlashcards } from "./flashcards/a1CalendarFlashcards";
import { a1ProfessionsFlashcards } from "./flashcards/a1ProfessionsFlashcards";
import { a1DailyRoutinesFlashcards } from "./flashcards/a1DailyRoutinesFlashcards";
import { a1HouseFlashcards } from "./flashcards/a1HouseFlashcards";
import { a1WeatherFlashcards } from "./flashcards/a1WeatherFlashcards";
import { a1ShoppingFlashcards } from "./flashcards/a1ShoppingFlashcards";
import { a1ClothingFlashcards } from "./flashcards/a1ClothingFlashcards";
import { a1TransportationFlashcards } from "./flashcards/a1TransportationFlashcards";
import { a2TravelFlashcards } from "./flashcards/a2TravelFlashcards";
import { a2SocialFlashcards } from "./flashcards/a2SocialFlashcards";
import { a2DatesTimesFlashcards } from "./flashcards/a2DateTime";
import { a2WeatherFlashcards } from "./flashcards/a2WeatherFlashcards";
import { a2FamilyFlashcards } from "./flashcards/a2FamilyFlashcards";
import { a2PeopleFlashcards } from "./flashcards/a2People";

// Combine all flashcard sets by CEFR level
export const flashcardSets: Record<string, FlashcardSet[]> = {
  A1: a1FlashcardSets,
  A2: a2FlashcardSets,
  B1: b1FlashcardSets,
  B2: b2FlashcardSets,
  C1: c1FlashcardSets,
  C2: c2FlashcardSets,
};

// Map of all flashcards organized by set ID
export const sampleFlashcards: Record<string, Flashcard[]> = {
  "a1-basics": a1BasicsFlashcards,
  "a1-connector-words": a1ConnectorWordsFlashcards,
  "a1-verbs-conjugations": a1VerbsConjugationsFlashcards,
  "a1-greetings": a1GreetingsFlashcards,
  "a1-food": a1FoodFlashcards,
  "a1-numbers-colors": a1NumbersColorsFlashcards,
  "a1-classroom": a1ClassroomFlashcards,
  "a1-personal-info": a1PersonalInfoFlashcards,
  "a1-directions": a1DirectionsFlashcards,
  "a1-time": a1TimeFlashcards,
  "a1-calendar": a1CalendarFlashcards,
  "a1-professions": a1ProfessionsFlashcards,
  "a1-daily-routines": a1DailyRoutinesFlashcards,
  "a1-house": a1HouseFlashcards,
  "a1-weather": a1WeatherFlashcards,
  "a1-shopping": a1ShoppingFlashcards,
  "a1-clothing": a1ClothingFlashcards,
  "a1-transportation": a1TransportationFlashcards,
  "a2-travel": a2TravelFlashcards,
  "a2-social": a2SocialFlashcards,
  "a2-dates-times": a2DatesTimesFlashcards,
  "a2-weather": a2WeatherFlashcards,
  "a2-family": a2FamilyFlashcards,
  "a2-people": a2PeopleFlashcards,
};

// Function to get all flashcard sets
export const getAllFlashcardSets = (): FlashcardSet[] => {
  return Object.values(flashcardSets).flat();
};

// Function to get flashcard sets by level
export const getFlashcardSetsByLevel = (level: string): FlashcardSet[] => {
  return flashcardSets[level] || [];
};

// Function to get flashcards by set ID
export const getFlashcardsBySetId = (setId: string): Flashcard[] => {
  return sampleFlashcards[setId] || [];
};
