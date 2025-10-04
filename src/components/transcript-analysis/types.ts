
export interface Recommendation {
  practice_type: 'text' | 'voice' | 'pronunciation' | 'combined';
  route: '/practice' | '/voice-chat' | '/pronunciation-practice';
  suggested_level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  title: string;
  recommendation_text: string;
  suggested_focus: string[];
  suggested_params?: {
    level?: string;
    topic?: string;
    focus?: string;
  };
}

export interface Analysis {
  id: string;
  upload_date: string;
  overall_score: number | null;
  cefr_level: string | null;
  file_name: string;
  reading_listening_score: number | null;
  written_production_score: number | null;
  spoken_fluency_score: number | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  recommendations: Recommendation[] | null;
  detailed_feedback: string | null;
}
