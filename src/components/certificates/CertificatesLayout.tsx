
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface LanguagePair {
  sourceLanguage: string;
  targetLanguage: string;
}

interface CertificatesLayoutProps {
  normalizedAttempts: CertificationAttempt[];
  highestScores: Record<string, CertificationAttempt>;
  compositeScore: { score: number; level: string } | null;
  hasTranscript: Record<string, boolean>;
  isLoading: boolean;
  languagePairs: LanguagePair[];
  selectedPair: LanguagePair | null;
  onSelectLanguagePair: (pair: LanguagePair) => void;
  onViewAttempt: (attemptId: string) => void;
  onTestComplete: () => void;
}

const getLanguageName = (code: string): string => {
  switch(code) {
    case 'english': return 'English';
    case 'spanish': return 'Spanish';
    case 'portuguese': return 'Portuguese';
    default: return code.charAt(0).toUpperCase() + code.slice(1);
  }
};

const CertificatesLayout = ({
  normalizedAttempts,
  highestScores,
  compositeScore,
  hasTranscript,
  isLoading,
  languagePairs,
  selectedPair,
  onSelectLanguagePair,
  onViewAttempt,
  onTestComplete
}: CertificatesLayoutProps) => {
  const { t, currentLanguage } = useLocalization();
  
  // Determine which version of components to use based on language
  const isEnglish = currentLanguage === "english";

  const handleSelectPair = (value: string) => {
    const [sourceLanguage, targetLanguage] = value.split('-');
    onSelectLanguagePair({ sourceLanguage, targetLanguage });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">{t("certificationProgress")}</h1>
      
      {languagePairs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>{t("selectLanguagePair")}</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              value={selectedPair ? `${selectedPair.sourceLanguage}-${selectedPair.targetLanguage}` : ''}
              onValueChange={handleSelectPair}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={t("selectLanguagePair")} />
              </SelectTrigger>
              <SelectContent>
                {languagePairs.map((pair, index) => (
                  <SelectItem 
                    key={index} 
                    value={`${pair.sourceLanguage}-${pair.targetLanguage}`}
                  >
                    {getLanguageName(pair.sourceLanguage)} → {getLanguageName(pair.targetLanguage)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>
      )}
      
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
      
      <ConversationalFluency 
        onTestComplete={onTestComplete} 
        languagePair={selectedPair}
      />
      
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
