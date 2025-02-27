
// Import flashcard sets by level
import { a1FlashcardSets } from './levels/a1FlashcardSets';
import { a2FlashcardSets } from './levels/a2FlashcardSets';
import { b1FlashcardSets } from './levels/b1FlashcardSets';
import { b2FlashcardSets } from './levels/b2FlashcardSets';
import { c1c2FlashcardSets } from './levels/c1c2FlashcardSets';
import { saveFlashcardSetProgress } from '../utils/levelUnlockUtils';
import { supabase } from '@/integrations/supabase/client';

// Import individual flashcard decks
// A1 Level
import { a1BasicsFlashcards } from './flashcards/a1BasicsFlashcards';
import { a1ConnectorWordsFlashcards } from './flashcards/a1ConnectorWordsFlashcards';
import { a1ArVerbConjugationsFlashcards } from './flashcards/a1ArVerbConjugationsFlashcards';
import { a1ErIrVerbConjugationsFlashcards } from './flashcards/a1ErIrVerbConjugationsFlashcards';
import { a1VerbsConjugationsFlashcards } from './flashcards/a1VerbsConjugationsFlashcards';
import { a1GreetingsFlashcards } from './flashcards/a1GreetingsFlashcards';
import { a1FoodFlashcards } from './flashcards/a1FoodFlashcards';
import { a1NumbersColorsFlashcards } from './flashcards/a1NumbersColorsFlashcards';
import { a1ClassroomFlashcards } from './flashcards/a1ClassroomFlashcards';
import { a1PersonalInfoFlashcards } from './flashcards/a1PersonalInfoFlashcards';
import { a1DirectionsFlashcards } from './flashcards/a1DirectionsFlashcards';
import { a1TimeFlashcards } from './flashcards/a1TimeFlashcards';
import { a1CalendarFlashcards } from './flashcards/a1CalendarFlashcards';
import { a1ProfessionsFlashcards } from './flashcards/a1ProfessionsFlashcards';
import { a1DailyRoutinesFlashcards } from './flashcards/a1DailyRoutinesFlashcards';
import { a1HouseFlashcards } from './flashcards/a1HouseFlashcards';
import { a1WeatherFlashcards } from './flashcards/a1WeatherFlashcards';
import { a1ShoppingFlashcards } from './flashcards/a1ShoppingFlashcards';
import { a1ClothingFlashcards } from './flashcards/a1ClothingFlashcards';
import { a1TransportationFlashcards } from './flashcards/a1TransportationFlashcards';

// A2 Level
import { a2TravelFlashcards } from './flashcards/a2TravelFlashcards';
import { a2SocialFlashcards } from './flashcards/a2SocialFlashcards';
import { a2WeatherFlashcards } from './flashcards/a2WeatherFlashcards';
import { a2WorkFlashcards } from './flashcards/a2WorkFlashcards';
import { a2ShoppingMoneyFlashcards } from './flashcards/a2ShoppingMoneyFlashcards';
import { basicPeopleFlashcards } from './flashcards/a2People/basicPeople';
import { relationshipsFlashcards } from './flashcards/a2People/relationships';
import { occupationsFlashcards } from './flashcards/a2People/occupations';
import { personalityDescriptionsFlashcards } from './flashcards/a2People/personalityDescriptions';

// B1 Level
import { b1WorkFlashcards } from './flashcards/b1WorkFlashcards';
import { b1TechnologyFlashcards } from './flashcards/b1TechnologyFlashcards';
import { b1EmotionsFeelingsFlashcards } from './flashcards/b1EmotionsFeelingsFlashcards';
import { b1EntertainmentFlashcards } from './flashcards/b1EntertainmentFlashcards';
import { b1TravelTourismFlashcards } from './flashcards/b1TravelTourismFlashcards';
import { b1SocialRelationshipsFlashcards } from './flashcards/b1SocialRelationshipsFlashcards';
import { b1CulturalExpressionsFlashcards } from './flashcards/b1CulturalExpressionsFlashcards';

// B2 Level
import { b2SubjunctiveFlashcards } from './flashcards/b2SubjunctiveFlashcards';
import { b2AcademicFlashcards } from './flashcards/b2AcademicFlashcards';
import { b2LiteratureArtsFlashcards } from './flashcards/b2LiteratureArtsFlashcards';
import { b2HealthFlashcards } from './flashcards/b2HealthFlashcards';

// C1-C2 Level
import { c1ArtsFlashcards } from './flashcards/c1ArtsFlashcards';
import { c1BusinessFlashcards } from './flashcards/c1BusinessFlashcards';
import { c2AcademicFlashcards } from './flashcards/c2AcademicFlashcards';
import { c2SocialFlashcards } from './flashcards/c2SocialFlashcards';
import { c1c2LiteratureFlashcards } from './flashcards/c1c2LiteratureFlashcards';
import { c1c2GlobalAffairsFlashcards } from './flashcards/c1c2GlobalAffairsFlashcards';
import { c1c2MedicalScientificFlashcards } from './flashcards/c1c2MedicalScientificFlashcards';

// Helper function to combine all flashcard sets
export const getAllFlashcardSets = () => {
  return [
    ...a1FlashcardSets,
    ...a2FlashcardSets,
    ...b1FlashcardSets,
    ...b2FlashcardSets,
    ...c1c2FlashcardSets,
  ];
};

