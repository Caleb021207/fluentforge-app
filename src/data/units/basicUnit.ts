
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
      title: "First Greetings",
      description: "Learn the most basic Spanish greetings",
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
          question: "How do you say 'hello' in Spanish?",
          options: ["Hola", "Adiós", "Gracias", "Por favor"],
          answer: "Hola",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Hola' means 'hello' in Spanish.",
            incorrect: "Incorrect. 'Hola' means 'hello' in Spanish."
          }
        },
        {
          id: 3,
          type: "listen-repeat",
          question: "Listen and repeat: '¡Hola! ¿Cómo estás?'",
          audio: "greeting.mp3",
          answer: "¡Hola! ¿Cómo estás?",
          points: 10,
          feedback: {
            correct: "Excellent pronunciation!",
            incorrect: "Try again with clearer pronunciation."
          }
        },
        {
          id: 4,
          type: "fill-in-blanks",
          question: "Complete the greeting: '_____, me llamo Juan.'",
          answer: ["Hola"],
          points: 5,
          feedback: {
            correct: "¡Perfecto! 'Hola, me llamo Juan.' means 'Hello, my name is Juan.'",
            incorrect: "The correct answer is 'Hola, me llamo Juan.' which means 'Hello, my name is Juan.'"
          }
        },
        {
          id: 5,
          type: "image-identification",
          question: "Select the image that shows people greeting each other",
          options: ["Greeting", "Eating", "Sleeping", "Running"],
          answer: "Greeting",
          points: 5,
          feedback: {
            correct: "¡Correcto! This image shows people greeting each other.",
            incorrect: "Incorrect. The image with people greeting each other is the correct one."
          }
        }
      ]
    },
    {
      id: 2,
      title: "Time-Based Greetings",
      description: "Learn how to greet people at different times of day",
      xpReward: 25,
      exercises: [
        {
          id: 1,
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
          id: 2,
          type: "word-ordering",
          question: "Put the words in the correct order to form a greeting",
          options: ["días", "Buenos", "María", "hola"],
          answer: "Buenos días María",
          points: 10,
          feedback: {
            correct: "¡Perfecto! 'Buenos días María' is a correct morning greeting.",
            incorrect: "Incorrect order. 'Buenos días María' is the correct morning greeting."
          }
        },
        {
          id: 3,
          type: "timed-quiz",
          question: "What time of day would you use 'Buenas noches'?",
          options: ["Morning", "Afternoon", "Evening/Night", "Anytime"],
          answer: "Evening/Night",
          timeLimit: 10,
          points: 10,
          feedback: {
            correct: "¡Correcto! 'Buenas noches' is used in the evening or at night.",
            incorrect: "Incorrect. 'Buenas noches' is used in the evening or at night."
          }
        },
        {
          id: 4,
          type: "sentence-correction",
          question: "Correct this sentence: 'Buenos tardes, ¿cómo estás?'",
          answer: "Buenas tardes, ¿cómo estás?",
          points: 10,
          feedback: {
            correct: "¡Muy bien! The correct form is 'Buenas tardes' (feminine).",
            incorrect: "Incorrect. The correct form is 'Buenas tardes' (feminine)."
          }
        },
        {
          id: 5,
          type: "audio-transcription",
          question: "Listen and type what you hear",
          audio: "buenas_tardes.mp3",
          answer: "Buenas tardes, ¿cómo está usted?",
          points: 15,
          feedback: {
            correct: "¡Excelente! You heard it correctly.",
            incorrect: "The correct phrase was 'Buenas tardes, ¿cómo está usted?' (Good afternoon, how are you?)"
          }
        }
      ]
    },
    {
      id: 3,
      title: "Introducing Yourself",
      description: "Learn how to introduce yourself in Spanish",
      xpReward: 30,
      exercises: [
        {
          id: 1,
          type: "sentence-building",
          question: "Build a sentence to introduce yourself using 'Me llamo'",
          options: ["Me", "llamo", "Juan", "y", "soy", "estudiante"],
          answer: "Me llamo Juan y soy estudiante",
          points: 10,
          feedback: {
            correct: "¡Muy bien! You've successfully introduced yourself.",
            incorrect: "Try again. A proper introduction starts with 'Me llamo' (My name is)."
          }
        },
        {
          id: 2,
          type: "short-answer",
          question: "How would you ask someone their name in Spanish?",
          answer: ["¿Cómo te llamas?", "¿Cuál es tu nombre?"],
          points: 10,
          feedback: {
            correct: "¡Correcto! That's how you ask someone's name.",
            incorrect: "Incorrect. You can ask '¿Cómo te llamas?' or '¿Cuál es tu nombre?'."
          }
        },
        {
          id: 3,
          type: "listen-repeat",
          question: "Listen and repeat: 'Me llamo Ana. Mucho gusto.'",
          audio: "introduction.mp3",
          answer: "Me llamo Ana. Mucho gusto.",
          points: 10,
          feedback: {
            correct: "¡Excelente pronunciación!",
            incorrect: "Try again with clearer pronunciation."
          }
        },
        {
          id: 4,
          type: "fill-in-blanks",
          question: "Complete the introduction: '_____ _____ Carlos. _____ gusto.'",
          answer: ["Me", "llamo", "Mucho"],
          points: 10,
          feedback: {
            correct: "¡Perfecto! 'Me llamo Carlos. Mucho gusto.' means 'My name is Carlos. Nice to meet you.'",
            incorrect: "The correct phrase is 'Me llamo Carlos. Mucho gusto.' (My name is Carlos. Nice to meet you.)"
          }
        },
        {
          id: 5,
          type: "speech-to-text",
          question: "Say your introduction in Spanish: 'Me llamo [your name]'",
          answer: "Me llamo",
          points: 15,
          feedback: {
            correct: "¡Bien hecho! Your pronunciation was good.",
            incorrect: "Try again. Focus on clear pronunciation of 'Me llamo'."
          }
        }
      ]
    },
    {
      id: 4,
      title: "Basic Conversation Flow",
      description: "Learn how to have a simple back-and-forth conversation",
      xpReward: 35,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "After someone asks '¿Cómo estás?', how might you respond?",
          options: ["Muy bien, gracias", "Me llamo Juan", "Mucho gusto", "Adiós"],
          answer: "Muy bien, gracias",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Muy bien, gracias' means 'Very well, thank you.'",
            incorrect: "Incorrect. 'Muy bien, gracias' (Very well, thank you) is an appropriate response."
          }
        },
        {
          id: 2,
          type: "word-matching",
          question: "Match these conversation phrases with their meanings",
          pairs: [
            { word: "¿Cómo estás?", match: "How are you?" },
            { word: "Encantado", match: "Delighted (to meet you)" },
            { word: "Igualmente", match: "Likewise" },
            { word: "Hasta luego", match: "See you later" }
          ],
          points: 15,
          feedback: {
            correct: "¡Excelente! You matched all phrases correctly.",
            incorrect: "Some matches are incorrect. Try again."
          }
        },
        {
          id: 3,
          type: "sentence-correction",
          question: "Correct this conversation: '¿Cómo te llamo? Muy bien.'",
          answer: "¿Cómo te llamas? Muy bien.",
          points: 10,
          feedback: {
            correct: "¡Correcto! The correct form is '¿Cómo te llamas?' (What is your name?)",
            incorrect: "The correct form is '¿Cómo te llamas?' (the verb 'llamar' conjugated for 'tú')."
          }
        },
        {
          id: 4,
          type: "audio-transcription",
          question: "Listen to this conversation and transcribe it",
          audio: "short_conversation.mp3",
          answer: "Hola, ¿cómo estás? Estoy bien, gracias. ¿Y tú?",
          points: 15,
          feedback: {
            correct: "¡Perfecto! You transcribed the conversation correctly.",
            incorrect: "The correct transcription was 'Hola, ¿cómo estás? Estoy bien, gracias. ¿Y tú?'"
          }
        },
        {
          id: 5,
          type: "short-answer",
          question: "What would you say to end a conversation politely in Spanish?",
          answer: ["Adiós", "Hasta luego", "Hasta pronto", "Hasta mañana", "Chao"],
          points: 10,
          feedback: {
            correct: "¡Muy bien! That's a proper way to end a conversation.",
            incorrect: "Some common ways to end a conversation include 'Adiós', 'Hasta luego', or 'Hasta pronto'."
          }
        }
      ]
    },
    {
      id: 5,
      title: "Polite Expressions",
      description: "Learn essential polite phrases for respectful conversation",
      xpReward: 35,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you say 'thank you' in Spanish?",
          options: ["Gracias", "Por favor", "De nada", "Lo siento"],
          answer: "Gracias",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Gracias' means 'thank you'.",
            incorrect: "Incorrect. 'Gracias' means 'thank you'."
          }
        },
        {
          id: 2,
          type: "fill-in-blanks",
          question: "Complete the polite response: '_____ _____' (you're welcome)",
          answer: ["De", "nada"],
          points: 10,
          feedback: {
            correct: "¡Perfecto! 'De nada' means 'you're welcome'.",
            incorrect: "The correct phrase is 'De nada' which means 'you're welcome'."
          }
        },
        {
          id: 3,
          type: "word-ordering",
          question: "Put these words in order to form a polite request",
          options: ["por", "favor", "Disculpe", "ayudarme", "puede"],
          answer: "Disculpe por favor puede ayudarme",
          points: 15,
          feedback: {
            correct: "¡Muy bien! This is a polite way to ask for help.",
            incorrect: "The correct order is 'Disculpe por favor puede ayudarme' (Excuse me please, can you help me)."
          }
        },
        {
          id: 4,
          type: "sentence-building",
          question: "Build a sentence to apologize",
          options: ["Lo", "siento", "mucho", "mi", "error", "fue"],
          answer: "Lo siento mucho fue mi error",
          points: 10,
          feedback: {
            correct: "¡Excelente! This is a good way to apologize.",
            incorrect: "A proper apology could be 'Lo siento mucho fue mi error' (I'm very sorry, it was my mistake)."
          }
        },
        {
          id: 5,
          type: "listen-repeat",
          question: "Listen and repeat this polite expression: 'Muchas gracias por su ayuda.'",
          audio: "gracias_ayuda.mp3",
          answer: "Muchas gracias por su ayuda.",
          points: 10,
          feedback: {
            correct: "¡Pronunciación perfecta!",
            incorrect: "Try again focusing on the pronunciation of 'gracias' and 'ayuda'."
          }
        }
      ]
    },
    {
      id: 6,
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
