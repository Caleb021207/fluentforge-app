
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
          type: "multiple-choice",
          question: "How do you say 'one' in Spanish?",
          options: ["Uno", "Dos", "Tres", "Cuatro"],
          answer: "Uno",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Uno' means 'one' in Spanish.",
            incorrect: "Incorrect. 'Uno' means 'one' in Spanish."
          }
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
          pairs: [
            { word: "uno", match: "one" },
            { word: "dos", match: "two" },
            { word: "tres", match: "three" },
            { word: "cuatro", match: "four" }
          ],
          points: 10,
          feedback: {
            correct: "Great job matching the numbers!",
            incorrect: "Some matches were incorrect. Please try again."
          }
        },
        {
          id: 4,
          type: "fill-in-blanks",
          question: "Fill in the blanks: Los números ___ y ___ son 'cinco' y 'seis' en español.",
          answer: ["five", "six"],
          points: 10,
          feedback: {
            correct: "¡Perfecto! 'Cinco' means 'five' and 'seis' means 'six'.",
            incorrect: "The correct answers are 'five' and 'six'."
          }
        },
        {
          id: 5,
          type: "sentence-building",
          question: "Build a sentence counting from 1 to 3 in Spanish",
          options: ["Uno,", "dos,", "tres", "cuatro", "cinco"],
          answer: ["Uno,", "dos,", "tres"],
          points: 10,
          feedback: {
            correct: "¡Excelente! 'Uno, dos, tres' is correct.",
            incorrect: "The correct sequence is 'Uno, dos, tres'."
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
          type: "multiple-choice",
          question: "How do you say 'red' in Spanish?",
          options: ["Rojo", "Azul", "Verde", "Amarillo"],
          answer: "Rojo",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Rojo' means 'red' in Spanish.",
            incorrect: "Incorrect. 'Rojo' means 'red' in Spanish."
          }
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
        },
        {
          id: 4,
          type: "word-matching",
          question: "Match these colors with their English translations",
          pairs: [
            { word: "verde", match: "green" },
            { word: "amarillo", match: "yellow" },
            { word: "negro", match: "black" },
            { word: "blanco", match: "white" }
          ],
          points: 10,
          feedback: {
            correct: "¡Perfecto! You matched all the colors correctly.",
            incorrect: "Some matches were incorrect. Please try again."
          }
        },
        {
          id: 5,
          type: "fill-in-blanks",
          question: "Complete the sentence: El cielo es ___ y el sol es ___.",
          answer: ["azul", "amarillo"],
          points: 10,
          feedback: {
            correct: "¡Correcto! 'El cielo es azul y el sol es amarillo' means 'The sky is blue and the sun is yellow'.",
            incorrect: "The correct answers are 'azul' (blue) and 'amarillo' (yellow)."
          }
        }
      ]
    }
  ]
};
