
export type Question = {
  text: string;
  options: string[];
  correctAnswer: number;
  type: 'multiple-choice' | 'true-false';
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
};

