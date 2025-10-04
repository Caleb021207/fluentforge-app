
import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { Link } from "react-router-dom";
import { MessageSquare, Mic, Volume2, Zap } from "lucide-react";
import { Recommendation } from "../types";

interface RecommendationsCardProps {
  recommendations: Recommendation[] | null;
}

const RecommendationsCard: React.FC<RecommendationsCardProps> = ({ recommendations }) => {
  const { t } = useLocalization();

  if (!recommendations || recommendations.length === 0) return null;

  // Group recommendations by practice type
  const grouped = recommendations.reduce((acc, rec) => {
    const type = rec.practice_type;
    if (!acc[type]) acc[type] = [];
    acc[type].push(rec);
    return acc;
  }, {} as Record<string, Recommendation[]>);

  const getPracticeTypeLabel = (type: string) => {
    switch (type) {
      case 'text': return t('textPractice') || 'Práctica de Texto';
      case 'voice': return t('voicePractice') || 'Práctica de Voz';
      case 'pronunciation': return t('pronunciationPractice') || 'Práctica de Pronunciación';
      case 'combined': return t('combinedPractice') || 'Práctica Combinada';
      default: return 'Recomendaciones';
    }
  };

  const getPracticeTypeIcon = (type: string) => {
    switch (type) {
      case 'text': return <MessageSquare className="h-5 w-5" />;
      case 'voice': return <Mic className="h-5 w-5" />;
      case 'pronunciation': return <Volume2 className="h-5 w-5" />;
      case 'combined': return <Zap className="h-5 w-5" />;
      default: return <MessageSquare className="h-5 w-5" />;
    }
  };

  const getCTAText = (route: string) => {
    switch (route) {
      case '/practice': return t('startTextPractice') || 'Abrir Práctica de Texto';
      case '/voice-chat': return t('startVoicePractice') || 'Abrir Práctica de Voz';
      case '/pronunciation-practice': return t('startPronunciationPractice') || 'Abrir Pronunciación';
      default: return t('startPractice') || 'Comenzar';
    }
  };

  const buildDeepLink = (rec: Recommendation) => {
    const params = new URLSearchParams();
    
    if (rec.suggested_params?.level) {
      params.set('level', rec.suggested_params.level);
    }
    if (rec.suggested_params?.topic) {
      params.set('topic', rec.suggested_params.topic);
    }
    if (rec.suggested_params?.focus) {
      params.set('focus', rec.suggested_params.focus);
    }
    
    const queryString = params.toString();
    return queryString ? `${rec.route}?${queryString}` : rec.route;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          {t("aiRecommendations") || "Recomendaciones de IA"}
        </CardTitle>
        <p className="text-sm text-muted-foreground mt-2">
          {t("recommendationsBasedOnYourResults") || "Ejercicios personalizados basados en tu nivel CEFR y áreas de mejora"}
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {Object.entries(grouped).map(([type, recs]) => (
          <div key={type} className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-primary">
              {getPracticeTypeIcon(type)}
              <span>{getPracticeTypeLabel(type)}</span>
            </div>
            
            <div className="space-y-4 pl-7">
              {recs.map((rec, idx) => (
                <Card key={idx} className="border-l-4 border-l-primary/50">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-semibold text-base">{rec.title}</h4>
                      <Badge variant="secondary" className="shrink-0">
                        {rec.suggested_level}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 pb-3">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {rec.recommendation_text}
                    </p>
                    
                    {rec.suggested_focus && rec.suggested_focus.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {rec.suggested_focus.map((focus, i) => (
                          <Badge key={i} variant="outline" className="text-xs">
                            {focus}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                  <CardFooter className="pt-0">
                    <Link to={buildDeepLink(rec)} className="w-full">
                      <Button className="w-full" size="sm">
                        {getCTAText(rec.route)}
                      </Button>
                    </Link>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
};

export default RecommendationsCard;
