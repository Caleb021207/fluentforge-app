
import { Flashcard, FlashcardSet } from "../types";
import { a1FlashcardSets } from "./levels/a1FlashcardSets";
import { a2FlashcardSets } from "./levels/a2FlashcardSets";
import { b1FlashcardSets } from "./levels/b1FlashcardSets";
import { b2FlashcardSets } from "./levels/b2FlashcardSets";
import { c1c2FlashcardSets } from "./levels/c1c2FlashcardSets";

// Import flashcard data
import { a1BasicsFlashcards } from "./flashcards/a1BasicsFlashcards";
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
import { a1VerbsConjugationsFlashcards } from "./flashcards/a1VerbsConjugationsFlashcards";
import { a1ConnectorWordsFlashcards } from "./flashcards/a1ConnectorWordsFlashcards";
import { a1ArVerbConjugationsFlashcards } from "./flashcards/a1ArVerbConjugationsFlashcards";
import { a1ErIrVerbConjugationsFlashcards } from "./flashcards/a1ErIrVerbConjugationsFlashcards";

// Import more flashcard data for A2, B1, B2, etc.
import { a2EducationFlashcards } from "./flashcards/a2EducationFlashcards";
import { a2FamilyFlashcards } from "./flashcards/a2FamilyFlashcards";
import { a2FoodRestaurantsFlashcards } from "./flashcards/a2FoodRestaurantsFlashcards";
import { a2HealthBodyFlashcards } from "./flashcards/a2HealthBodyFlashcards";
import { a2HobbiesFlashcards } from "./flashcards/a2HobbiesFlashcards";
import { a2ShoppingMoneyFlashcards } from "./flashcards/a2ShoppingMoneyFlashcards";
import { a2SocialFlashcards } from "./flashcards/a2SocialFlashcards";
import { a2TravelFlashcards } from "./flashcards/a2TravelFlashcards";
import { a2WeatherFlashcards } from "./flashcards/a2WeatherFlashcards";
import { a2WorkFlashcards } from "./flashcards/a2WorkFlashcards";
import { a2DatesTimesFlashcards } from "./flashcards/a2DateTime";
import { a2PeopleFlashcards } from "./flashcards/a2People";

// B1 flashcards
import { b1CulturalExpressionsFlashcards } from "./flashcards/b1CulturalExpressionsFlashcards";
import { b1EmotionsFeelingsFlashcards } from "./flashcards/b1EmotionsFeelingsFlashcards";
import { b1EntertainmentFlashcards } from "./flashcards/b1EntertainmentFlashcards";
import { b1EnvironmentFlashcards } from "./flashcards/b1EnvironmentFlashcards";
import { b1FoodCuisineFlashcards } from "./flashcards/b1FoodCuisineFlashcards";
import { b1HobbiesInterestsFlashcards } from "./flashcards/b1HobbiesInterestsFlashcards";
import { b1HomeLivingFlashcards } from "./flashcards/b1HomeLivingFlashcards";
import { b1IntermediatePhrasesFlashcards } from "./flashcards/b1IntermediatePhrasesFlashcards";
import { b1IrregularVerbsFlashcards } from "./flashcards/b1IrregularVerbsFlashcards";
import { b1PastTenseFlashcards } from "./flashcards/b1PastTenseFlashcards";
import { b1ShoppingCommerceFlashcards } from "./flashcards/b1ShoppingCommerceFlashcards";
import { b1SocialRelationshipsFlashcards } from "./flashcards/b1SocialRelationshipsFlashcards";
import { b1TechnologyFlashcards } from "./flashcards/b1TechnologyFlashcards";
import { b1TravelTourismFlashcards } from "./flashcards/b1TravelTourismFlashcards";
import { b1WorkFlashcards } from "./flashcards/b1WorkFlashcards";

// B2 flashcards
import { b2SubjunctiveFlashcards } from "./flashcards/b2SubjunctiveFlashcards";
import { b2ConditionalHypotheticalFlashcards } from "./flashcards/b2ConditionalHypotheticalFlashcards";
import { b2ImperfectConjugationsFlashcards } from "./flashcards/b2ImperfectConjugationsFlashcards";
import { b2PerfectTensesFlashcards } from "./flashcards/b2PerfectTensesFlashcards";
import { b2ComplexPhrasesFlashcards } from "./flashcards/b2ComplexPhrasesFlashcards";
import { b2HealthFlashcards } from "./flashcards/b2HealthFlashcards";
import { b2AcademicFlashcards } from "./flashcards/b2AcademicFlashcards";
import { b2BusinessProfessionalFlashcards } from "./flashcards/b2BusinessProfessionalFlashcards";
import { b2DebateDiscussionFlashcards } from "./flashcards/b2DebateDiscussionFlashcards";
import { b2LiteratureArtsFlashcards } from "./flashcards/b2LiteratureArtsFlashcards";
import { b2AdvancedConnectorsFlashcards } from "./flashcards/b2AdvancedConnectorsFlashcards";
import { b2IdiomsExpressionsFlashcards } from "./flashcards/b2IdiomsExpressionsFlashcards";
import { b2CulturalInsightsFlashcards } from "./flashcards/b2CulturalInsightsFlashcards";

// Storage key for localStorage
const FLASHCARD_PROGRESS_KEY = 'lingua-flashcard-progress';

// In-memory storage of all flashcard sets
let allFlashcardSets: FlashcardSet[] = [
  ...a1FlashcardSets,
  ...a2FlashcardSets,
  ...b1FlashcardSets,
  ...b2FlashcardSets,
  ...c1c2FlashcardSets
];

