
import { Flashcard } from "../../../types";
import { basicPeopleFlashcards } from "./basicPeople";
import { occupationsFlashcards } from "./occupations";
import { relationshipsFlashcards } from "./relationships";
import { personalityDescriptionsFlashcards } from "./personalityDescriptions";

export const a2PeopleFlashcards: Flashcard[] = [
  ...basicPeopleFlashcards,
  ...occupationsFlashcards,
  ...relationshipsFlashcards,
  ...personalityDescriptionsFlashcards
];
