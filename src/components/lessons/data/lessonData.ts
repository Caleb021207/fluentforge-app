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
  Star,
  Home,
  Building,
  Bus,
  Map,
  ShoppingBag
} from "lucide-react";
import { Lesson, LevelName, Unit } from "../types";
import React from "react";

const createBasicQuestions = (topic: string, num: number = 5) => {
  return Array(num).fill(null).map((_, index) => ({
    id: index + 1,
    question: `Sample ${topic} question ${index + 1}?`,
    options: ["Option A", "Option B", "Option C", "Option D"],
    correctAnswer: "Option A",
    type: "multiple-choice" as const
  }));
};

const lessonsByLevel: Record<LevelName, Lesson[]> = {
  beginner: [
    {
      id: 1,
      title: "Basic Greetings",
      description: "Learn essential Spanish greetings and introductions through interactive exercises.",
      duration: "15 min",
      icon: React.createElement(MessageCircle, { className: "h-6 w-6" }),
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
          questions: createBasicQuestions("greetings")
        }
      ],
    },
    {
      id: 2,
      title: "Numbers 1-20",
      description: "Master counting in Spanish through interactive games and exercises.",
      duration: "20 min",
      icon: React.createElement(BookOpen, { className: "h-6 w-6" }),
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
          questions: createBasicQuestions("numbers")
        }
      ],
    },
    {
      id: 3,
      title: "Colors",
      description: "Learn common colors in Spanish",
      duration: "15 min",
      icon: React.createElement(Globe, { className: "h-6 w-6" }),
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
          questions: createBasicQuestions("colors")
        }
      ],
    },
    {
      id: 4,
      title: "Family Members",
      description: "Learn words for family relations",
      duration: "25 min",
      icon: React.createElement(Users, { className: "h-6 w-6" }),
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
          questions: createBasicQuestions("family")
        }
      ],
    },
    {
      id: 5,
      title: "Common Objects",
      description: "Learn everyday objects and items",
      duration: "20 min",
      icon: React.createElement(BookOpen, { className: "h-6 w-6" }),
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
      cefrLevel: "A1",
      challenges: [
        {
          type: "vocabulary",
          description: "Match objects with their Spanish names",
          xpReward: 70,
          unlocked: true,
          questions: createBasicQuestions("objects")
        }
      ],
    },
    {
      id: 6,
      title: "Food & Drinks",
      description: "Learn common food and drink vocabulary",
      duration: "25 min",
      icon: React.createElement(Utensils, { className: "h-6 w-6" }),
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
      cefrLevel: "A1",
      challenges: [
        {
          type: "vocabulary",
          description: "Match food and drink items with their Spanish names",
          xpReward: 85,
          unlocked: true,
          questions: createBasicQuestions("food")
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
      icon: React.createElement(Rocket, { className: "h-6 w-6" }),
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
          questions: createBasicQuestions("present tense")
        },
        {
          type: "conversation",
          description: "AI roleplay using present tense verbs",
          xpReward: 100,
          unlocked: false,
          questions: createBasicQuestions("conversation")
        },
      ],
      requiresVoice: true,
    },
    {
      id: 2,
      title: "Daily Routines",
      description: "Describe your daily activities in Spanish",
      duration: "25 min",
      icon: React.createElement(Clock, { className: "h-6 w-6" }),
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
          questions: createBasicQuestions("daily routines")
        },
      ],
    },
    {
      id: 3,
      title: "Food & Dining",
      description: "Restaurant vocabulary and ordering food",
      duration: "30 min",
      icon: React.createElement(Utensils, { className: "h-6 w-6" }),
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
          questions: createBasicQuestions("food and dining")
        },
      ],
    },
    {
      id: 4,
      title: "Shopping & Money",
      description: "Learn to shop and discuss prices in Spanish",
      duration: "25 min",
      icon: React.createElement(Briefcase, { className: "h-6 w-6" }),
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
          questions: createBasicQuestions("shopping")
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
      icon: React.createElement(GraduationCap, { className: "h-6 w-6" }),
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
          questions: createBasicQuestions("past tenses")
        },
        {
          type: "debate",
          description: "AI-powered debate using past tenses",
          xpReward: 150,
          unlocked: false,
          questions: createBasicQuestions("past tense debate")
        },
      ],
      requiresVoice: true,
    },
    {
      id: 2,
      title: "Subjunctive Mood",
      description: "Master the Spanish subjunctive in various contexts",
      duration: "45 min",
      icon: React.createElement(Trophy, { className: "h-6 w-6" }),
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
          questions: createBasicQuestions("subjunctive mood")
        },
      ],
    },
    {
      id: 3,
      title: "Business Spanish",
      description: "Professional vocabulary and formal communication",
      duration: "35 min",
      icon: React.createElement(Briefcase, { className: "h-6 w-6" }),
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
          questions: createBasicQuestions("business terms")
        },
      ],
    },
    {
      id: 4,
      title: "Idiomatic Expressions",
      description: "Common Spanish idioms and their meanings",
      duration: "30 min",
      icon: React.createElement(MessageCircle, { className: "h-6 w-6" }),
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
          questions: createBasicQuestions("idioms")
        },
      ],
    },
  ],
};

