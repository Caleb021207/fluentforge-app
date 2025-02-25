
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  BookOpen,
  MessageCircle,
  Trophy,
  Rocket,
  GraduationCap,
  Globe,
  Heart,
  Coffee,
  Home,
  Clock,
  Users,
  Briefcase,
  Utensils,
  Plane,
  Music,
  Phone,
  Star,
} from "lucide-react";

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
}

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

const lessonsByLevel: Record<string, Lesson[]> = {
  beginner: [
    {
      id: 1,
      title: "Basic Greetings",
      description: "Learn essential Spanish greetings and introductions (Hola, Buenos días, etc.)",
      duration: "15 min",
      icon: <MessageCircle className="h-6 w-6" />,
      vocabulary: ["Hello - Hola", "Good morning - Buenos días", "Good evening - Buenas noches"],
      xpPoints: 50,
      difficulty: "Easy",
      progress: 80,
    },
    {
      id: 2,
      title: "Numbers 1-20",
      description: "Master counting in Spanish (Uno, Dos, Tres...)",
      duration: "20 min",
      icon: <BookOpen className="h-6 w-6" />,
      vocabulary: ["One - Uno", "Two - Dos", "Three - Tres"],
      xpPoints: 75,
      difficulty: "Easy",
      progress: 60,
    },
    {
      id: 3,
      title: "Family Members",
      description: "Learn words for family relations (Madre, Padre, Hermano)",
      duration: "25 min",
      icon: <Users className="h-6 w-6" />,
      vocabulary: ["Mother - Madre", "Father - Padre", "Sister - Hermana"],
      xpPoints: 100,
      difficulty: "Medium",
      progress: 30,
    },
    {
      id: 4,
      title: "Basic Phrases",
      description: "Essential everyday Spanish phrases",
      duration: "20 min",
      icon: <Globe className="h-6 w-6" />,
      vocabulary: ["Please - Por favor", "Thank you - Gracias", "You're welcome - De nada"],
      xpPoints: 80,
      difficulty: "Easy",
      progress: 0,
    },
  ],
  intermediate: [
    {
      id: 1,
      title: "Present Tense Verbs",
      description: "Master regular -ar, -er, -ir verbs in present tense",
      duration: "30 min",
      icon: <Rocket className="h-6 w-6" />,
      vocabulary: ["To speak - Hablar", "To eat - Comer", "To live - Vivir"],
      xpPoints: 150,
      difficulty: "Medium",
      progress: 40,
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
    },
  ],
  advanced: [
    {
      id: 1,
      title: "Past Tenses",
      description: "Learn when to use Preterite vs Imperfect",
      duration: "40 min",
      icon: <GraduationCap className="h-6 w-6" />,
      vocabulary: ["I went - Fui", "I used to go - Iba", "I had - Tenía"],
      xpPoints: 200,
      difficulty: "Hard",
      progress: 0,
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
    },
  ],
};

const Lessons = () => {
  const [searchParams] = useSearchParams();
  const level = searchParams.get("level") || "beginner";
  const lessons = lessonsByLevel[level];
  
  // Calculate total XP for current level
  const totalXP = lessons.reduce((acc, lesson) => acc + lesson.xpPoints, 0);
  const earnedXP = lessons.reduce((acc, lesson) => acc + (lesson.progress || 0) / 100 * lesson.xpPoints, 0);

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-lingua-text">
              Spanish Lessons <span className={`text-xl ${getLevelColor(level)}`}>({getCefrLevel(level)})</span>
            </h1>
            <div className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="font-semibold">{Math.round(earnedXP)} / {totalXP} XP</span>
            </div>
          </div>
          
          <div className="w-full bg-gray-100 rounded-full h-2 mb-6">
            <Progress value={(earnedXP / totalXP) * 100} className="h-2" />
          </div>

          <p className="text-gray-600">
            Browse our comprehensive English to Spanish curriculum. Feel free to start with any lesson
            that interests you, though we recommend following the order for the best learning experience.
          </p>
          
          <div className="flex space-x-4 my-4">
            <Button
              variant={level === "beginner" ? "default" : "outline"}
              onClick={() => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set("level", "beginner");
                window.history.pushState({}, "", `?${newSearchParams.toString()}`);
                window.location.reload();
              }}
            >
              Beginner
            </Button>
            <Button
              variant={level === "intermediate" ? "default" : "outline"}
              onClick={() => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set("level", "intermediate");
                window.history.pushState({}, "", `?${newSearchParams.toString()}`);
                window.location.reload();
              }}
            >
              Intermediate
            </Button>
            <Button
              variant={level === "advanced" ? "default" : "outline"}
              onClick={() => {
                const newSearchParams = new URLSearchParams(searchParams);
                newSearchParams.set("level", "advanced");
                window.history.pushState({}, "", `?${newSearchParams.toString()}`);
                window.location.reload();
              }}
            >
              Advanced
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-lingua-primary/10 rounded-lg">
                  {lesson.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <div className="flex justify-between items-start">
                    <h3 className="text-xl font-semibold">{lesson.title}</h3>
                    <span className={`px-2 py-1 rounded text-sm ${
                      lesson.difficulty === "Easy" 
                        ? "bg-green-100 text-green-800"
                        : lesson.difficulty === "Medium"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-purple-100 text-purple-800"
                    }`}>
                      {lesson.difficulty}
                    </span>
                  </div>
                  <p className="text-gray-600">{lesson.description}</p>
                  <div className="pt-2">
                    <h4 className="font-medium text-sm text-gray-700">Key Vocabulary:</h4>
                    <ul className="text-sm text-gray-600 list-disc list-inside mt-1">
                      {lesson.vocabulary.map((word, index) => (
                        <li key={index}>{word}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex items-center justify-between pt-4">
                    <div className="space-y-1 flex-1">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">{lesson.duration}</span>
                        <span className="text-gray-500">{lesson.progress || 0}%</span>
                      </div>
                      <Progress value={lesson.progress || 0} className="h-2" />
                    </div>
                    <Button size="sm" className="ml-4">
                      {lesson.progress ? "Continue" : "Start"} ({lesson.xpPoints} XP)
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Lessons;
