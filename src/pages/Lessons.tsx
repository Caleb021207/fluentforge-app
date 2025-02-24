
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  BookOpen,
  MessageCircle,
  Trophy,
  Rocket,
  GraduationCap,
} from "lucide-react";

interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  icon: JSX.Element;
}

const lessonsByLevel: Record<string, Lesson[]> = {
  beginner: [
    {
      id: 1,
      title: "Basic Greetings",
      description: "Learn essential greetings and introductions",
      duration: "15 min",
      icon: <MessageCircle className="h-6 w-6" />,
    },
    {
      id: 2,
      title: "Numbers 1-10",
      description: "Master counting in your target language",
      duration: "20 min",
      icon: <BookOpen className="h-6 w-6" />,
    },
  ],
  intermediate: [
    {
      id: 1,
      title: "Past Tense Basics",
      description: "Learn to talk about past events",
      duration: "25 min",
      icon: <Rocket className="h-6 w-6" />,
    },
    {
      id: 2,
      title: "Daily Routines",
      description: "Describe your daily activities",
      duration: "30 min",
      icon: <Trophy className="h-6 w-6" />,
    },
  ],
  advanced: [
    {
      id: 1,
      title: "Complex Grammar",
      description: "Master advanced grammar structures",
      duration: "40 min",
      icon: <GraduationCap className="h-6 w-6" />,
    },
    {
      id: 2,
      title: "Idiomatic Expressions",
      description: "Learn native-like expressions",
      duration: "35 min",
      icon: <MessageCircle className="h-6 w-6" />,
    },
  ],
};

const Lessons = () => {
  const [searchParams] = useSearchParams();
  const level = searchParams.get("level") || "beginner";
  const lessons = lessonsByLevel[level];

  return (
    <div className="max-w-5xl mx-auto p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        <div className="space-y-4">
          <h1 className="text-3xl font-bold text-lingua-text">
            Your Personalized Learning Path
          </h1>
          <p className="text-gray-600">
            Based on your placement quiz, we've customized a{" "}
            <span className="font-semibold capitalize">{level}</span> level
            learning path for you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {lessons.map((lesson) => (
            <Card key={lesson.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start space-x-4">
                <div className="p-2 bg-lingua-primary/10 rounded-lg">
                  {lesson.icon}
                </div>
                <div className="flex-1 space-y-2">
                  <h3 className="text-xl font-semibold">{lesson.title}</h3>
                  <p className="text-gray-600">{lesson.description}</p>
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-sm text-gray-500">{lesson.duration}</span>
                    <Button size="sm">Start Lesson</Button>
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
