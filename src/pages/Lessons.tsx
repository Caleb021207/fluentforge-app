
import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  MessageCircle,
  BookOpen,
  Users,
  Globe,
  Rocket,
  Clock,
  Utensils,
  Briefcase,
  GraduationCap,
  Trophy,
  Star
} from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import LevelSelector from "@/components/lessons/LevelSelector";
import LessonCard from "@/components/lessons/LessonCard";
import LessonView from "@/components/lessons/LessonView";

interface Challenge {
  type: string;
  description: string;
  xpReward: number;
  timeLimit?: number;
  unlocked: boolean;
}

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  icon: JSX.Element;
  vocabulary: string[];
  xpPoints: number;
  difficulty: "Easy" | "Medium" | "Hard";
  progress?: number;
  cefrLevel: string;
  challenges: Challenge[];
  requiresVoice?: boolean;
  unlockRequirement?: {
    type: "level" | "xp" | "lessons";
    value: number;
  };
}

interface Exercise {
  id: number;
  type: string;
  question: string;
  options?: string[];
  answer?: string | string[];
  image?: string;
  audio?: string;
  points: number;
  feedback?: {
    correct: string;
    incorrect: string;
  };
  timeLimit?: number; // in seconds
}

interface LessonForUnit {
  id: number;
  title: string;
  description: string;
  exercises: Exercise[];
  xpReward: number;
}

interface Unit {
  id: number;
  title: string;
  description: string;
  vocabulary: string[];
  lessons: LessonForUnit[];
  xpPoints: number;
}

