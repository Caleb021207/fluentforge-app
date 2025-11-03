
import React from "react";
import { Analysis } from "./types";
import LoadingStateCard from "./components/LoadingStateCard";
import EmptyStateCard from "./components/EmptyStateCard";
import LatestAnalysisCard from "./components/LatestAnalysisCard";
import AnalysisCapabilitiesCard from "./components/AnalysisCapabilitiesCard";
import DetailedAnalysisCard from "./components/DetailedAnalysisCard";
import AnalysisBreakdownCard from "./components/AnalysisBreakdownCard";
import RecommendationsCard from "./components/RecommendationsCard";
import AnalysisHistoryCard from "./components/AnalysisHistoryCard";
import CEFRComparisonCard from "./components/CEFRComparisonCard";
import LearningPathwayCard from "./components/LearningPathwayCard";

interface AnalysisResultsProps {
  analyses: Analysis[] | undefined;
  isLoading: boolean;
}

const AnalysisResults: React.FC<AnalysisResultsProps> = ({ analyses, isLoading }) => {
  if (isLoading) {
    return <LoadingStateCard />;
  }

  if (!analyses || analyses.length === 0) {
    return <EmptyStateCard />;
  }

  const latestAnalysis = analyses[0];

  return (
    <div className="space-y-6">
      {/* Latest Analysis Summary */}
      <LatestAnalysisCard analysis={latestAnalysis} />

      {/* What our AI can analyze */}
      <AnalysisCapabilitiesCard />

      {/* CEFR Comparison - New comprehensive section */}
      {latestAnalysis.cefr_comparison && (
        <CEFRComparisonCard cefrComparison={latestAnalysis.cefr_comparison} />
      )}

      {/* Detailed Analysis - Enhanced with comprehensive breakdown */}
      {latestAnalysis.detailed_feedback && (
        <DetailedAnalysisCard 
          feedback={latestAnalysis.detailed_feedback}
          detailedAnalysis={latestAnalysis.detailed_analysis}
        />
      )}

      {/* Learning Pathway - New comprehensive section */}
      {(latestAnalysis.learning_pathway || latestAnalysis.progress_indicators) && (
        <LearningPathwayCard 
          learningPathway={latestAnalysis.learning_pathway}
          progressIndicators={latestAnalysis.progress_indicators}
        />
      )}

      {/* Strengths and Weaknesses - Legacy fallback */}
      {!latestAnalysis.detailed_analysis && (latestAnalysis.strengths || latestAnalysis.weaknesses) && (
        <AnalysisBreakdownCard 
          strengths={latestAnalysis.strengths} 
          weaknesses={latestAnalysis.weaknesses} 
        />
      )}

      {/* Recommendations - Legacy fallback */}
      {!latestAnalysis.learning_pathway && latestAnalysis.recommendations && (
        <RecommendationsCard 
          recommendations={latestAnalysis.recommendations}
          weaknesses={latestAnalysis.weaknesses}
        />
      )}

      {/* All Analyses History */}
      {analyses.length > 1 && (
        <AnalysisHistoryCard analyses={analyses} />
      )}
    </div>
  );
};

export default AnalysisResults;