// Try to load the progress data from localStorage
const loadProgressData = () => {
  try {
    const savedProgress = localStorage.getItem(FLASHCARD_PROGRESS_KEY);
    if (savedProgress) {
      const progressData = JSON.parse(savedProgress);
      
      // Update the in-memory flashcard sets with the saved progress
      allFlashcardSets = allFlashcardSets.map(set => {
        const savedSet = progressData[set.id];
        if (savedSet) {
          return {
            ...set,
            masteredCount: savedSet.masteredCount || 0,
            completed: savedSet.completed || false,
            score: savedSet.score
          };
        }
        return set;
      });
    }
  } catch (error) {
    console.error('Error loading flashcard progress:', error);
  }
};

// Save progress data to localStorage
const saveProgressData = () => {
  try {
    const progressData = allFlashcardSets.reduce((acc, set) => {
      if (set.masteredCount || set.completed || set.score) {
        acc[set.id] = {
          masteredCount: set.masteredCount || 0,
          completed: set.completed || false,
          score: set.score
        };
      }
      return acc;
    }, {} as Record<string, { masteredCount: number, completed: boolean, score?: number }>);
    
    localStorage.setItem(FLASHCARD_PROGRESS_KEY, JSON.stringify(progressData));
  } catch (error) {
    console.error('Error saving flashcard progress:', error);
  }
};

// Load progress data on initialization
loadProgressData();

// Get all flashcard sets
export const getAllFlashcardSets = (): FlashcardSet[] => {
  return allFlashcardSets;
};

// Get flashcard sets by level
export const getFlashcardSetsByLevel = (level: string): FlashcardSet[] => {
  return allFlashcardSets.filter(set => set.level === level);
};

// Update a flashcard set's progress
export const updateFlashcardSetProgress = (
  setId: string, 
  completed: boolean, 
  score?: number, 
  masteredCount?: number
) => {
  allFlashcardSets = allFlashcardSets.map(set => {
    if (set.id === setId) {
      return {
        ...set,
        completed,
        score,
        masteredCount: masteredCount !== undefined ? masteredCount : set.masteredCount
      };
    }
    return set;
  });
  
  // Save the updated progress
  saveProgressData();
  
  return allFlashcardSets.find(set => set.id === setId);
};

// Map of flashcard set IDs to their flashcard arrays
const flashcardMap: Record<string, Flashcard[]> = {
  "a1-basics": a1BasicsFlashcards,
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
  "a1-verbs-conjugations": a1VerbsConjugationsFlashcards,
  "a1-connector-words": a1ConnectorWordsFlashcards,
  "a1-ar-verbs": a1ArVerbConjugationsFlashcards,
  "a1-erir-verbs": a1ErIrVerbConjugationsFlashcards,
  
  // A2 flashcards
  "a2-education": a2EducationFlashcards,
  "a2-family": a2FamilyFlashcards,
  "a2-food-restaurants": a2FoodRestaurantsFlashcards,
  "a2-health-body": a2HealthBodyFlashcards,
  "a2-hobbies": a2HobbiesFlashcards,
  "a2-shopping-money": a2ShoppingMoneyFlashcards,
  "a2-social": a2SocialFlashcards,
  "a2-travel": a2TravelFlashcards,
  "a2-weather": a2WeatherFlashcards,
  "a2-work": a2WorkFlashcards,
  "a2-date-time": a2DatesTimesFlashcards,
  "a2-people": a2PeopleFlashcards,
  
  // B1 flashcards
  "b1-cultural-expressions": b1CulturalExpressionsFlashcards,
  "b1-emotions-feelings": b1EmotionsFeelingsFlashcards,
  "b1-entertainment": b1EntertainmentFlashcards,
  "b1-environment": b1EnvironmentFlashcards,
  "b1-food-cuisine": b1FoodCuisineFlashcards,
  "b1-hobbies-interests": b1HobbiesInterestsFlashcards,
  "b1-home-living": b1HomeLivingFlashcards,
  "b1-intermediate-phrases": b1IntermediatePhrasesFlashcards,
  "b1-irregular-verbs": b1IrregularVerbsFlashcards,
  "b1-past-tense": b1PastTenseFlashcards,
  "b1-shopping-commerce": b1ShoppingCommerceFlashcards,
  "b1-social-relationships": b1SocialRelationshipsFlashcards,
  "b1-technology": b1TechnologyFlashcards,
  "b1-travel-tourism": b1TravelTourismFlashcards,
  "b1-work": b1WorkFlashcards,
  
  // B2 flashcards
  "b2-subjunctive": b2SubjunctiveFlashcards,
  "b2-conditional-hypothetical": b2ConditionalHypotheticalFlashcards,
  "b2-imperfect-conjugations": b2ImperfectConjugationsFlashcards,
  "b2-perfect-tenses": b2PerfectTensesFlashcards,
  "b2-complex-phrases": b2ComplexPhrasesFlashcards,
  "b2-health": b2HealthFlashcards,
  "b2-academic": b2AcademicFlashcards,
  "b2-business-professional": b2BusinessProfessionalFlashcards,
  "b2-debate-discussion": b2DebateDiscussionFlashcards,
  "b2-literature-arts": b2LiteratureArtsFlashcards,
  "b2-advanced-connectors": b2AdvancedConnectorsFlashcards,
  "b2-idioms-expressions": b2IdiomsExpressionsFlashcards,
  "b2-cultural-insights": b2CulturalInsightsFlashcards,
  
  // C1-C2 flashcards will be added when they're implemented
  "c1-arts": [],
  "c1-business": [],
  "c2-academic": [],
  "c2-social": [],
  "c1c2-literature": [],
  "c1c2-global-affairs": [],
  "c1c2-medical-scientific": []
};

// Get flashcards by set ID
export const getFlashcardsBySetId = (setId: string): Flashcard[] => {
  return flashcardMap[setId] || [];
};
