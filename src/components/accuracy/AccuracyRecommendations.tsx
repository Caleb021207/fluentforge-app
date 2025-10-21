
import React from 'react';
import { InteractiveCard } from '@/components/ui/card';
import { LanguageMetrics } from '@/types/chat';
import { useLocalization } from '@/context/LocalizationContext';
import { Award, BarChart } from 'lucide-react';

interface AccuracyRecommendationsProps {
  metrics: LanguageMetrics;
}

const AccuracyRecommendations: React.FC<AccuracyRecommendationsProps> = ({ metrics }) => {
  const { t } = useLocalization();
  
  const getGrammarRecommendations = (score: number) => {
    if (score < 40) {
      return [
        t("practiceBasisGrammarStructures"),
        t("focusOnSimpleSentences"),
        t("reviewBasicConjugations")
      ];
    } else if (score < 70) {
      return [
        t("practiceIntermediateGrammar"),
        t("workOnSentenceVariety"),
        t("practiceCorrectWordOrder")
      ];
    } else {
      return [
        t("focusOnAdvancedGrammar"),
        t("practiceComplexSentenceStructures"),
        t("workOnSubtleGrammaticalNuances")
      ];
    }
  };
  
  const getComplexityRecommendations = (score: number) => {
    if (score < 40) {
      return [
        t("expandYourVocabulary"),
        t("practiceBasicDialogues"),
        t("trySimpleTopics")
      ];
    } else if (score < 70) {
      return [
        t("engageInMoreDetailedTopics"),
        t("practiceExplainingConcepts"),
        t("tryDebatingSimpleTopics")
      ];
    } else {
      return [
        t("engageInAbstractDiscussions"),
        t("practiceArgumentativeDialogues"),
        t("tryMediumSpecificVocabulary")
      ];
    }
  };
  
  const getVocabularyRecommendations = (score: number) => {
    if (!score && score !== 0) return [];
    
    if (score < 40) {
      return [
        t("learnBasicVocabulary"),
        t("useFlashcardsRegularly"),
        t("practiceEverydayWords")
      ];
    } else if (score < 70) {
      return [
        t("expandTopicalVocabulary"),
        t("learnSynonymsAndAntonyms"),
        t("incorporateIdiomsAndPhrases")
      ];
    } else {
      return [
        t("focusOnSpecializedVocabulary"),
        t("learnNuancedExpressions"),
        t("practiceRareAndAcademicWords")
      ];
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
      <InteractiveCard>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <Award className="h-4 w-4 text-primary" />
            <h4 className="text-md font-semibold">{t("grammarRecommendations")}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t("basedOnYourGrammarScore", { score: String(Math.round(metrics.grammarAccuracy)) })}
          </p>
          <ul className="list-disc pl-4 space-y-2">
            {getGrammarRecommendations(metrics.grammarAccuracy).map((rec, i) => (
              <li key={i} className="text-sm">{rec}</li>
            ))}
          </ul>
        </div>
      </InteractiveCard>

      <InteractiveCard>
        <div className="p-6">
          <div className="flex items-center gap-2 mb-2">
            <BarChart className="h-4 w-4 text-primary" />
            <h4 className="text-md font-semibold">{t("complexityRecommendations")}</h4>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {t("basedOnYourComplexityScore", { score: String(Math.round(metrics.conversationComplexity)) })}
          </p>
          <ul className="list-disc pl-4 space-y-2">
            {getComplexityRecommendations(metrics.conversationComplexity).map((rec, i) => (
              <li key={i} className="text-sm">{rec}</li>
            ))}
          </ul>
        </div>
      </InteractiveCard>

      {metrics.vocabularyDiversity !== undefined && (
        <InteractiveCard>
          <div className="p-6">
            <div className="flex items-center gap-2 mb-2">
              <Award className="h-4 w-4 text-primary" />
              <h4 className="text-md font-semibold">{t("vocabularyRecommendations")}</h4>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {t("basedOnYourVocabularyScore", { score: String(Math.round(metrics.vocabularyDiversity)) })}
            </p>
            <ul className="list-disc pl-4 space-y-2">
              {getVocabularyRecommendations(metrics.vocabularyDiversity).map((rec, i) => (
                <li key={i} className="text-sm">{rec}</li>
              ))}
            </ul>
          </div>
        </InteractiveCard>
      )}

      <InteractiveCard className="md:col-span-2">
        <div className="p-6">
          <h4 className="text-md font-semibold mb-4">{t("generalImprovementTips")}</h4>
          <ul className="list-disc pl-4 space-y-2">
            <li className="text-sm">{t("practiceRegularly")}</li>
            <li className="text-sm">{t("engageInDiverseTopics")}</li>
            <li className="text-sm">{t("reviewPastConversations")}</li>
            <li className="text-sm">{t("setSpecificGoals")}</li>
            <li className="text-sm">{t("useVariedPracticeFormats")}</li>
          </ul>
        </div>
      </InteractiveCard>
    </div>
  );
};

export default AccuracyRecommendations;
