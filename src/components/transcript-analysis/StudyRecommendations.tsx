import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Clock, Star, CheckCircle, Book, Sparkles, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

interface Recommendation {
  id: string;
  skill_area: string;
  priority_level: number;
  recommendation_text: string;
  estimated_time_investment: string | null;
  difficulty_level: string | null;
  resources: any;
  status: string;
}

interface StudyRecommendationsProps {
  recommendations: Recommendation[] | undefined;
  analyses?: any[] | undefined;
}

const StudyRecommendations: React.FC<StudyRecommendationsProps> = ({ recommendations, analyses }) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isGenerating, setIsGenerating] = useState(false);

  const getPriorityColor = (level: number) => {
    if (level >= 4) return 'bg-destructive/10 text-destructive dark:bg-destructive/20 dark:text-destructive-foreground';
    if (level >= 3) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
    if (level >= 2) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
  };

  const getPriorityLabel = (level: number) => {
    if (level >= 4) return 'High Priority';
    if (level >= 3) return 'Medium Priority';
    if (level >= 2) return 'Low Priority';
    return 'Optional';
  };

  const getSkillIcon = (skill: string) => {
    switch (skill.toLowerCase()) {
      case 'reading': return '📖';
      case 'writing': return '✍️';
      case 'speaking': return '🗣️';
      case 'listening': return '👂';
      case 'grammar': return '📝';
      case 'vocabulary': return '📚';
      default: return '🎯';
    }
  };

  const getNavigationRoute = (skill: string) => {
    switch (skill.toLowerCase()) {
      case 'speaking':
      case 'listening':
        return '/voice-chat';
      case 'writing':
        return '/practice';
      case 'reading':
        return '/lessons';
      case 'vocabulary':
        return '/vocabulary';
      case 'grammar':
        return '/lessons';
      default:
        return '/practice';
    }
  };

  const getActionButtonText = (skill: string) => {
    switch (skill.toLowerCase()) {
      case 'speaking':
      case 'listening':
        return 'Start Voice Chat';
      case 'writing':
        return 'Practice Writing';
      case 'reading':
        return 'Start Lessons';
      case 'vocabulary':
        return 'Study Vocabulary';
      case 'grammar':
        return 'Practice Grammar';
      default:
        return 'Start Practice';
    }
  };

  const handleNavigateToFeature = (skill: string) => {
    const route = getNavigationRoute(skill);
    navigate(route);
  };

  const handleMarkCompleted = async (recommendationId: string) => {
    try {
      const { error } = await supabase
        .from('study_recommendations')
        .update({ status: 'completed' })
        .eq('id', recommendationId);

      if (error) throw error;

      toast({
        title: "Great job!",
        description: "Recommendation marked as completed.",
      });

      // Refresh the page or update state
      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update recommendation.",
        variant: "destructive",
      });
    }
  };

  const handleGenerateStudyPlan = async () => {
    if (!analyses || analyses.length === 0) {
      toast({
        title: "No Analysis Found",
        description: "Please upload and analyze a transcript first.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const latestAnalysis = analyses[0]; // Use the most recent analysis
      
      const { data, error } = await supabase.functions.invoke('generate-study-recommendations', {
        body: { transcriptId: latestAnalysis.id }
      });

      if (error) throw error;

      toast({
        title: "Study Plan Generated!",
        description: "Your personalized study recommendations are ready.",
      });

      // Refresh the page to show new recommendations
      window.location.reload();
    } catch (error: any) {
      console.error('Error generating study plan:', error);
      toast({
        title: "Generation Failed",
        description: error.message || "Failed to generate study recommendations.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  if (!recommendations || recommendations.length === 0) {
    const hasAnalyses = analyses && analyses.length > 0;
    
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Target className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
          {hasAnalyses ? (
            <div className="space-y-4">
              <p className="text-muted-foreground">Generate a personalized study plan from your transcript analysis.</p>
              <Button 
                onClick={handleGenerateStudyPlan}
                disabled={isGenerating}
                className="bg-primary hover:bg-primary/90"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isGenerating ? 'Generating Study Plan...' : 'Generate Study Plan'}
              </Button>
            </div>
          ) : (
            <p className="text-muted-foreground">Upload and analyze your transcripts to get personalized study recommendations.</p>
          )}
        </CardContent>
      </Card>
    );
  }

  const sortedRecommendations = recommendations.sort((a, b) => b.priority_level - a.priority_level);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Personalized Study Plan
          </CardTitle>
          <CardDescription>
            AI-generated recommendations based on your transcript analysis
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-4">
        {sortedRecommendations.map((recommendation) => (
          <Card key={recommendation.id} className="overflow-hidden">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="text-2xl">{getSkillIcon(recommendation.skill_area)}</div>
                  <div>
                    <CardTitle className="text-lg capitalize">
                      {recommendation.skill_area.replace('_', ' ')} Focus
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge className={getPriorityColor(recommendation.priority_level)}>
                        {getPriorityLabel(recommendation.priority_level)}
                      </Badge>
                      {recommendation.difficulty_level && (
                        <Badge variant="outline">
                          {recommendation.difficulty_level}
                        </Badge>
                      )}
                      {recommendation.estimated_time_investment && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          {recommendation.estimated_time_investment}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => handleMarkCompleted(recommendation.id)}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="h-4 w-4 mr-1" />
                    Complete
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-foreground mb-4">{recommendation.recommendation_text}</p>
              
              <div className="flex flex-col gap-3">
                {recommendation.resources && (
                  <div className="bg-primary/5 border border-primary/10 p-3 rounded-lg">
                    <h4 className="font-medium text-sm mb-2 flex items-center gap-1 text-foreground">
                      <Book className="h-4 w-4" />
                      How to Practice in Our App
                    </h4>
                    <div className="text-sm text-muted-foreground">
                      {typeof recommendation.resources === 'string' 
                        ? recommendation.resources 
                        : JSON.stringify(recommendation.resources)}
                    </div>
                  </div>
                )}
                
                <Button
                  onClick={() => handleNavigateToFeature(recommendation.skill_area)}
                  variant="default"
                  size="sm"
                  className="self-start"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  {getActionButtonText(recommendation.skill_area)}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudyRecommendations;