// Function to get flashcard sets by level
export const getFlashcardSetsByLevel = (level: string) => {
  if (level === "A1") return a1FlashcardSets;
  if (level === "A2") return a2FlashcardSets;
  if (level === "B1") return b1FlashcardSets;
  if (level === "B2") return b2FlashcardSets;
  if (level === "C1-C2") return c1c2FlashcardSets;
  return [];
};

// Get flashcards for a specific set ID
export const getFlashcardsForSet = (setId: string) => {
  console.log(`Getting flashcards for set: ${setId}`);
  
  // A1 Flashcards
  if (setId === "a1-basics") return a1BasicsFlashcards;
  if (setId === "a1-connector-words") return a1ConnectorWordsFlashcards;
  if (setId === "a1-ar-verbs") return a1ArVerbConjugationsFlashcards;
  if (setId === "a1-erir-verbs") return a1ErIrVerbConjugationsFlashcards;
  if (setId === "a1-verbs-conjugations") return a1VerbsConjugationsFlashcards;
  if (setId === "a1-greetings") return a1GreetingsFlashcards;
  if (setId === "a1-food") return a1FoodFlashcards;
  if (setId === "a1-numbers-colors") return a1NumbersColorsFlashcards;
  if (setId === "a1-classroom") return a1ClassroomFlashcards;
  if (setId === "a1-personal-info") return a1PersonalInfoFlashcards;
  if (setId === "a1-directions") return a1DirectionsFlashcards;
  if (setId === "a1-time") return a1TimeFlashcards;
  if (setId === "a1-calendar") return a1CalendarFlashcards;
  if (setId === "a1-professions") return a1ProfessionsFlashcards;
  if (setId === "a1-daily-routines") return a1DailyRoutinesFlashcards;
  if (setId === "a1-house") return a1HouseFlashcards;
  if (setId === "a1-weather") return a1WeatherFlashcards;
  if (setId === "a1-shopping") return a1ShoppingFlashcards;
  if (setId === "a1-clothing") return a1ClothingFlashcards;
  if (setId === "a1-transportation") return a1TransportationFlashcards;
  
  // A2 Flashcards
  if (setId === "a2-people") {
    return [
      ...basicPeopleFlashcards,
      ...relationshipsFlashcards,
      ...occupationsFlashcards,
      ...personalityDescriptionsFlashcards
    ];
  }
  if (setId === "a2-travel") return a2TravelFlashcards;
  if (setId === "a2-social") return a2SocialFlashcards;
  if (setId === "a2-weather") return a2WeatherFlashcards;
  if (setId === "a2-work") return a2WorkFlashcards;
  if (setId === "a2-shopping-money") return a2ShoppingMoneyFlashcards;

  // B1 Flashcards
  if (setId === "b1-work") return b1WorkFlashcards;
  if (setId === "b1-technology") return b1TechnologyFlashcards; 
  if (setId === "b1-emotions-feelings") return b1EmotionsFeelingsFlashcards;
  if (setId === "b1-entertainment") return b1EntertainmentFlashcards;
  if (setId === "b1-travel-tourism") return b1TravelTourismFlashcards;
  if (setId === "b1-social-relationships") return b1SocialRelationshipsFlashcards;
  if (setId === "b1-cultural-expressions") return b1CulturalExpressionsFlashcards;

  // B2 Flashcards
  if (setId === "b2-health") return b2HealthFlashcards;
  if (setId === "b2-subjunctive") return b2SubjunctiveFlashcards;
  if (setId === "b2-academic") return b2AcademicFlashcards;
  if (setId === "b2-literature-arts") return b2LiteratureArtsFlashcards;
  
  // C1-C2 Flashcards
  if (setId === "c1-arts") return c1ArtsFlashcards;
  if (setId === "c1-business") return c1BusinessFlashcards;
  if (setId === "c2-academic") return c2AcademicFlashcards;
  if (setId === "c2-social") return c2SocialFlashcards;
  if (setId === "c1c2-literature") return c1c2LiteratureFlashcards;
  if (setId === "c1c2-global-affairs") return c1c2GlobalAffairsFlashcards;
  if (setId === "c1c2-medical-scientific") return c1c2MedicalScientificFlashcards;

  // If no match is found, log an error and return an empty array
  console.error(`No flashcards found for set ID: ${setId}`);
  return [];
};

// Function to update the progress of a flashcard set
export const updateFlashcardSetProgress = async (setId: string, completed: boolean, score?: number) => {
  // In a real app, this would update the user's progress in a database
  console.log(`Updated set ${setId}: completed=${completed}, score=${score}`);

  // Get the current user
  const { data } = await supabase.auth.getUser();
  const userId = data.user?.id;
  
  if (userId && score !== undefined) {
    // Get the set's level
    const allSets = getAllFlashcardSets();
    const set = allSets.find(s => s.id === setId);
    
    if (set) {
      // Save the progress for level unlocking
      saveFlashcardSetProgress(userId, set.level, setId, score);
    }
  }
};

// Alias getFlashcardsForSet as getFlashcardsBySetId for backward compatibility
export const getFlashcardsBySetId = getFlashcardsForSet;
