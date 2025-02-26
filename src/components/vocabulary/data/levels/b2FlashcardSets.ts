
import { HeartPulse, GraduationCap, BookOpen, Brain, MessageSquare, Book, Globe, Briefcase, FileText, Focus, Lightbulb, Users, Clock } from "lucide-react";
import { createFlashcardSet } from "../utils/flashcardUtils";
import { FlashcardSet } from "../../types";

// B2 level flashcard sets
export const b2FlashcardSets: FlashcardSet[] = [
  createFlashcardSet(
    "b2-health",
    "Health & Medicine",
    "Discussing health issues and medical terms",
    "B2",
    "Health",
    25,  // Updated from 0 to 25 to reflect actual count
    HeartPulse
  ),
  createFlashcardSet(
    "b2-academic",
    "Academic Language",
    "Vocabulary for education and academic contexts",
    "B2",
    "Academic",
    25,  // Updated from 0 to 25 to reflect actual count
    GraduationCap
  ),
  createFlashcardSet(
    "b2-subjunctive",
    "Subjunctive Mood",
    "Master the Spanish subjunctive in various contexts",
    "B2",
    "Academic",
    25,
    BookOpen
  ),
  createFlashcardSet(
    "b2-conditional-hypothetical",
    "Conditionals & Hypotheticals",
    "Express conditional and hypothetical situations",
    "B2",
    "Academic",
    25,
    Brain
  ),
  createFlashcardSet(
    "b2-imperfect-conjugations",
    "Imperfect Conjugations",
    "Advanced uses of imperfect tense (-ía forms)",
    "B2",
    "Academic",
    25,
    Book
  ),
  createFlashcardSet(
    "b2-perfect-tenses",
    "Perfect Tenses",
    "Present perfect, past perfect, and future perfect",
    "B2",
    "Academic",
    25,
    Clock
  ),
  createFlashcardSet(
    "b2-complex-phrases",
    "Complex Expressions",
    "Sophisticated phrases for fluent conversation",
    "B2",
    "Social",
    25,
    MessageSquare
  ),
  createFlashcardSet(
    "b2-business-professional",
    "Business & Professional",
    "Advanced vocabulary for professional settings",
    "B2",
    "Business",
    25,  // Updated from 0 to 25 to reflect actual count
    Briefcase
  ),
  createFlashcardSet(
    "b2-debate-discussion",
    "Debate & Discussion",
    "Express and defend opinions effectively",
    "B2",
    "Social",
    25,  // Updated from 0 to 25 to reflect actual count
    Users
  ),
  createFlashcardSet(
    "b2-literature-arts",
    "Literature & Arts",
    "Discuss books, art, and cultural expressions",
    "B2",
    "Arts",
    25, // Updated from 0 to 25 to reflect actual count
    FileText
  ),
  createFlashcardSet(
    "b2-advanced-connectors",
    "Advanced Connectors",
    "Link ideas with sophisticated transitions",
    "B2",
    "Academic",
    25,  // Updated from 0 to 25 to reflect actual count
    Focus
  ),
  createFlashcardSet(
    "b2-idioms-expressions",
    "Idioms & Expressions",
    "Authentic idiomatic expressions used by natives",
    "B2",
    "Social",
    25,  // Updated from 0 to 25 to reflect actual count
    Lightbulb
  ),
  createFlashcardSet(
    "b2-cultural-insights",
    "Cultural Insights",
    "Deep cultural knowledge of Spanish-speaking regions",
    "B2",
    "Social",
    25,  // Updated from 0 to 25 to reflect actual count
    Globe
  )
];
