
import { Layers, Zap } from 'lucide-react';
import { Unit } from '../lessonUnits';

export const numbersAndColorsUnit: Unit = {
  id: 2,
  title: "Numbers and Colors",
  description: "Learn to count from 1-100 and identify common colors in Spanish.",
  cefrLevel: "A1",
  xpPoints: 120,
  vocabulary: [
    "uno - one",
    "dos - two",
    "tres - three",
    "cuatro - four",
    "cinco - five",
    "rojo - red",
    "azul - blue",
    "verde - green",
    "amarillo - yellow",
    "negro - black",
    "blanco - white",
    "gris - gray"
  ],
  lessons: [
    {
      id: 1,
      title: "Numbers 1-20",
      description: "Learn to count from 1 to 20 in Spanish",
      xpReward: 40,
      exercises: [
        {
          id: 1,
          type: "vocabulary",
          question: "Learn these numbers in Spanish",
          points: 10,
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "What is the number 'siete' in English?",
          options: ["Five", "Six", "Seven", "Eight"],
          answer: "Seven",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Siete' is the Spanish word for 'seven'.",
            incorrect: "Incorrect. 'Siete' means 'seven' in Spanish."
          }
        },
        {
          id: 3,
          type: "word-matching",
          question: "Match the Spanish numbers with their English translations",
          options: ["uno", "dos", "tres", "cuatro"],
          answer: ["one", "two", "three", "four"],
          points: 10,
          feedback: {
            correct: "Great job matching the numbers!",
            incorrect: "Some matches were incorrect. Please try again."
          }
        }
      ]
    },
    {
      id: 2,
      title: "Colors and Descriptions",
      description: "Learn colors and how to describe objects",
      xpReward: 35,
      exercises: [
        {
          id: 1,
          type: "vocabulary",
          question: "Learn these colors in Spanish",
          points: 10,
        },
        {
          id: 2,
          type: "image-identification",
          question: "What color is shown in the image?",
          image: "red-color.jpg",
          options: ["Rojo", "Azul", "Verde", "Amarillo"],
          answer: "Rojo",
          points: 5,
          feedback: {
            correct: "¡Correcto! This color is 'rojo' (red).",
            incorrect: "Incorrect. The color shown is 'rojo' (red)."
          }
        },
        {
          id: 3,
          type: "sentence-building",
          question: "Build a sentence describing a blue car",
          options: ["El", "coche", "es", "azul", "grande", "rojo"],
          answer: ["El", "coche", "es", "azul"],
          points: 10,
          feedback: {
            correct: "¡Excelente! 'El coche es azul' means 'The car is blue'.",
            incorrect: "The correct sentence is 'El coche es azul' (The car is blue)."
          }
        }
      ]
    }
  ]
};
