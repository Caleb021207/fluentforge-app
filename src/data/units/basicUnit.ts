
import { Book, BookOpen, MessageSquare, Mic } from 'lucide-react';
import { Unit } from '../lessonUnits';

export const basicUnit: Unit = {
  id: 1,
  title: "Basic Spanish Conversations",
  description: "Learn fundamental Spanish greetings and conversation starters.",
  cefrLevel: "A1",
  xpPoints: 100,
  vocabulary: [
    "hola - hello",
    "adiós - goodbye",
    "buenos días - good morning",
    "buenas tardes - good afternoon",
    "buenas noches - good night",
    "gracias - thank you",
    "por favor - please",
    "de nada - you're welcome",
    "sí - yes",
    "no - no",
    "disculpe - excuse me",
    "lo siento - I'm sorry",
    "me llamo - my name is",
    "¿cómo te llamas? - what's your name?",
    "mucho gusto - nice to meet you"
  ],
  lessons: [
    {
      id: 1,
      title: "Greetings and Introductions",
      description: "Learn basic Spanish greetings and how to introduce yourself",
      xpReward: 25,
      exercises: [
        {
          id: 1,
          type: "vocabulary",
          question: "Learn these basic greeting words",
          points: 10,
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "How do you say 'good morning' in Spanish?",
          options: ["Buenos días", "Buenas tardes", "Buenas noches", "Hola"],
          answer: "Buenos días",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Buenos días' is 'good morning' in Spanish.",
            incorrect: "Incorrect. 'Buenos días' means 'good morning' in Spanish."
          }
        },
        {
          id: 3,
          type: "listen-repeat",
          question: "Listen and repeat: '¡Hola! Me llamo Maria. ¿Cómo te llamas?'",
          audio: "greeting.mp3",
          answer: "¡Hola! Me llamo Maria. ¿Cómo te llamas?",
          points: 10,
          feedback: {
            correct: "Excellent pronunciation!",
            incorrect: "Try again with clearer pronunciation."
          }
        },
        {
          id: 4,
          type: "fill-in-blanks",
          question: "Complete the sentence: '_____ días, ¿cómo _____?'",
          answer: ["Buenos", "estás"],
          points: 5,
          feedback: {
            correct: "¡Perfecto! 'Buenos días, ¿cómo estás?' means 'Good morning, how are you?'",
            incorrect: "The correct answer is 'Buenos días, ¿cómo estás?' which means 'Good morning, how are you?'"
          }
        },
        {
          id: 5,
          type: "sentence-building",
          question: "Build a sentence to introduce yourself using 'Me llamo'",
          options: ["Me", "llamo", "Juan", "y", "soy", "estudiante"],
          answer: "Me llamo Juan y soy estudiante",
          points: 10,
          feedback: {
            correct: "¡Muy bien! You've successfully introduced yourself.",
            incorrect: "Try again. A proper introduction starts with 'Me llamo' (My name is)."
          }
        }
      ]
    },
    {
      id: 2,
      title: "Common Phrases",
      description: "Essential phrases for basic communication",
      xpReward: 30,
      exercises: [
        {
          id: 1,
          type: "vocabulary",
          question: "Learn these common phrases",
          points: 10,
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "How do you say 'please' in Spanish?",
          options: ["Gracias", "Por favor", "De nada", "Lo siento"],
          answer: "Por favor",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Por favor' means 'please'.",
            incorrect: "Incorrect. 'Por favor' means 'please'."
          }
        },
        {
          id: 3,
          type: "audio-transcription",
          question: "Listen and type what you hear",
          audio: "common_phrase.mp3",
          answer: "Muchas gracias por su ayuda",
          points: 15,
          feedback: {
            correct: "¡Perfecto! You heard it correctly.",
            incorrect: "The correct phrase was 'Muchas gracias por su ayuda' (Thank you very much for your help)."
          }
        }
      ]
    }
  ]
};
