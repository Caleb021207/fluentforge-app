import React from "react";
import { BookOpen, MessageCircle, Utensils, Globe, Briefcase, GraduationCap, Users, Laptop, HeartPulse, Palette } from "lucide-react";
import { FlashcardSet, Flashcard } from "../types";

// Helper for creating flashcard sets
const createFlashcardSet = (
  id: string,
  title: string,
  description: string,
  level: any,
  category: any,
  cardCount: number,
  icon: any
): FlashcardSet => ({
  id,
  title,
  description,
  level,
  category,
  cardCount,
  icon: React.createElement(icon, { className: "h-6 w-6" }),
});

// Sample flashcard sets by CEFR level
export const flashcardSets: Record<string, FlashcardSet[]> = {
  A1: [
    createFlashcardSet(
      "a1-basics",
      "Basic Vocabulary",
      "Essential words for absolute beginners",
      "A1",
      "Basics",
      25,
      BookOpen
    ),
    createFlashcardSet(
      "a1-greetings",
      "Greetings & Introductions",
      "Common phrases for meeting people",
      "A1",
      "Greetings",
      20,
      MessageCircle
    ),
    createFlashcardSet(
      "a1-food",
      "Food & Drinks",
      "Basic food and drink vocabulary",
      "A1",
      "Food",
      30,
      Utensils
    ),
  ],
  A2: [
    createFlashcardSet(
      "a2-travel",
      "Travel Essentials",
      "Vocabulary for basic travel situations",
      "A2",
      "Travel",
      35,
      Globe
    ),
    createFlashcardSet(
      "a2-social",
      "Social Interactions",
      "Words and phrases for everyday conversations",
      "A2",
      "Social",
      25,
      Users
    ),
  ],
  B1: [
    createFlashcardSet(
      "b1-work",
      "Work & Career",
      "Professional vocabulary for the workplace",
      "B1",
      "Business",
      40,
      Briefcase
    ),
    createFlashcardSet(
      "b1-technology",
      "Technology",
      "Words related to computers and modern tech",
      "B1",
      "Technology",
      30,
      Laptop
    ),
  ],
  B2: [
    createFlashcardSet(
      "b2-health",
      "Health & Medicine",
      "Discussing health issues and medical terms",
      "B2",
      "Health",
      35,
      HeartPulse
    ),
    createFlashcardSet(
      "b2-academic",
      "Academic Language",
      "Vocabulary for education and academic contexts",
      "B2",
      "Academic",
      45,
      GraduationCap
    ),
  ],
  C1: [
    createFlashcardSet(
      "c1-arts",
      "Arts & Culture",
      "Discussing literature, art, and cultural topics",
      "C1",
      "Arts",
      40,
      Palette
    ),
    createFlashcardSet(
      "c1-business",
      "Business Negotiations",
      "Advanced business and negotiation terminology",
      "C1",
      "Business",
      35,
      Briefcase
    ),
  ],
  C2: [
    createFlashcardSet(
      "c2-academic",
      "Academic Research",
      "Vocabulary for academic research and publishing",
      "C2",
      "Academic",
      50,
      GraduationCap
    ),
    createFlashcardSet(
      "c2-social",
      "Colloquial Expressions",
      "Advanced idioms and expressions",
      "C2",
      "Social",
      45,
      Users
    ),
  ],
};

// Sample flashcards for demonstration
export const sampleFlashcards: Record<string, Flashcard[]> = {
  "a1-basics": [
    {
      id: "1",
      term: "casa",
      definition: "house",
      example: "Mi casa es grande.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "2",
      term: "perro",
      definition: "dog",
      example: "Tengo un perro negro.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "3",
      term: "gato",
      definition: "cat",
      example: "El gato duerme en el sofá.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "4",
      term: "libro",
      definition: "book",
      example: "Estoy leyendo un libro interesante.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "5",
      term: "agua",
      definition: "water",
      example: "Quiero un vaso de agua, por favor.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "6",
      term: "mesa",
      definition: "table",
      example: "La mesa está en la cocina.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "7",
      term: "silla",
      definition: "chair",
      example: "Siéntate en la silla, por favor.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "8",
      term: "ventana",
      definition: "window",
      example: "Abre la ventana, hace calor.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "9",
      term: "puerta",
      definition: "door",
      example: "Cierra la puerta cuando salgas.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "10",
      term: "teléfono",
      definition: "phone",
      example: "Mi teléfono está sonando.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "11",
      term: "papel",
      definition: "paper",
      example: "Necesito una hoja de papel.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "12",
      term: "lápiz",
      definition: "pencil",
      example: "¿Tienes un lápiz que me prestes?",
      level: "A1",
      category: "Basics"
    },
    {
      id: "13",
      term: "reloj",
      definition: "clock/watch",
      example: "¿Qué hora marca tu reloj?",
      level: "A1",
      category: "Basics"
    },
    {
      id: "14",
      term: "sol",
      definition: "sun",
      example: "Hoy el sol brilla mucho.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "15",
      term: "luna",
      definition: "moon",
      example: "La luna está llena esta noche.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "16",
      term: "árbol",
      definition: "tree",
      example: "Hay un árbol grande en el jardín.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "17",
      term: "flor",
      definition: "flower",
      example: "Esta flor huele muy bien.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "18",
      term: "coche",
      definition: "car",
      example: "Mi coche es azul.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "19",
      term: "bicicleta",
      definition: "bicycle",
      example: "Me gusta montar en bicicleta.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "20",
      term: "zapatos",
      definition: "shoes",
      example: "Mis zapatos son nuevos.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "21",
      term: "camisa",
      definition: "shirt",
      example: "Me pongo una camisa blanca.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "22",
      term: "pantalón",
      definition: "pants",
      example: "Este pantalón me queda grande.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "23",
      term: "manzana",
      definition: "apple",
      example: "Como una manzana cada día.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "24",
      term: "plátano",
      definition: "banana",
      example: "Me gusta el plátano maduro.",
      level: "A1",
      category: "Basics"
    },
    {
      id: "25",
      term: "leche",
      definition: "milk",
      example: "Bebo un vaso de leche cada mañana.",
      level: "A1",
      category: "Basics"
    }
  ],
  "a1-greetings": [
    {
      id: "1",
      term: "Hola",
      definition: "Hello",
      example: "¡Hola! ¿Cómo estás?",
      level: "A1",
      category: "Greetings"
    },
    {
      id: "2",
      term: "Buenos días",
      definition: "Good morning",
      example: "Buenos días, profesor.",
      level: "A1",
      category: "Greetings"
    },
    {
      id: "3",
      term: "Buenas tardes",
      definition: "Good afternoon",
      example: "Buenas tardes, ¿cómo está usted?",
      level: "A1",
      category: "Greetings"
    },
    {
      id: "4",
      term: "Buenas noches",
      definition: "Good evening/night",
      example: "Buenas noches, hasta mañana.",
      level: "A1",
      category: "Greetings"
    },
    {
      id: "5",
      term: "Adiós",
      definition: "Goodbye",
      example: "Adiós, nos vemos pronto.",
      level: "A1",
      category: "Greetings"
    },
  ],
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
