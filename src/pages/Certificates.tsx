
import CertificatesDataProvider from "@/components/certificates/CertificatesDataProvider";
import CertificatesLayout from "@/components/certificates/CertificatesLayout";

const Certificates = () => {
  return (
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
  );
};

export default Certificates;
