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

const lessonsByLevel: Record<string, Lesson[]> = {
  beginner: [
    {
      id: 1,
      title: "Basic Greetings",
      description: "Learn essential Spanish greetings and introductions through interactive exercises.",
      duration: "15 min",
      icon: <MessageCircle className="h-6 w-6" />,
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
      xpPoints: 50,
      difficulty: "Easy",
      progress: 0,
      cefrLevel: "A1",
      challenges: [
        {
          type: "vocabulary",
          description: "Match 10 greeting words with their meanings",
          xpReward: 50,
          unlocked: true,
        }
      ],
    },
    {
      id: 2,
      title: "Numbers 1-20",
      description: "Master counting in Spanish through interactive games and exercises.",
      duration: "20 min",
      icon: <BookOpen className="h-6 w-6" />,
      vocabulary: [
        "Uno - One",
        "Dos - Two",
        "Tres - Three",
        "Cuatro - Four",
        "Cinco - Five",
        "Seis - Six",
        "Siete - Seven",
        "Ocho - Eight",
        "Nueve - Nine",
        "Diez - Ten",
        "Once - Eleven",
        "Doce - Twelve",
        "Trece - Thirteen",
        "Catorce - Fourteen",
        "Quince - Fifteen"
      ],
      xpPoints: 75,
      difficulty: "Easy",
      progress: 0,
      cefrLevel: "A1",
      challenges: [
        {
          type: "vocabulary",
          description: "Match numbers with their Spanish words",
          xpReward: 75,
          unlocked: true,
        }
      ],
    },
    {
      id: 3,
      title: "Colors",
      description: "Learn common colors in Spanish",
      duration: "15 min",
      icon: <Globe className="h-6 w-6" />,
      vocabulary: [
        "Rojo - Red",
        "Azul - Blue",
        "Verde - Green",
        "Amarillo - Yellow",
        "Negro - Black",
        "Blanco - White",
        "Naranja - Orange",
        "Morado - Purple",
        "Gris - Gray",
        "Marrón - Brown"
      ],
      xpPoints: 60,
      difficulty: "Easy",
      progress: 0,
      cefrLevel: "A1",
      challenges: [
        {
          type: "vocabulary",
          description: "Match colors with their Spanish names",
          xpReward: 60,
          unlocked: true,
        }
      ],
    },
    {
      id: 4,
      title: "Family Members",
      description: "Learn words for family relations",
      duration: "25 min",
      icon: <Users className="h-6 w-6" />,
      vocabulary: [
        "Madre - Mother",
        "Padre - Father",
        "Hermana - Sister",
        "Hermano - Brother",
        "Abuelo - Grandfather",
        "Abuela - Grandmother",
        "Tío - Uncle",
        "Tía - Aunt",
        "Primo - Male Cousin",
        "Prima - Female Cousin",
        "Hijo - Son",
        "Hija - Daughter"
      ],
      xpPoints: 80,
      difficulty: "Easy",
      progress: 0,
      cefrLevel: "A1",
      challenges: [
        {
          type: "vocabulary",
          description: "Match family members with their Spanish names",
          xpReward: 80,
          unlocked: true,
        }
      ],
    },
    {
      id: 5,
      title: "Common Objects",
      description: "Learn everyday objects and items",
      duration: "20 min",
      icon: <BookOpen className="h-6 w-6" />,
      vocabulary: [
        "Mesa - Table",
        "Silla - Chair",
        "Libro - Book",
        "Lápiz - Pencil",
        "Bolígrafo - Pen",
        "Teléfono - Phone",
        "Computadora - Computer",
        "Ventana - Window",
        "Puerta - Door",
        "Reloj - Clock"
      ],
      xpPoints: 70,
      difficulty: "Easy",
      progress: 0,
      cefrLevel: "A2",
      challenges: [
        {
          type: "vocabulary",
          description: "Match objects with their Spanish names",
          xpReward: 70,
          unlocked: true,
        }
      ],
    },
    {
      id: 6,
      title: "Food & Drinks",
      description: "Learn common food and drink vocabulary",
      duration: "25 min",
      icon: <Utensils className="h-6 w-6" />,
      vocabulary: [
        "Agua - Water",
        "Pan - Bread",
        "Leche - Milk",
        "Café - Coffee",
        "Manzana - Apple",
        "Plátano - Banana",
        "Pollo - Chicken",
        "Arroz - Rice",
        "Huevo - Egg",
        "Pescado - Fish",
        "Carne - Meat",
        "Ensalada - Salad"
      ],
      xpPoints: 85,
      difficulty: "Easy",
      progress: 0,
      cefrLevel: "A2",
      challenges: [
        {
          type: "vocabulary",
          description: "Match food and drink items with their Spanish names",
          xpReward: 85,
          unlocked: true,
        }
      ],
    }
  ],
  intermediate: [
    {
      id: 1,
      title: "Present Tense Verbs",
      description: "Practice conjugating regular verbs through interactive exercises.",
      duration: "30 min",
      icon: <Rocket className="h-6 w-6" />,
      vocabulary: ["To speak - Hablar", "To eat - Comer", "To live - Vivir"],
      xpPoints: 150,
      difficulty: "Medium",
      progress: 40,
      cefrLevel: "B1",
      challenges: [
        {
          type: "conjugation",
          description: "Conjugate verbs in present tense",
          xpReward: 50,
          unlocked: true,
        },
        {
          type: "conversation",
          description: "AI roleplay using present tense verbs",
          xpReward: 100,
          unlocked: false,
        },
      ],
      requiresVoice: true,
    },
    {
      id: 2,
      title: "Daily Routines",
      description: "Describe your daily activities in Spanish",
      duration: "25 min",
      icon: <Clock className="h-6 w-6" />,
      vocabulary: ["I wake up - Me despierto", "I shower - Me ducho", "I have breakfast - Desayuno"],
      xpPoints: 120,
      difficulty: "Medium",
      progress: 0,
      cefrLevel: "B1",
      challenges: [
        {
          type: "writing",
          description: "Write a short paragraph about your daily routine",
          xpReward: 30,
          unlocked: true,
        },
      ],
    },
    {
      id: 3,
      title: "Food & Dining",
      description: "Restaurant vocabulary and ordering food",
      duration: "30 min",
      icon: <Utensils className="h-6 w-6" />,
      vocabulary: ["Restaurant - Restaurante", "Menu - Menú", "Bill - La cuenta"],
      xpPoints: 140,
      difficulty: "Medium",
      progress: 0,
      cefrLevel: "B1",
      challenges: [
        {
          type: "matching",
          description: "Match food items with their Spanish names",
          xpReward: 30,
          unlocked: true,
        },
      ],
    },
    {
      id: 4,
      title: "Shopping & Money",
      description: "Learn to shop and discuss prices in Spanish",
      duration: "25 min",
      icon: <Briefcase className="h-6 w-6" />,
      vocabulary: ["How much? - ¿Cuánto cuesta?", "Expensive - Caro", "Cheap - Barato"],
      xpPoints: 130,
      difficulty: "Medium",
      progress: 0,
      cefrLevel: "B1",
      challenges: [
        {
          type: "quiz",
          description: "Multiple choice quiz on shopping and money",
          xpReward: 20,
          unlocked: true,
        },
      ],
    },
  ],
  advanced: [
    {
      id: 1,
      title: "Past Tenses",
      description: "Master the differences between Preterite and Imperfect through immersive practice.",
      duration: "40 min",
      icon: <GraduationCap className="h-6 w-6" />,
      vocabulary: ["I went - Fui", "I used to go - Iba", "I had - Tenía"],
      xpPoints: 200,
      difficulty: "Hard",
      progress: 0,
      cefrLevel: "C1",
      challenges: [
        {
          type: "storytelling",
          description: "Create a story using past tenses",
          xpReward: 100,
          unlocked: true,
        },
        {
          type: "debate",
          description: "AI-powered debate using past tenses",
          xpReward: 150,
          unlocked: false,
        },
      ],
      requiresVoice: true,
    },
    {
      id: 2,
      title: "Subjunctive Mood",
      description: "Master the Spanish subjunctive in various contexts",
      duration: "45 min",
      icon: <Trophy className="h-6 w-6" />,
      vocabulary: ["I hope that - Espero que", "I want that - Quiero que", "It's important that - Es importante que"],
      xpPoints: 250,
      difficulty: "Hard",
      progress: 0,
      cefrLevel: "C1",
      challenges: [
        {
          type: "writing",
          description: "Write a short essay on the subjunctive mood",
          xpReward: 30,
          unlocked: true,
        },
      ],
    },
    {
      id: 3,
      title: "Business Spanish",
      description: "Professional vocabulary and formal communication",
      duration: "35 min",
      icon: <Briefcase className="h-6 w-6" />,
      vocabulary: ["Meeting - Reunión", "Deadline - Fecha límite", "Project - Proyecto"],
      xpPoints: 180,
      difficulty: "Hard",
      progress: 0,
      cefrLevel: "C1",
      challenges: [
        {
          type: "matching",
          description: "Match business terms with their Spanish equivalents",
          xpReward: 30,
          unlocked: true,
        },
      ],
    },
    {
      id: 4,
      title: "Idiomatic Expressions",
      description: "Common Spanish idioms and their meanings",
      duration: "30 min",
      icon: <MessageCircle className="h-6 w-6" />,
      vocabulary: ["It's a piece of cake - Es pan comido", "To be broke - Estar pelado", "To pull someone's leg - Tomar el pelo"],
      xpPoints: 220,
      difficulty: "Hard",
      progress: 0,
      cefrLevel: "C1",
      challenges: [
        {
          type: "quiz",
          description: "Multiple choice quiz on idiomatic expressions",
          xpReward: 20,
          unlocked: true,
        },
      ],
    },
  ],
};

