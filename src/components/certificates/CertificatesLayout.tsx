
import { CertificationAttempt } from "@/types/supabase";
import OverallCertificate from "@/components/certificates/OverallCertificate";
import ScoreCards from "@/components/certificates/ScoreCards";
import CertificationAttemptsList from "@/components/certificates/CertificationAttemptsList";
import ReadingCertification from "@/components/certifications/ReadingCertification";
import WritingCertification from "@/components/certifications/WritingCertification";
import TranslatedReadingCertification from "@/components/certifications/TranslatedReadingCertification";
import TranslatedWritingCertification from "@/components/certifications/TranslatedWritingCertification";
import ConversationalFluency from "@/components/certificates/ConversationalFluencyTest";
import { useLocalization } from "@/context/LocalizationContext";

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
  
  // Determine which version of components to use based on language
  const isEnglish = currentLanguage === "english";

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t("certificationProgress")}</h1>
      
      <OverallCertificate compositeScore={compositeScore} />
      
      {isEnglish ? (
        <ReadingCertification />
      ) : (
        <TranslatedReadingCertification />
      )}
      
      {isEnglish ? (
        <WritingCertification />
      ) : (
        <TranslatedWritingCertification />
      )}
      
      <ConversationalFluency onTestComplete={onTestComplete} />
      
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
