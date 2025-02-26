
// Import flashcard sets by level
import { a1FlashcardSets } from './levels/a1FlashcardSets';
import { a2FlashcardSets } from './levels/a2FlashcardSets';
import { b1FlashcardSets } from './levels/b1FlashcardSets';
import { b2FlashcardSets } from './levels/b2FlashcardSets';
import { c1c2FlashcardSets } from './levels/c1c2FlashcardSets';

// Import individual flashcard decks
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

// Get flashcards for a specific set ID
export const getFlashcardsForSet = (setId: string) => {
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
  if (setId === "b2-subjunctive") return b2SubjunctiveFlashcards;
  if (setId === "b2-academic") return b2AcademicFlashcards;
  if (setId === "b2-literature-arts") return b2LiteratureArtsFlashcards;

  // Default empty array if no match
  return [];
};
