
import { ReactElement, ReactNode } from "react";

export interface Question {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: string;
  type: "multiple-choice" | "text-input" | "matching";
}

export interface Challenge {
  type: string;
  description: string;
  xpReward: number;
  timeLimit?: number;
  unlocked: boolean;
  questions?: Question[];
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  duration: string;
  icon: ReactNode;
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

export interface Unit {
  id: number;
  title: string;
  description: string;
  level: LevelName;
  cefrLevel: string;
  lessons: Lesson[];
  progress?: number;
  icon: ReactNode;
}

export type LevelName = "beginner" | "intermediate" | "advanced";

export interface UserProgress {
  [key: string]: number;
}

export interface LessonStats {
  totalLessons: number;
  completedLessons: number;
  totalXP: number;
  earnedXP: number;
  currentStreak: number;
  nextLevel: string;
  nextMilestone: number;
}
