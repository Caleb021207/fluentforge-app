
import { BookOpenCheck, School } from 'lucide-react';
import { Unit } from '../lessonUnits';

export const foodAndBeveragesUnit: Unit = {
  id: 3,
  title: "Food and Beverages",
  description: "Learn about Spanish cuisine and how to order in restaurants.",
  cefrLevel: "A1",
  xpPoints: 150,
  vocabulary: [
    "pan - bread",
    "leche - milk",
    "agua - water",
    "café - coffee",
    "té - tea",
    "manzana - apple",
    "plátano - banana",
    "pollo - chicken",
    "pescado - fish",
    "ensalada - salad",
    "arroz - rice",
    "huevo - egg"
  ],
  lessons: [
    {
      id: 1,
      title: "Fruits and Vegetables",
      description: "Learn names of common fruits and vegetables in Spanish",
      xpReward: 50,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you say 'apple' in Spanish?",
          options: ["Manzana", "Plátano", "Naranja", "Limón"],
          answer: "Manzana",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Manzana' means 'apple' in Spanish.",
            incorrect: "Incorrect. 'Manzana' means 'apple' in Spanish."
          }
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "What is 'plátano' in English?",
          options: ["Apple", "Banana", "Orange", "Pear"],
          answer: "Banana",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Plátano' means 'banana' in Spanish.",
            incorrect: "Incorrect. 'Plátano' means 'banana' in Spanish."
          }
        },
        {
          id: 3,
          type: "listen-repeat",
          question: "Listen and repeat these food items",
          audio: "fruits.mp3",
          answer: "manzana, plátano, naranja, fresa",
          points: 10,
          feedback: {
            correct: "Great pronunciation!",
            incorrect: "Try again, focusing on the pronunciation."
          }
        },
        {
          id: 4,
          type: "word-matching",
          question: "Match the Spanish fruits with their English translations",
          pairs: [
            { word: "manzana", match: "apple" },
            { word: "plátano", match: "banana" },
            { word: "naranja", match: "orange" },
            { word: "fresa", match: "strawberry" }
          ],
          points: 10,
          feedback: {
            correct: "¡Excelente! You matched all fruits correctly.",
            incorrect: "Some matches were incorrect. Please try again."
          }
        },
        {
          id: 5,
          type: "image-identification",
          question: "What is this fruit called in Spanish?",
          image: "apple.jpg",
          options: ["Manzana", "Plátano", "Naranja", "Fresa"],
          answer: "Manzana",
          points: 5,
          feedback: {
            correct: "¡Correcto! This is a 'manzana' (apple).",
            incorrect: "Incorrect. This is a 'manzana' (apple)."
          }
        }
      ]
    },
    {
      id: 2,
      title: "Ordering in Restaurants",
      description: "Learn how to order food and drinks in Spanish restaurants",
      xpReward: 45,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you ask for the menu in Spanish?",
          options: ["La carta, por favor", "La cuenta, por favor", "Una mesa, por favor", "Un momento, por favor"],
          answer: "La carta, por favor",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'La carta, por favor' means 'The menu, please'.",
            incorrect: "Incorrect. 'La carta, por favor' means 'The menu, please'."
          }
        },
        {
          id: 2,
          type: "fill-in-blanks",
          question: "Complete the dialogue: '¿Qué _____ tomar? Quiero un _____ por favor.'",
          answer: ["desea", "café"],
          points: 10,
          feedback: {
            correct: "¡Perfecto! '¿Qué desea tomar? Quiero un café por favor.' means 'What would you like to drink? I would like a coffee please.'",
            incorrect: "The correct answer is '¿Qué desea tomar? Quiero un café por favor.' which means 'What would you like to drink? I would like a coffee please.'"
          }
        },
        {
          id: 3,
          type: "short-answer",
          question: "How would you ask for the bill in Spanish?",
          answer: "La cuenta, por favor",
          points: 15,
          feedback: {
            correct: "¡Correcto! 'La cuenta, por favor' is how you ask for the bill.",
            incorrect: "The correct way to ask for the bill is 'La cuenta, por favor'."
          }
        },
        {
          id: 4,
          type: "sentence-building",
          question: "Build a sentence to order a coffee with milk",
          options: ["Quiero", "un", "café", "con", "leche", "sin", "azúcar"],
          answer: ["Quiero", "un", "café", "con", "leche"],
          points: 10,
          feedback: {
            correct: "¡Excelente! 'Quiero un café con leche' means 'I want a coffee with milk'.",
            incorrect: "The correct sentence is 'Quiero un café con leche' (I want a coffee with milk)."
          }
        },
        {
          id: 5,
          type: "word-matching",
          question: "Match these restaurant phrases with their meanings",
          pairs: [
            { word: "La carta", match: "The menu" },
            { word: "La cuenta", match: "The bill" },
            { word: "Una mesa", match: "A table" },
            { word: "El camarero", match: "The waiter" }
          ],
          points: 10,
          feedback: {
            correct: "¡Perfecto! You matched all restaurant phrases correctly.",
            incorrect: "Some matches were incorrect. Please try again."
          }
        }
      ]
    }
  ]
};