const basicGreetingsUnit: Unit = {
  id: 1,
  title: "Basic Greetings",
  description: "Learn essential Spanish greetings and introductions through interactive exercises.",
  vocabulary: [
    "Hola - Hello",
    "Buenos días - Good morning",
    "Buenas tardes - Good afternoon",
    "Buenas noches - Good night",
    "¿Cómo estás? - How are you?",
    "Bien, gracias - Fine, thank you",
    "Mucho gusto - Nice to meet you",
    "Hasta luego - See you later",
    "Por favor - Please",
    "Gracias - Thank you"
  ],
  lessons: [
    {
      id: 1,
      title: "Greetings Basics",
      description: "Learn the most common Spanish greetings",
      xpReward: 20,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you say 'Hello' in Spanish?",
          options: ["Hola", "Adiós", "Gracias", "Por favor"],
          answer: "Hola",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Hola' means 'Hello'.",
            incorrect: "¡Incorrecto! 'Hola' means 'Hello'."
          }
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "Which phrase means 'Good morning'?",
          options: ["Buenas noches", "Buenos días", "Buenas tardes", "Hasta luego"],
          answer: "Buenos días",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Buenos días' means 'Good morning'.",
            incorrect: "¡Incorrecto! 'Buenos días' means 'Good morning'."
          }
        },
        {
          id: 3,
          type: "fill-in-blanks",
          question: "Complete the greeting: '_____ tardes' (Good afternoon)",
          answer: "Buenas",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'Buenas tardes' means 'Good afternoon'.",
            incorrect: "¡Incorrecto! The correct answer is 'Buenas'."
          }
        },
        {
          id: 4,
          type: "multiple-choice",
          question: "How do you say 'Good night' in Spanish?",
          options: ["Buenos días", "Buenas tardes", "Buenas noches", "Hola"],
          answer: "Buenas noches",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Buenas noches' means 'Good night'.",
            incorrect: "¡Incorrecto! 'Buenas noches' means 'Good night'."
          }
        },
        {
          id: 5,
          type: "sentence-correction",
          question: "Correct this greeting: 'Buenas noches'",
          answer: "Buenas noches",
          points: 15,
          feedback: {
            correct: "¡Correcto! 'Buenas noches' is the correct form.",
            incorrect: "¡Incorrecto! It should be 'Buenas noches' (feminine form)."
          }
        }
      ]
    },
    {
      id: 2,
      title: "Asking How Someone Is",
      description: "Learn to ask how someone is feeling in Spanish",
      xpReward: 25,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you ask 'How are you?' in Spanish?",
          options: ["¿Cómo te llamas?", "¿Cómo estás?", "¿De dónde eres?", "¿Qué hora es?"],
          answer: "¿Cómo estás?",
          points: 5,
          feedback: {
            correct: "¡Correcto! '¿Cómo estás?' means 'How are you?'",
            incorrect: "¡Incorrecto! '¿Cómo estás?' means 'How are you?'"
          }
        },
        {
          id: 2,
          type: "fill-in-blanks",
          question: "Complete the response: 'Estoy _____, gracias.' (I'm fine, thank you)",
          answer: "bien",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'Estoy bien, gracias' means 'I'm fine, thank you'",
            incorrect: "¡Incorrecto! The correct answer is 'bien'"
          }
        },
        {
          id: 3,
          type: "multiple-choice",
          question: "Which of these is a common response to '¿Cómo estás?'",
          options: ["Mucho gusto", "De nada", "Muy bien, gracias", "Hasta mañana"],
          answer: "Muy bien, gracias",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Muy bien, gracias' means 'Very well, thank you'",
            incorrect: "¡Incorrecto! 'Muy bien, gracias' is a common response"
          }
        },
        {
          id: 4,
          type: "multiple-choice",
          question: "What does 'Estoy mal' mean?",
          options: ["I'm good", "I'm great", "I'm bad/not well", "I'm hungry"],
          answer: "I'm bad/not well",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Estoy mal' means 'I'm bad/not well'",
            incorrect: "¡Incorrecto! 'Estoy mal' means 'I'm bad/not well'"
          }
        },
        {
          id: 5,
          type: "sentence-correction",
          question: "Correct this phrase: '¿Cómo está?'",
          answer: ["¿Cómo estás?", "¿Cómo está usted?"],
          points: 15,
          feedback: {
            correct: "¡Correcto! You've correctly identified the appropriate form",
            incorrect: "¡Incorrecto! '¿Cómo está?' needs a subject or to be informal '¿Cómo estás?'"
          }
        }
      ]
    },
    {
      id: 3,
      title: "Meeting People",
      description: "Learn essential phrases for meeting new people",
      xpReward: 30,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you say 'Nice to meet you' in Spanish?",
          options: ["Hasta luego", "Buenas noches", "Mucho gusto", "¿Cómo estás?"],
          answer: "Mucho gusto",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Mucho gusto' means 'Nice to meet you'",
            incorrect: "¡Incorrecto! 'Mucho gusto' means 'Nice to meet you'"
          }
        },
        {
          id: 2,
          type: "fill-in-blanks",
          question: "Complete the introduction: 'Me _____ Juan.' (My name is Juan)",
          answer: "llamo",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'Me llamo Juan' means 'My name is Juan'",
            incorrect: "¡Incorrecto! The correct answer is 'llamo'"
          }
        },
        {
          id: 3,
          type: "multiple-choice",
          question: "How do you ask someone's name in Spanish?",
          options: ["¿Cómo estás?", "¿Cómo te llamas?", "¿De dónde eres?", "¿Cuántos años tienes?"],
          answer: "¿Cómo te llamas?",
          points: 5,
          feedback: {
            correct: "¡Correcto! '¿Cómo te llamas?' means 'What's your name?'",
            incorrect: "¡Incorrecto! '¿Cómo te llamas?' means 'What's your name?'"
          }
        },
        {
          id: 4,
          type: "multiple-choice",
          question: "Which phrase would you use to introduce yourself?",
          options: ["Encantado", "Hasta pronto", "Mucho gusto", "Me llamo María"],
          answer: "Me llamo María",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Me llamo María' means 'My name is María'",
            incorrect: "¡Incorrecto! 'Me llamo María' means 'My name is María'"
          }
        },
        {
          id: 5,
          type: "fill-in-blanks",
          question: "Complete: 'Soy de _____.' (I am from _____)",
          answer: ["España", "México", "Colombia", "Argentina", "Chile", "Perú"],
          points: 15,
          feedback: {
            correct: "¡Correcto! 'Soy de [country]' means 'I am from [country]'",
            incorrect: "¡Incorrecto! You need to enter a Spanish-speaking country"
          }
        }
      ]
    },
    {
      id: 4,
      title: "Saying Goodbye",
      description: "Learn different ways to say goodbye in Spanish",
      xpReward: 25,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you say 'See you later' in Spanish?",
          options: ["Adiós", "Hasta luego", "Hasta mañana", "Buenas noches"],
          answer: "Hasta luego",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Hasta luego' means 'See you later'",
            incorrect: "¡Incorrecto! 'Hasta luego' means 'See you later'"
          }
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "Which phrase means 'Goodbye'?",
          options: ["Hola", "Gracias", "Adiós", "Por favor"],
          answer: "Adiós",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Adiós' means 'Goodbye'",
            incorrect: "¡Incorrecto! 'Adiós' means 'Goodbye'"
          }
        },
        {
          id: 3,
          type: "fill-in-blanks",
          question: "Complete the phrase: 'Hasta _____' (See you tomorrow)",
          answer: "mañana",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'Hasta mañana' means 'See you tomorrow'",
            incorrect: "¡Incorrecto! The correct answer is 'mañana'"
          }
        },
        {
          id: 4,
          type: "multiple-choice",
          question: "What does 'Nos vemos' mean?",
          options: ["Nice to meet you", "How are you?", "See you", "Thank you"],
          answer: "See you",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Nos vemos' means 'See you'",
            incorrect: "¡Incorrecto! 'Nos vemos' means 'See you'"
          }
        },
        {
          id: 5,
          type: "sentence-correction",
          question: "Correct this goodbye: 'Hasta manaña'",
          answer: "Hasta mañana",
          points: 15,
          feedback: {
            correct: "¡Correcto! 'Hasta mañana' is the correct spelling",
            incorrect: "¡Incorrecto! The correct spelling is 'Hasta mañana'"
          }
        }
      ]
    },
    {
      id: 5,
      title: "Courtesy Phrases",
      description: "Learn essential polite expressions in Spanish",
      xpReward: 30,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you say 'Please' in Spanish?",
          options: ["Gracias", "De nada", "Por favor", "Perdón"],
          answer: "Por favor",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Por favor' means 'Please'",
            incorrect: "¡Incorrecto! 'Por favor' means 'Please'"
          }
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "Which phrase means 'Thank you'?",
          options: ["De nada", "Gracias", "Perdón", "Por favor"],
          answer: "Gracias",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Gracias' means 'Thank you'",
            incorrect: "¡Incorrecto! 'Gracias' means 'Thank you'"
          }
        },
        {
          id: 3,
          type: "multiple-choice",
          question: "How do you say 'You're welcome' in Spanish?",
          options: ["Por favor", "Gracias", "De nada", "Lo siento"],
          answer: "De nada",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'De nada' means 'You're welcome'",
            incorrect: "¡Incorrecto! 'De nada' means 'You're welcome'"
          }
        },
        {
          id: 4,
          type: "fill-in-blanks",
          question: "Complete: '_____, no hablo español.' (Sorry, I don't speak Spanish)",
          answer: ["Perdón", "Lo siento", "Disculpe"],
          points: 10,
          feedback: {
            correct: "¡Correcto! You've used the correct expression for 'Sorry'",
            incorrect: "¡Incorrecto! You can use 'Perdón', 'Lo siento', or 'Disculpe'"
          }
        },
        {
          id: 5,
          type: "multiple-choice",
          question: "What does 'Con permiso' mean?",
          options: ["Excuse me", "I'm sorry", "Thank you", "You're welcome"],
          answer: "Excuse me",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Con permiso' means 'Excuse me' (when passing by)",
            incorrect: "¡Incorrecto! 'Con permiso' means 'Excuse me' (when passing by)"
          }
        }
      ]
    }
  ],
  xpPoints: 130
};

