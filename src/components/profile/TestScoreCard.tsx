
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Calendar, Award } from "lucide-react";
import { getCEFRColor } from "@/components/transcript-analysis/utils/cefrUtils";

interface TestScore {
  id: string;
  overall_score: number | null;
  cefr_level: string | null;
  reading_listening_score: number | null;
  written_production_score: number | null;
  spoken_fluency_score: number | null;
  upload_date: string;
}

interface TestScoreCardProps {
  testScore: TestScore | null;
  title?: string;
  showDetails?: boolean;
}

const TestScoreCard = ({ testScore, title = "Latest Test Score", showDetails = true }: TestScoreCardProps) => {
  if (!testScore) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground">No test scores available</p>
            <p className="text-sm text-muted-foreground mt-2">
              Upload a transcript for AI analysis to see your scores
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Award className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary">
              {testScore.overall_score ? `${Math.round(testScore.overall_score)}%` : 'N/A'}
            </div>
            <p className="text-sm text-muted-foreground">Overall Score</p>
          </div>
          <div className="text-center">
            {testScore.cefr_level ? (
              <Badge className={getCEFRColor(testScore.cefr_level)}>
                {testScore.cefr_level}
              </Badge>
            ) : (
              <div className="text-muted-foreground">N/A</div>
            )}
            <p className="text-sm text-muted-foreground mt-1">CEFR Level</p>
          </div>
          <div className="text-center flex items-center justify-center gap-1">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formatDate(testScore.upload_date)}</span>
          </div>
        </div>

        {showDetails && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="text-center">
              <div className="text-lg font-semibold">
                {testScore.reading_listening_score ? Math.round(testScore.reading_listening_score) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Comprehension (Auditory & Reading)</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {testScore.written_production_score ? Math.round(testScore.written_production_score) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Written Production</p>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">
                {testScore.spoken_fluency_score ? Math.round(testScore.spoken_fluency_score) : 'N/A'}
              </div>
              <p className="text-xs text-muted-foreground">Conversational Fluency</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TestScoreCard;
