
export interface Analysis {
  id: string;
  upload_date: string;
  overall_score: number | null;
  cefr_level: string | null;
  file_name: string;
  reading_score: number | null;
  writing_score: number | null;
  speaking_score: number | null;
  listening_score: number | null;
  strengths: string[] | null;
  weaknesses: string[] | null;
  recommendations: string[] | null;
  detailed_feedback: string | null;
}
