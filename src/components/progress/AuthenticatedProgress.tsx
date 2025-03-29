
import React from "react";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import ProgressPageHeader from "./ProgressPageHeader";
import ErrorDisplay from "./ErrorDisplay";
import DataFixPrompt from "./DataFixPrompt";
import LanguagePairSelector from "./LanguagePairSelector";
import ProgressContent from "./ProgressContent";
import { useProgressData } from "./hooks/useProgressData";

interface AuthenticatedProgressProps {
  user: User;
}

const AuthenticatedProgress = ({ user }: AuthenticatedProgressProps) => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const {
    progressData,
    recommendations,
    isRefreshing,
    normalizedAttempts,
    hasTranscript,
    fetchError,
    languagePairs,
    selectedPairKey,
    showFixButton,
    handleLanguagePairChange,
    fixCertificationLanguages,
  } = useProgressData(user);

  const handleViewAttempt = async (attemptId: string) => {
    console.log("View attempt:", attemptId);
    toast({
      title: t("viewingDetails"),
      description: t("featureComingSoon"),
    });
  };

  return (
    <div className="space-y-6">
      <ProgressPageHeader />
      
      <ErrorDisplay error={fetchError} />

      <DataFixPrompt 
        show={showFixButton} 
        isFixing={isRefreshing} 
        onFix={fixCertificationLanguages} 
      />

      <LanguagePairSelector 
        languagePairs={languagePairs} 
        selectedPairKey={selectedPairKey} 
        onPairChange={handleLanguagePairChange} 
      />

      <ProgressContent 
        progressData={progressData}
        recommendations={recommendations}
        normalizedAttempts={normalizedAttempts}
        hasTranscript={hasTranscript}
        onViewAttempt={handleViewAttempt}
      />
    </div>
  );
};

export default AuthenticatedProgress;
