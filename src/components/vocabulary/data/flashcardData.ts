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
import { a2FoodRestaurantsFlashcards } from "./flashcards/a2FoodRestaurantsFlashcards";
import { a2HealthBodyFlashcards } from "./flashcards/a2HealthBodyFlashcards";
import { a2ShoppingMoneyFlashcards } from "./flashcards/a2ShoppingMoneyFlashcards";
import { a2HobbiesFlashcards } from "./flashcards/a2HobbiesFlashcards";
import { a2WorkFlashcards } from "./flashcards/a2WorkFlashcards";
import { a2EducationFlashcards } from "./flashcards/a2EducationFlashcards";
import { b1WorkFlashcards } from "./flashcards/b1WorkFlashcards";
import { b1TechnologyFlashcards } from "./flashcards/b1TechnologyFlashcards";
import { b1PastTenseFlashcards } from "./flashcards/b1PastTenseFlashcards";
import { b1IrregularVerbsFlashcards } from "./flashcards/b1IrregularVerbsFlashcards";
import { b1IntermediatePhrasesFlashcards } from "./flashcards/b1IntermediatePhrasesFlashcards";
import { b1CulturalExpressionsFlashcards } from "./flashcards/b1CulturalExpressionsFlashcards";
import { b1EmotionsFeelingsFlashcards } from "./flashcards/b1EmotionsFeelingsFlashcards";
import { b1EntertainmentFlashcards } from "./flashcards/b1EntertainmentFlashcards";
import { b1HomeLivingFlashcards } from "./flashcards/b1HomeLivingFlashcards";
import { b1ShoppingCommerceFlashcards } from "./flashcards/b1ShoppingCommerceFlashcards";
import { b1TravelTourismFlashcards } from "./flashcards/b1TravelTourismFlashcards";
import { b1SocialRelationshipsFlashcards } from "./flashcards/b1SocialRelationshipsFlashcards";
import { b1FoodCuisineFlashcards } from "./flashcards/b1FoodCuisineFlashcards";
import { b1HobbiesInterestsFlashcards } from "./flashcards/b1HobbiesInterestsFlashcards";
import { b1EnvironmentFlashcards } from "./flashcards/b1EnvironmentFlashcards";
import { b2SubjunctiveFlashcards } from "./flashcards/b2SubjunctiveFlashcards";
import { b2ConditionalHypotheticalFlashcards } from "./flashcards/b2ConditionalHypotheticalFlashcards";
import { b2ImperfectConjugationsFlashcards } from "./flashcards/b2ImperfectConjugationsFlashcards";
import { b2PerfectTensesFlashcards } from "./flashcards/b2PerfectTensesFlashcards";
import { b2ComplexPhrasesFlashcards } from "./flashcards/b2ComplexPhrasesFlashcards";
import { a1ArVerbConjugationsFlashcards } from "./flashcards/a1ArVerbConjugationsFlashcards";
import { a1ErIrVerbConjugationsFlashcards } from "./flashcards/a1ErIrVerbConjugationsFlashcards";

export const flashcardSets: Record<string, FlashcardSet[]> = {
  A1: a1FlashcardSets,
  A2: a2FlashcardSets,
  B1: b1FlashcardSets,
  B2: b2FlashcardSets,
  C1: c1FlashcardSets,
  C2: c2FlashcardSets,
};

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
  "a2-food-restaurants": a2FoodRestaurantsFlashcards,
  "a2-health-body": a2HealthBodyFlashcards,
  "a2-shopping-money": a2ShoppingMoneyFlashcards,
  "a2-hobbies": a2HobbiesFlashcards,
  "a2-work": a2WorkFlashcards,
  "a2-education": a2EducationFlashcards,
  "b1-work": b1WorkFlashcards,
  "b1-technology": b1TechnologyFlashcards,
  "b1-past-tense": b1PastTenseFlashcards,
  "b1-irregular-verbs": b1IrregularVerbsFlashcards,
  "b1-intermediate-phrases": b1IntermediatePhrasesFlashcards,
  "b1-cultural-expressions": b1CulturalExpressionsFlashcards,
  "b1-emotions-feelings": b1EmotionsFeelingsFlashcards,
  "b1-entertainment": b1EntertainmentFlashcards,
  "b1-home-living": b1HomeLivingFlashcards,
  "b1-shopping-commerce": b1ShoppingCommerceFlashcards,
  "b1-travel-tourism": b1TravelTourismFlashcards,
  "b1-social-relationships": b1SocialRelationshipsFlashcards,
  "b1-food-cuisine": b1FoodCuisineFlashcards,
  "b1-hobbies-interests": b1HobbiesInterestsFlashcards,
  "b1-environment": b1EnvironmentFlashcards,
  "b2-subjunctive": b2SubjunctiveFlashcards,
  "b2-conditional-hypothetical": b2ConditionalHypotheticalFlashcards,
  "b2-imperfect-conjugations": b2ImperfectConjugationsFlashcards,
  "b2-perfect-tenses": b2PerfectTensesFlashcards,
  "b2-complex-phrases": b2ComplexPhrasesFlashcards,
  "a1-ar-verbs": a1ArVerbConjugationsFlashcards,
  "a1-erir-verbs": a1ErIrVerbConjugationsFlashcards,
};

export const getAllFlashcardSets = (): FlashcardSet[] => {
  return Object.values(flashcardSets).flat();
};

export const getFlashcardSetsByLevel = (level: string): FlashcardSet[] => {
  return flashcardSets[level] || [];
};

export const getFlashcardsBySetId = (setId: string): Flashcard[] => {
  return sampleFlashcards[setId] || [];
};
