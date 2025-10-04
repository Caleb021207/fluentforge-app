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
  recommendations: string[] | null;
  detailed_feedback: string | null;
}
