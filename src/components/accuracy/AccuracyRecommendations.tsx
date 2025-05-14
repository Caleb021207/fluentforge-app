
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center">
            <Award className="h-4 w-4 mr-2" />
            {t("grammarRecommendations")}
          </CardTitle>
          <CardDescription>
            {t("basedOnYourGrammarScore", { score: String(Math.round(metrics.grammarAccuracy)) })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-4 space-y-2">
            {getGrammarRecommendations(metrics.grammarAccuracy).map((rec, i) => (
              <li key={i} className="text-sm">{rec}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-md flex items-center">
            <BarChart className="h-4 w-4 mr-2" />
            {t("complexityRecommendations")}
          </CardTitle>
          <CardDescription>
            {t("basedOnYourComplexityScore", { score: String(Math.round(metrics.conversationComplexity)) })}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-4 space-y-2">
            {getComplexityRecommendations(metrics.conversationComplexity).map((rec, i) => (
              <li key={i} className="text-sm">{rec}</li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {metrics.vocabularyDiversity !== undefined && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-md flex items-center">
              <Award className="h-4 w-4 mr-2" />
              {t("vocabularyRecommendations")}
            </CardTitle>
            <CardDescription>
              {t("basedOnYourVocabularyScore", { score: String(Math.round(metrics.vocabularyDiversity)) })}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-4 space-y-2">
              {getVocabularyRecommendations(metrics.vocabularyDiversity).map((rec, i) => (
                <li key={i} className="text-sm">{rec}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      <Card className="md:col-span-2 lg:col-span-3">
        <CardHeader className="pb-2">
          <CardTitle className="text-md">{t("generalImprovementTips")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="list-disc pl-4 space-y-2">
            <li className="text-sm">{t("practiceRegularly")}</li>
            <li className="text-sm">{t("engageInDiverseTopics")}</li>
            <li className="text-sm">{t("reviewPastConversations")}</li>
            <li className="text-sm">{t("setSpecificGoals")}</li>
            <li className="text-sm">{t("useVariedPracticeFormats")}</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AccuracyRecommendations;
