
import { CertificationAttempt } from "@/types/supabase";
import OverallCertificate from "@/components/certificates/OverallCertificate";
import ScoreCards from "@/components/certificates/ScoreCards";
import CertificationAttemptsList from "@/components/certificates/CertificationAttemptsList";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { BookOpen, FileText, MessageCircle } from "lucide-react";

interface CertificatesLayoutProps {
  normalizedAttempts: CertificationAttempt[];
  highestScores: Record<string, CertificationAttempt>;
  compositeScore: { score: number; level: string } | null;
  hasTranscript: Record<string, boolean>;
  isLoading: boolean;
  onViewAttempt: (attemptId: string) => void;
  onTestComplete: () => void;
}

const CertificatesLayout = ({
  normalizedAttempts,
  highestScores,
  compositeScore,
  hasTranscript,
  isLoading,
  onViewAttempt,
  onTestComplete
}: CertificatesLayoutProps) => {
  const { t, currentLanguage } = useLocalization();
  const navigate = useNavigate();
  
  return (
    <div className="space-y-6">
      <div className="text-center mb-10">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-4">{t("certificationProgress")}</h1>
        <p className="text-xl md:text-2xl text-muted-foreground">{t("trackYourProgress")}</p>
      </div>
      
      <OverallCertificate compositeScore={compositeScore} />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Reading Tests Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <BookOpen className="mr-2 h-5 w-5" />
              Reading Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-base md:text-lg">
              Assess your reading comprehension in the language you are learning.
            </p>
            <div className="grid grid-cols-3 gap-2">
              {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((level) => (
                <Button 
                  key={level}
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate(`/certificates/reading/${level.toLowerCase()}`)}
                >
                  {level}
                </Button>
              ))}
            </div>
            <Button className="w-full" onClick={() => navigate('/certificates/reading')}>
              {t("startTest")}
            </Button>
          </CardContent>
        </Card>
        
        {/* Writing Tests Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="mr-2 h-5 w-5" />
              Writing Tests
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-base md:text-lg">
              Test your writing skills with prompts at various CEFR levels.
            </p>
            <Button className="w-full" onClick={() => navigate('/certificates/writing')}>
              {t("startTest")}
            </Button>
          </CardContent>
        </Card>
        
        {/* Speaking Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="mr-2 h-5 w-5" />
              Speaking Practice
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-600 text-base md:text-lg">
              Practise and assess your speaking fluency in a live conversation.
            </p>
            <Button className="w-full" onClick={() => navigate('/premium-voice-practice')}>
              {t("startTest")}
            </Button>
          </CardContent>
        </Card>
      </div>
      
      <ScoreCards highestScores={highestScores} />

      <CertificationAttemptsList 
        attempts={normalizedAttempts} 
        hasTranscript={hasTranscript}
        onViewAttempt={onViewAttempt}
        isLoading={isLoading}
      />
    </div>
  );
};

export default CertificatesLayout;
