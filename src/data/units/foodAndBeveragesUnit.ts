
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
          type: "vocabulary",
          question: "Learn these food items in Spanish",
          points: 10,
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "What is 'manzana' in English?",
          options: ["Apple", "Banana", "Orange", "Pear"],
          answer: "Apple",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Manzana' means 'apple' in Spanish.",
            incorrect: "Incorrect. 'Manzana' means 'apple' in Spanish."
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
          type: "vocabulary",
          question: "Learn these restaurant phrases",
          points: 10,
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
        }
      ]
    }
  ]
};