const numbersAndColorsUnit: Unit = {
  id: 2,
  title: "Numbers & Colors",
  description: "Master Spanish numbers and colors with engaging exercises and quizzes.",
  vocabulary: [
    "Uno - One",
    "Dos - Two",
    "Tres - Three",
    "Cuatro - Four",
    "Cinco - Five",
    "Diez - Ten",
    "Veinte - Twenty",
    "Rojo - Red",
    "Azul - Blue",
    "Verde - Green",
    "Amarillo - Yellow",
    "Negro - Black",
    "Blanco - White"
  ],
  lessons: [
    {
      id: 1,
      title: "Numbers 1-10",
      description: "Learn to count from one to ten in Spanish",
      xpReward: 20,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "What is the Spanish word for 'one'?",
          options: ["Dos", "Uno", "Tres", "Cuatro"],
          answer: "Uno",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Uno' means 'one'.",
            incorrect: "¡Incorrecto! 'Uno' means 'one'."
          }
        },
        {
          id: 2,
          type: "fill-in-blanks",
          question: "Complete the sequence: uno, dos, _____, cuatro",
          answer: "tres",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'Tres' means 'three'.",
            incorrect: "¡Incorrecto! The correct answer is 'tres'."
          }
        },
        {
          id: 3,
          type: "multiple-choice",
          question: "Which number is 'cinco' in English?",
          options: ["Three", "Four", "Five", "Six"],
          answer: "Five",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Cinco' means 'five'.",
            incorrect: "¡Incorrecto! 'Cinco' means 'five'."
          }
        },
        {
          id: 4,
          type: "word-ordering",
          question: "Put these numbers in order: siete, dos, cinco, uno",
          answer: ["uno", "dos", "cinco", "siete"],
          points: 15,
          feedback: {
            correct: "¡Correcto! The correct order is 'uno, dos, cinco, siete'.",
            incorrect: "¡Incorrecto! The correct order is 'uno, dos, cinco, siete'."
          }
        },
        {
          id: 5,
          type: "sentence-correction",
          question: "Correct this number if needed: 'diez'",
          answer: "diez",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Diez' is the correct word for 'ten'.",
            incorrect: "¡Incorrecto! 'Diez' is already correct, meaning 'ten'."
          }
        }
      ]
    },
    {
      id: 2,
      title: "Numbers 11-20",
      description: "Learn to count from eleven to twenty in Spanish",
      xpReward: 25,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you say '11' in Spanish?",
          options: ["Diez", "Once", "Doce", "Trece"],
          answer: "Once",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Once' means 'eleven'.",
            incorrect: "¡Incorrecto! 'Once' means 'eleven'."
          }
        },
        {
          id: 2,
          type: "fill-in-blanks",
          question: "Complete the sequence: once, doce, _____, catorce",
          answer: "trece",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'Trece' means 'thirteen'.",
            incorrect: "¡Incorrecto! The correct answer is 'trece'."
          }
        },
        {
          id: 3,
          type: "multiple-choice",
          question: "What is the Spanish word for '15'?",
          options: ["Catorce", "Quince", "Dieciséis", "Diecisiete"],
          answer: "Quince",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Quince' means 'fifteen'.",
            incorrect: "¡Incorrecto! 'Quince' means 'fifteen'."
          }
        },
        {
          id: 4,
          type: "word-ordering",
          question: "Put these numbers in order: veinte, quince, dieciocho, doce",
          answer: ["doce", "quince", "dieciocho", "veinte"],
          points: 15,
          feedback: {
            correct: "¡Correcto! The correct order is 'doce, quince, dieciocho, veinte'.",
            incorrect: "¡Incorrecto! The correct order is 'doce, quince, dieciocho, veinte'."
          }
        },
        {
          id: 5,
          type: "sentence-correction",
          question: "Correct this number if needed: 'dieciseis'",
          answer: "dieciséis",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'Dieciséis' is the correct spelling with the accent.",
            incorrect: "¡Incorrecto! The correct spelling is 'dieciséis' with an accent."
          }
        }
      ]
    },
    {
      id: 3,
      title: "Basic Colors",
      description: "Learn the names of common colors in Spanish",
      xpReward: 20,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "What is the Spanish word for 'red'?",
          options: ["Azul", "Verde", "Rojo", "Amarillo"],
          answer: "Rojo",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Rojo' means 'red'.",
            incorrect: "¡Incorrecto! 'Rojo' means 'red'."
          }
        },
        {
          id: 2,
          type: "fill-in-blanks",
          question: "The sky is _____. (blue)",
          answer: "azul",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'El cielo es azul.' - 'The sky is blue.'",
            incorrect: "¡Incorrecto! The correct answer is 'azul'."
          }
        },
        {
          id: 3,
          type: "multiple-choice",
          question: "Which color is 'verde' in English?",
          options: ["Red", "Blue", "Yellow", "Green"],
          answer: "Green",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Verde' means 'green'.",
            incorrect: "¡Incorrecto! 'Verde' means 'green'."
          }
        },
        {
          id: 4,
          type: "fill-in-blanks",
          question: "Complete: La banana es _____. (The banana is yellow)",
          answer: "amarilla",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'La banana es amarilla.' - 'The banana is yellow.'",
            incorrect: "¡Incorrecto! The correct answer is 'amarilla'."
          }
        },
        {
          id: 5,
          type: "multiple-choice",
          question: "What is 'negro' in English?",
          options: ["White", "Black", "Blue", "Gray"],
          answer: "Black",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Negro' means 'black'.",
            incorrect: "¡Incorrecto! 'Negro' means 'black'."
          }
        }
      ]
    },
    {
      id: 4,
      title: "More Colors",
      description: "Learn additional colors and practice color combinations",
      xpReward: 25,
      exercises: [
        {
          id: 1,
          type: "multiple-choice",
          question: "How do you say 'white' in Spanish?",
          options: ["Negro", "Blanco", "Gris", "Marrón"],
          answer: "Blanco",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Blanco' means 'white'.",
            incorrect: "¡Incorrecto! 'Blanco' means 'white'."
          }
        },
        {
          id: 2,
          type: "fill-in-blanks",
          question: "The orange is _____. (orange color)",
          answer: "naranja",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'La naranja es naranja.' - 'The orange is orange.'",
            incorrect: "¡Incorrecto! The correct answer is 'naranja'."
          }
        },
        {
          id: 3,
          type: "multiple-choice",
          question: "Which color is 'morado' in English?",
          options: ["Brown", "Gray", "Purple", "Pink"],
          answer: "Purple",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Morado' means 'purple'.",
            incorrect: "¡Incorrecto! 'Morado' means 'purple'."
          }
        },
        {
          id: 4,
          type: "fill-in-blanks",
          question: "Complete: El cielo y el mar son _____. (The sky and the sea are blue)",
          answer: "azules",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'El cielo y el mar son azules.' - 'The sky and sea are blue.'",
            incorrect: "¡Incorrecto! The correct answer is 'azules' (plural form)."
          }
        },
        {
          id: 5,
          type: "sentence-correction",
          question: "Correct this sentence: 'La manzana es verde.'",
          answer: "La manzana es verde.",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'La manzana es verde.' is correct - 'The apple is green.'",
            incorrect: "¡Incorrecto! 'La manzana es verde.' is already correct."
          }
        }
      ]
    },
    {
      id: 5,
      title: "Combining Numbers & Colors",
      description: "Practice using numbers and colors together in sentences",
      xpReward: 30,
      exercises: [
        {
          id: 1,
          type: "fill-in-blanks",
          question: "Complete: Tengo _____ lápices rojos. (I have two red pencils)",
          answer: "dos",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'Tengo dos lápices rojos.' - 'I have two red pencils.'",
            incorrect: "¡Incorrecto! The correct answer is 'dos'."
          }
        },
        {
          id: 2,
          type: "multiple-choice",
          question: "How would you say 'five blue shirts' in Spanish?",
          options: ["cinco camisas azules", "azul cinco camisas", "camisas cinco azules", "azules camisas cinco"],
          answer: "cinco camisas azules",
          points: 5,
          feedback: {
            correct: "¡Correcto! 'Cinco camisas azules' is correct.",
            incorrect: "¡Incorrecto! The correct phrase is 'cinco camisas azules'."
          }
        },
        {
          id: 3,
          type: "fill-in-blanks",
          question: "Complete: Hay _____ flores amarillas en el jardín. (There are ten yellow flowers in the garden)",
          answer: "diez",
          points: 10,
          feedback: {
            correct: "¡Correcto! 'Hay diez flores amarillas en el jardín.'",
            incorrect: "¡Incorrecto! The correct answer is 'diez'."
          }
        },
        {
          id: 4,
          type: "sentence-correction",
          question: "Correct this sentence: 'Tengo una coche rojo.'",
          answer: "Tengo un coche rojo.",
          points: 15,
          feedback: {
            correct: "¡Correcto! 'Tengo un coche rojo.' is correct (coche is masculine).",
            incorrect: "¡Incorrecto! It should be 'Tengo un coche rojo.' (coche is masculine)."
          }
        },
        {
          id: 5,
          type: "multiple-choice",
          question: "What does 'tres casas blancas' mean?",
          options: ["three white houses", "thirty white houses", "three blue houses", "white three houses"],
          answer: "three white houses",
          points: 5,
          feedback: {
            correct: