
import { HeartPulse, GraduationCap, BookOpen, Brain, MessageSquare, Book, Globe, Briefcase, Building, FileText, PenTool, Focus, Lightbulb, Users, Clock } from "lucide-react";
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
    0,  // Updated to 0 since the actual flashcards haven't been implemented yet
    HeartPulse
  ),
  createFlashcardSet(
    "b2-academic",
    "Academic Language",
    "Vocabulary for education and academic contexts",
    "B2",
    "Academic",
    0,  // Updated to 0 since the actual flashcards haven't been implemented yet
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
    0,
    Briefcase
  ),
  createFlashcardSet(
    "b2-debate-discussion",
    "Debate & Discussion",
    "Express and defend opinions effectively",
    "B2",
    "Social",
    0,
    Users
  ),
  createFlashcardSet(
    "b2-politics-society",
    "Politics & Society",
    "Discuss social issues and political topics",
    "B2",
    "Academic",
    0,
    Building
  ),
  createFlashcardSet(
    "b2-literature-arts",
    "Literature & Arts",
    "Discuss books, art, and cultural expressions",
    "B2",
    "Arts",
    0,
    FileText
  ),
  createFlashcardSet(
    "b2-writing-styles",
    "Writing Styles",
    "Improve written expression and composition",
    "B2",
    "Academic",
    0,
    PenTool
  ),
  createFlashcardSet(
    "b2-advanced-connectors",
    "Advanced Connectors",
    "Link ideas with sophisticated transitions",
    "B2",
    "Academic",
    0,
    Focus
  ),
  createFlashcardSet(
    "b2-idioms-expressions",
    "Idioms & Expressions",
    "Authentic idiomatic expressions used by natives",
    "B2",
    "Social",
    0,
    Lightbulb
  ),
  createFlashcardSet(
    "b2-cultural-insights",
    "Cultural Insights",
    "Deep cultural knowledge of Spanish-speaking regions",
    "B2",
    "Social",
    0,
    Globe
  )
];
