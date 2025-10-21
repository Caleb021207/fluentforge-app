import CertificatesDataProvider from "@/components/certificates/CertificatesDataProvider";
import CertificatesLayout from "@/components/certificates/CertificatesLayout";
import { GradientBlob } from "@/components/ui/decorative-elements";

const Certificates = () => {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      <div className="relative z-10">
        <CertificatesDataProvider>
      {({ 
        normalizedAttempts, 
        highestScores, 
        compositeScore, 
        hasTranscript, 
        isLoading, 
        refetch, 
        handleViewAttempt 
      }) => (
        <CertificatesLayout
          normalizedAttempts={normalizedAttempts}
          highestScores={highestScores}
          compositeScore={compositeScore}
          hasTranscript={hasTranscript}
          isLoading={isLoading}
          onViewAttempt={handleViewAttempt}
          onTestComplete={() => {
            console.log("Test completed, refreshing data...");
            refetch();
            setTimeout(() => refetch(), 500);
            setTimeout(() => refetch(), 1500);
            setTimeout(() => refetch(), 3000);
          }}
        />
      )}
    </CertificatesDataProvider>
      </div>
    </div>
  );
};

export default Certificates;
