
import CertificatesDataProvider from "@/components/certificates/CertificatesDataProvider";
import CertificatesLayout from "@/components/certificates/CertificatesLayout";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Certificates = () => {
  const { toast } = useToast();

  // Update existing certification attempts to add language info if missing
  useEffect(() => {
    const updateLegacyAttempts = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Find attempts that don't have language pair info
        const { data: attempts, error } = await supabase
          .from('certification_attempts')
          .select('*')
          .eq('user_id', user.id)
          .or('source_language.is.null,target_language.is.null');
        
        if (error) {
          console.error("Error fetching incomplete attempts:", error);
          return;
        }
        
        // If we have attempts without language info, update them to English->Spanish
        if (attempts && attempts.length > 0) {
          console.log(`Found ${attempts.length} attempts without language pair info`);
          
          for (const attempt of attempts) {
            const { error: updateError } = await supabase
              .from('certification_attempts')
              .update({
                source_language: 'english',
                target_language: 'spanish'
              } as any) // Using type assertion to allow these properties
              .eq('id', attempt.id);
              
            if (updateError) {
              console.error(`Error updating attempt ${attempt.id}:`, updateError);
            }
          }
          
          toast({
            title: "Legacy data updated",
            description: "Your previous certification attempts have been categorized as English to Spanish",
          });
        }
      } catch (error) {
        console.error("Error updating legacy attempts:", error);
      }
    };
    
    updateLegacyAttempts();
  }, [toast]);

  return (
    <CertificatesDataProvider>
      {({ 
        normalizedAttempts, 
        highestScores, 
        compositeScore, 
        hasTranscript, 
        isLoading, 
        languagePairs,
        selectedPair,
        onSelectLanguagePair,
        refetch, 
        handleViewAttempt 
      }) => (
        <CertificatesLayout
          normalizedAttempts={normalizedAttempts}
          highestScores={highestScores}
          compositeScore={compositeScore}
          hasTranscript={hasTranscript}
          isLoading={isLoading}
          languagePairs={languagePairs}
          selectedPair={selectedPair}
          onSelectLanguagePair={onSelectLanguagePair}
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
