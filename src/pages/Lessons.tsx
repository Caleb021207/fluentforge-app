
import { useState, useEffect } from "react";
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
import { supabase } from "@/integrations/supabase/client";

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
  const [lessons, setLessons] = useState<Lesson[]>(lessonsByLevel[level] || []);
  const { toast } = useToast();
  const [activeLessonId, setActiveLessonId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [userProgress, setUserProgress] = useState<Record<string, any>>({});
  
  const calculateTotalXP = (lessonsArray: Lesson[] = []) => {
    return lessonsArray.reduce((acc, lesson) => acc + lesson.xpPoints, 0);
  };

  const calculateEarnedXP = (lessonsArray: Lesson[] = []) => {
    return lessonsArray.reduce((acc, lesson) => 
      acc + ((lesson.progress || 0) / 100 * lesson.xpPoints), 0);
  };

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

  useEffect(() => {
    const fetchUserProgress = async () => {
      setIsLoading(true);
      
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session?.user) {
          const { data, error } = await supabase
            .from('lesson_progress')
            .select('*')
            .eq('user_id', session.user.id)
            .eq('level', level);
            
          if (error) throw error;
          
          const progressMap = {};
          if (data) {
            data.forEach(item => {
              progressMap[item.lesson_id] = item.progress;
            });
          }
          
          setUserProgress(progressMap);
          
          const updatedLessons = lessonsByLevel[level].map(lesson => ({
            ...lesson,
            progress: progressMap[lesson.id] || 0
          }));
          
          setLessons(updatedLessons);
        } else {
          setLessons(lessonsByLevel[level]);
        }
      } catch (error) {
        console.error("Error fetching lesson progress:", error);
        setLessons(lessonsByLevel[level]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProgress();
  }, [level]);

  const totalXP = calculateTotalXP(lessons);
  const earnedXP = calculateEarnedXP(lessons);
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
    setActiveLessonId(lessonId);
  };

  const handleCompleteLesson = () => {
    // When lesson is completed, update the UI and potentially store progress
    toast({
      title: "Lesson Completed",
      description: "Congratulations! You've earned XP for completing this lesson.",
    });
    setActiveLessonId(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="grid gap-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Spanish Lessons</h1>
          <LevelSelector currentLevel={level} onLevelChange={handleLevelChange} />
        </div>
        
        {isLoading ? (
          <div>Loading...</div>
        ) : activeLessonId ? (
          <LessonView
            lesson={lessons.find(l => l.id === activeLessonId)!}
            onClose={() => setActiveLessonId(null)}
            onComplete={handleCompleteLesson}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {lessons.map((lesson) => (
              <LessonCard
                key={lesson.id}
                lesson={lesson}
                onStart={() => handleStartLesson(lesson.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Lessons;
