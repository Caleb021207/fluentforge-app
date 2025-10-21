// Exercise type definitions

export type ExerciseType = 
  | 'flashcard' 
  | 'cloze' 
  | 'reorder' 
  | 'transform' 
  | 'guided_convo_text' 
  | 'guided_convo_voice';

export interface FlashcardPayload {
  type: 'flashcard';
  cards: Array<{
    lemma: string;
    display: string;
    ipa?: string;
    translation: string;
    example?: {
      en: string;
      trans?: string;
    };
    tts?: string;
  }>;
}

export interface ClozePayload {
  type: 'cloze';
  prompt: string;
  answer: string[];
  acceptNearMiss?: boolean;
  hint?: string;
}

export interface ReorderPayload {
  type: 'reorder';
  tokens: string[];
  solution: string[];
  hint?: string;
}

export interface TransformPayload {
  type: 'transform';
  input: string;
  instruction: 'negative' | 'question' | 'third_person' | 'past';
  solutions: string[];
}

export interface GuidedConvoTextPayload {
  type: 'guided_convo_text';
  steps: Array<
    | { kind: 'choice'; prompt: string; options: string[]; answer: number }
    | { kind: 'cloze'; prompt: string; answers: string[] }
    | { kind: 'short'; prompt: string; rubric?: string }
    | { kind: 'free'; system: string; maxTurns?: number }
  >;
  topic: string;
  cefr: string;
}

export interface GuidedConvoVoicePayload {
  type: 'guided_convo_voice';
  steps: Array<
    | { 
        kind: 'cloze_voice'; 
        promptAudio?: string; 
        promptText: string; 
        answers: string[]; 
        acceptNearMiss?: boolean;
      }
    | { 
        kind: 'free_voice'; 
        system: string; 
        durationSec?: number;
      }
  >;
  topic: string;
  cefr: string;
}

export type ExercisePayload = 
  | FlashcardPayload 
  | ClozePayload 
  | ReorderPayload 
  | TransformPayload 
  | GuidedConvoTextPayload 
  | GuidedConvoVoicePayload;

export interface Exercise {
  id: string;
  lesson_id: string;
  idx: number;
  type: ExerciseType;
  payload: ExercisePayload;
  cefr_tag?: string;
  topic?: string;
  grammar_point?: string;
  version: string;
}

export interface Course {
  id: string;
  name: string;
  description?: string;
  cefr_min?: string;
  cefr_max?: string;
}

export interface Unit {
  id: string;
  course_id: string;
  idx: number;
  title: string;
  description?: string;
  cefr_target?: string;
}

export interface Skill {
  id: string;
  unit_id: string;
  idx: number;
  title: string;
  description?: string;
  grammar_point?: string;
  vocab_theme?: string;
  cefr_target?: string;
}

export interface Lesson {
  id: string;
  skill_id: string;
  idx: number;
  title: string;
  exercise_count: number;
  estimated_minutes: number;
}

export interface UserSkillProgress {
  user_id: string;
  skill_id: string;
  mastery: number;
  last_practiced_at?: string;
}

export interface WordBankEntry {
  user_id: string;
  lemma: string;
  display: string;
  ipa?: string;
  translation: string;
  language: string;
  cefr_tag?: string;
  strength: number;
  srs_bucket: number;
  next_review_at: string;
  first_seen_at: string;
  last_reviewed_at?: string;
  review_count: number;
}
