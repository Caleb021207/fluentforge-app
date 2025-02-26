
import { Flashcard } from "../../../types";
import { basicTimeConceptsFlashcards } from "./basicConcepts";
import { partsOfDayFlashcards } from "./partsOfDay";
import { daysOfWeekFlashcards } from "./daysOfWeek";
import { monthsFlashcards } from "./months";
import { timeExpressionsFlashcards } from "./timeExpressions";

export const a2DatesTimesFlashcards: Flashcard[] = [
  ...basicTimeConceptsFlashcards,
  ...partsOfDayFlashcards,
  ...daysOfWeekFlashcards,
  ...monthsFlashcards,
  ...timeExpressionsFlashcards
];
