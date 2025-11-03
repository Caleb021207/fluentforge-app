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
  // Comprehensive analysis fields (can be stored in detailed_feedback as JSON or separate columns)
  detailed_analysis?: {
    grammarAnalysis?: {
      strengths: string[];
      weaknesses: string[];
      examples: string[];
      recommendations: string[];
    };
    vocabularyAnalysis?: {
      level: string;
      range: string[];
      sophisticatedTerms: string[];
      collocations: string[];
      recommendations: string[];
    };
    pronunciationAnalysis?: {
      strengths: string[];
      challenges: string[];
      intonationPatterns: string;
      recommendations: string[];
    };
    fluencyAnalysis?: {
      speechRate: string;
      hesitationPatterns: string[];
      discourseMarkers: string[];
      selfCorrections: string;
      recommendations: string[];
    };
    coherenceAnalysis?: {
      organization: string;
      linkingDevices: string[];
      topicDevelopment: string;
      recommendations: string[];
    };
  };
  cefr_comparison?: {
    currentLevel: string;
    descriptorMatch: string;
    strengthsVsLevel: string[];
    gapsToNextLevel: string[];
    estimatedTimeToNextLevel: string;
  };
  learning_pathway?: {
    immediateGoals: string[];
    mediumTermGoals: string[];
    practiceActivities: Array<{
      activity: string;
      focus: string;
      frequency: string;
    }>;
    resourceRecommendations: string[];
  };
  progress_indicators?: {
    recentImprovements: string[];
    consistentStrengths: string[];
    emergingSkills: string[];
    priorityAreas: string[];
  };
}
