import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Target, Clock, Star, CheckCircle, Book } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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
}

const StudyRecommendations: React.FC<StudyRecommendationsProps> = ({ recommendations }) => {
  const { toast } = useToast();

  const getPriorityColor = (level: number) => {
    if (level >= 4) return 'bg-red-100 text-red-800';
    if (level >= 3) return 'bg-orange-100 text-orange-800';
    if (level >= 2) return 'bg-yellow-100 text-yellow-800';
    return 'bg-green-100 text-green-800';
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

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium mb-2">No recommendations yet</h3>
          <p className="text-gray-500">Upload and analyze your transcripts to get personalized study recommendations.</p>
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
                        <div className="flex items-center gap-1 text-sm text-gray-600">
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
              <p className="text-gray-700 mb-4">{recommendation.recommendation_text}</p>
              
              {recommendation.resources && (
                <div className="bg-blue-50 p-3 rounded-lg">
                  <h4 className="font-medium text-sm mb-2 flex items-center gap-1">
                    <Book className="h-4 w-4" />
                    Recommended Resources
                  </h4>
                  <div className="text-sm text-gray-600">
                    {typeof recommendation.resources === 'string' 
                      ? recommendation.resources 
                      : JSON.stringify(recommendation.resources)}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StudyRecommendations;