const unitsByLevel: Record<LevelName, Unit[]> = {
  beginner: [
    {
      id: 1,
      title: "Getting Started",
      description: "Learn the basics of Spanish communication",
      level: "beginner",
      cefrLevel: "A1",
      icon: React.createElement(Star, { className: "h-6 w-6" }),
      progress: 0,
      lessons: lessonsByLevel.beginner.slice(0, 5)
    },
    {
      id: 2,
      title: "Daily Life",
      description: "Learn vocabulary for everyday situations",
      level: "beginner",
      cefrLevel: "A1-A2",
      icon: React.createElement(Home, { className: "h-6 w-6" }),
      progress: 0,
      lessons: [
        lessonsByLevel.beginner[5],
        {
          id: 7,
          title: "Telling Time",
          description: "Learn to express time in Spanish",
          duration: "20 min",
          icon: React.createElement(Clock, { className: "h-6 w-6" }),
          vocabulary: [
            "Hora - Hour",
            "Minuto - Minute",
            "Segundo - Second",
            "¿Qué hora es? - What time is it?",
            "Es la una - It's one o'clock"
          ],
          xpPoints: 65,
          difficulty: "Easy",
          progress: 0,
          cefrLevel: "A1",
          challenges: [
            {
              type: "vocabulary",
              description: "Practice telling time in Spanish",
              xpReward: 65,
              unlocked: true,
              questions: createBasicQuestions("telling time")
            }
          ],
        },
        {
          id: 8,
          title: "Weather",
          description: "Vocabulary about weather conditions",
          duration: "15 min",
          icon: React.createElement(Globe, { className: "h-6 w-6" }),
          vocabulary: [
            "Soleado - Sunny",
            "Lluvioso - Rainy",
            "Nublado - Cloudy",
            "Caliente - Hot",
            "Frío - Cold"
          ],
          xpPoints: 70,
          difficulty: "Easy",
          progress: 0,
          cefrLevel: "A1",
          challenges: [
            {
              type: "vocabulary",
              description: "Match weather terms with their Spanish equivalents",
              xpReward: 70,
              unlocked: true,
              questions: createBasicQuestions("weather")
            }
          ],
        },
        {
          id: 9,
          title: "Transportation",
          description: "Learn vocabulary for getting around",
          duration: "25 min",
          icon: React.createElement(Bus, { className: "h-6 w-6" }),
          vocabulary: [
            "Autobús - Bus",
            "Tren - Train",
            "Taxi - Taxi",
            "Avión - Airplane",
            "Coche - Car"
          ],
          xpPoints: 75,
          difficulty: "Easy",
          progress: 0,
          cefrLevel: "A2",
          challenges: [
            {
              type: "vocabulary",
              description: "Practice transportation vocabulary",
              xpReward: 75,
              unlocked: true,
              questions: createBasicQuestions("transportation")
            }
          ],
        },
        {
          id: 10,
          title: "Shopping Basics",
          description: "Essential vocabulary for shopping",
          duration: "30 min",
          icon: React.createElement(ShoppingBag, { className: "h-6 w-6" }),
          vocabulary: [
            "Tienda - Store",
            "Precio - Price",
            "Comprar - To buy",
            "Vender - To sell",
            "Descuento - Discount"
          ],
          xpPoints: 80,
          difficulty: "Easy",
          progress: 0,
          cefrLevel: "A2",
          challenges: [
            {
              type: "vocabulary",
              description: "Practice shopping vocabulary",
              xpReward: 80,
              unlocked: true,
              questions: createBasicQuestions("shopping basics")
            }
          ],
        }
      ]
    }
  ],
  intermediate: [
    {
      id: 1,
      title: "Everyday Communication",
      description: "Develop practical conversation skills",
      level: "intermediate",
      cefrLevel: "B1",
      icon: React.createElement(MessageCircle, { className: "h-6 w-6" }),
      progress: 10,
      lessons: lessonsByLevel.intermediate.slice(0, 4)
    },
    {
      id: 2,
      title: "Travel & Culture",
      description: "Learn to navigate travel situations",
      level: "intermediate",
      cefrLevel: "B1-B2",
      icon: React.createElement(Map, { className: "h-6 w-6" }),
      progress: 0,
      lessons: [
        {
          id: 5,
          title: "Travel Plans",
          description: "Learn to discuss travel arrangements",
          duration: "30 min",
          icon: React.createElement(Map, { className: "h-6 w-6" }),
          vocabulary: [
            "Viaje - Trip",
            "Hotel - Hotel",
            "Reserva - Reservation",
            "Turista - Tourist",
            "Pasaporte - Passport"
          ],
          xpPoints: 135,
          difficulty: "Medium",
          progress: 0,
          cefrLevel: "B1",
          challenges: [
            {
              type: "conversation",
              description: "Practice making travel arrangements",
              xpReward: 135,
              unlocked: true,
              questions: createBasicQuestions("travel plans")
            }
          ],
        },
        {
          id: 6,
          title: "Directions",
          description: "Learn to give and follow directions",
          duration: "25 min",
          icon: React.createElement(Map, { className: "h-6 w-6" }),
          vocabulary: [
            "Izquierda - Left",
            "Derecha - Right",
            "Recto - Straight ahead",
            "Cerca - Near",
            "Lejos - Far"
          ],
          xpPoints: 140,
          difficulty: "Medium",
          progress: 0,
          cefrLevel: "B1",
          challenges: [
            {
              type: "conversation",
              description: "Practice giving directions",
              xpReward: 140,
              unlocked: true,
              questions: createBasicQuestions("directions")
            }
          ],
        },
        {
          id: 7,
          title: "Cultural Customs",
          description: "Learn about Spanish cultural norms",
          duration: "35 min",
          icon: React.createElement(Globe, { className: "h-6 w-6" }),
          vocabulary: [
            "Costumbre - Custom",
            "Tradición - Tradition",
            "Celebración - Celebration",
            "Fiesta - Party/Festival",
            "Siesta - Nap"
          ],
          xpPoints: 150,
          difficulty: "Medium",
          progress: 0,
          cefrLevel: "B2",
          challenges: [
            {
              type: "writing",
              description: "Write about Spanish customs",
              xpReward: 150,
              unlocked: true,
              questions: createBasicQuestions("cultural customs")
            }
          ],
        },
        {
          id: 8,
          title: "City Life",
          description: "Vocabulary for urban environments",
          duration: "30 min",
          icon: React.createElement(Building, { className: "h-6 w-6" }),
          vocabulary: [
            "Ciudad - City",
            "Barrio - Neighborhood",
            "Centro - Downtown",
            "Edificio - Building",
            "Plaza - Square"
          ],
          xpPoints: 145,
          difficulty: "Medium",
          progress: 0,
          cefrLevel: "B2",
          challenges: [
            {
              type: "conversation",
              description: "Practice describing city locations",
              xpReward: 145,
              unlocked: true,
              questions: createBasicQuestions("city life")
            }
          ],
        },
        {
          id: 9,
          title: "Social Interactions",
          description: "Learn vocabulary for social settings",
          duration: "40 min",
          icon: React.createElement(Users, { className: "h-6 w-6" }),
          vocabulary: [
            "Amigo - Friend",
            "Conocido - Acquaintance",
            "Invitar - To invite",
            "Reunión - Meeting/Gathering",
            "Charlar - To chat"
          ],
          xpPoints: 155,
          difficulty: "Medium",
          progress: 0,
          cefrLevel: "B2",
          challenges: [
            {
              type: "roleplay",
              description: "Practice social conversations",
              xpReward: 155,
              unlocked: true,
              questions: createBasicQuestions("social interactions")
            }
          ],
        }
      ]
    }
  ],
  advanced: [
    {
      id: 1,
      title: "Advanced Grammar",
      description: "Master complex grammatical structures",
      level: "advanced",
      cefrLevel: "C1",
      icon: React.createElement(GraduationCap, { className: "h-6 w-6" }),
      progress: 0,
      lessons: lessonsByLevel.advanced.slice(0, 4)
    },
    {
      id: 2,
      title: "Professional Spanish",
      description: "Develop language skills for professional settings",
      level: "advanced",
      cefrLevel: "C1-C2",
      icon: React.createElement(Briefcase, { className: "h-6 w-6" }),
      progress: 0,
      lessons: [
        {
          id: 5,
          title: "Job Interviews",
          description: "Practice language for job interviews",
          duration: "45 min",
          icon: React.createElement(Briefcase, { className: "h-6 w-6" }),
          vocabulary: [
            "Entrevista - Interview",
            "Currículum - Resume",
            "Experiencia - Experience",
            "Habilidades - Skills",
            "Salario - Salary"
          ],
          xpPoints: 230,
          difficulty: "Hard",
          progress: 0,
          cefrLevel: "C1",
          challenges: [
            {
              type: "roleplay",
              description: "Practice job interview scenarios",
              xpReward: 230,
              unlocked: true,
              questions: createBasicQuestions("job interviews")
            }
          ],
        },
        {
          id: 6,
          title: "Business Negotiations",
          description: "Learn vocabulary for business negotiations",
          duration: "50 min",
          icon: React.createElement(Briefcase, { className: "h-6 w-6" }),
          vocabulary: [
            "Negociar - To negotiate",
            "Acuerdo - Agreement",
            "Propuesta - Proposal",
            "Contrato - Contract",
            "Términos - Terms"
          ],
          xpPoints: 240,
          difficulty: "Hard",
          progress: 0,
          cefrLevel: "C2",
          challenges: [
            {
              type: "roleplay",
              description: "Practice business negotiation scenarios",
              xpReward: 240,
              unlocked: true,
              questions: createBasicQuestions("business negotiations")
            }
          ],
        },
        {
          id: 7,
          title: "Academic Spanish",
          description: "Learn vocabulary for academic contexts",
          duration: "40 min",
          icon: React.createElement(BookOpen, { className: "h-6 w-6" }),
          vocabulary: [
            "Investigación - Research",
            "Tesis - Thesis",
            "Análisis - Analysis",
            "Hipótesis - Hypothesis",
            "Conclusión - Conclusion"
          ],
          xpPoints: 220,
          difficulty: "Hard",
          progress: 0,
          cefrLevel: "C2",
          challenges: [
            {
              type: "writing",
              description: "Write an academic paragraph",
              xpReward: 220,
              unlocked: true,
              questions: createBasicQuestions("academic writing")
            }
          ],
        },
        {
          id: 8,
          title: "Medical Spanish",
          description: "Learn vocabulary for medical settings",
          duration: "45 min",
          icon: React.createElement(BookOpen, { className: "h-6 w-6" }),
          vocabulary: [
            "Médico - Doctor",
            "Enfermero - Nurse",
            "Síntoma - Symptom",
            "Diagnóstico - Diagnosis",
            "Tratamiento - Treatment"
          ],
          xpPoints: 235,
          difficulty: "Hard",
          progress: 0,
          cefrLevel: "C2",
          challenges: [
            {
              type: "roleplay",
              description: "Practice medical conversations",
              xpReward: 235,
              unlocked: true,
              questions: createBasicQuestions("medical Spanish")
            }
          ],
        },
        {
          id: 9,
          title: "Legal Spanish",
          description: "Learn vocabulary for legal contexts",
          duration: "50 min",
          icon: React.createElement(BookOpen, { className: "h-6 w-6" }),
          vocabulary: [
            "Abogado - Lawyer",
            "Juez - Judge",
            "Ley - Law",
            "Contrato - Contract",
            "Demanda - Lawsuit"
          ],
          xpPoints: 245,
          difficulty: "Hard",
          progress: 0,
          cefrLevel: "C2",
          challenges: [
            {
              type: "vocabulary",
              description: "Match legal terms with their Spanish equivalents",
              xpReward: 245,
              unlocked: true,
              questions: createBasicQuestions("legal Spanish")
            }
          ],
        }
      ]
    }
  ],
};

export default unitsByLevel;