const getLevelColor = (level: string) => {
  switch (level) {
    case "beginner":
      return "text-green-600";
    case "intermediate":
      return "text-blue-600";
    case "advanced":
      return "text-purple-600";
    default:
      return "text-gray-600";
  }
};

const getCefrLevel = (level: string) => {
  switch (level) {
    case "beginner":
      return "A1-A2";
    case "intermediate":
      return "B1-B2";
    case "advanced":
      return "C1-C2";
    default:
      return "";
  }
};

const Lessons = () => {
  const [searchParams] = useSearchParams();
  const level = searchParams.get("level") || "beginner";
  const lessons = lessonsByLevel[level] || [];  
  const { toast } = useToast();
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  
  const calculateTotalXP = (lessonsArray: Lesson[] = []) => {
    return lessonsArray.reduce((acc, lesson) => acc + lesson.xpPoints, 0);
  };

  const calculateEarnedXP = (lessonsArray: Lesson[] = []) => {
    return lessonsArray.reduce((acc, lesson) => 
      acc + ((lesson.progress || 0) / 100 * lesson.xpPoints), 0);
  };

  const totalXP = calculateTotalXP(lessons);
  const earnedXP = calculateEarnedXP(lessons);

  const calculateTotalLessonsCount = () => {
    return Object.values(lessonsByLevel).reduce(
      (acc, levelLessons) => acc + (levelLessons?.length || 0),
      0
    );
  };

  const calculateCompletedLessonsCount = () => {
    return Object.values(lessonsByLevel).reduce(
      (acc, levelLessons) => acc + ((levelLessons || [])
        .filter(lesson => (lesson.progress || 0) === 100).length),
      0
    );
  };

  const totalLessonsCount = calculateTotalLessonsCount();
  const completedLessonsCount = calculateCompletedLessonsCount();

  const stats = {
    totalLessons: totalLessonsCount,
    completedLessons: completedLessonsCount,
    totalXP: totalXP,
    earnedXP: earnedXP,
    currentStreak: 5,
    nextLevel: "B1",
    nextMilestone: 1000,
  };

  const handleLevelChange = (newLevel: string) => {
    const newSearchParams = new URLSearchParams(searchParams);
    newSearchParams.set("level", newLevel);
    window.history.pushState({}, "", `?${newSearchParams.toString()}`);
    window.location.reload();
  };

  const handleStartLesson = (lessonId: number) => {
    const lesson = lessons.find(l => l.id === lessonId);
    if (!lesson) return;

    if (lesson.requiresVoice) {
      navigator.mediaDevices.getUserMedia({ audio: true })
        .then(() => {
          toast({
            title: "Microphone Access Granted",
            description: "You can now participate in voice challenges!",
          });
          setActiveLessonId(lessonId);
        })
        .catch(() => {
          toast({
            title: "Microphone Access Required",
            description: "Please allow microphone access to participate in voice challenges.",
            variant: "destructive",
          });
        });
    } else {
      setActiveLessonId(lessonId);
    }
  };

  const handleLessonComplete = () => {
    toast({
      title: "Unit Complete! 🎉",
      description: `You've earned ${basicGreetingsUnit.xpPoints} XP!`,
    });
    setActiveLessonId(null);
  };

  return (
    <div className="max-w-5xl mx-auto p-6">
      {activeLessonId ? (
        <LessonView
          unit={basicGreetingsUnit}
          onClose={() => setActiveLessonId(null)}
          onComplete={handleLessonComplete}
        />
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-8"
        >
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
              <h1 className="text-3xl font-bold text-lingua-text">
                Spanish Lessons <span className={`text-xl ${getLevelColor(level)}`}>({getCefrLevel(level)})</span>
              </h1>
            </div>

            <ProgressDashboard stats={stats} />
            
            <LevelSelector currentLevel={level} onLevelChange={handleLevelChange} />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onStart={handleStartLesson}
              />
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

const ProgressDashboard = ({ stats }) => {
  return (
    <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
      <Progress value={(stats.earnedXP / stats.totalXP) * 100} className="h-2" />
    </div>
  );
};

export default Lessons;
