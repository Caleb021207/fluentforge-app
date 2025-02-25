
import { Book, BookOpen, BookOpenCheck, Layers, MessageSquare, Mic, Pencil, Play, School, Zap } from 'lucide-react';

// Define common types
export interface Exercise {
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
  timeLimit?: number;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
  exercises: Exercise[];
  xpReward: number;
}

export interface Unit {
  id: number;
  title: string;
  description: string;
  vocabulary: string[];
  lessons: Lesson[];
  xpPoints: number;
  cefrLevel: string;
}

// Export all units
export { basicUnit } from './units/basicUnit';
export { numbersAndColorsUnit } from './units/numbersAndColorsUnit';
export { foodAndBeveragesUnit } from './units/foodAndBeveragesUnit';
export { travelUnit } from './units/travelUnit';
