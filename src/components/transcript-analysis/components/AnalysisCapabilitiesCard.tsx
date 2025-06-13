
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, TrendingUp } from "lucide-react";

const AnalysisCapabilitiesCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="!text-foreground">What our AI can analyze:</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 !text-foreground">
          <li>• Overall scores and CEFR levels</li>
          <li>• Individual skill breakdowns (Reading, Writing, Speaking, Listening)</li>
          <li>• Strengths and areas for improvement</li>
          <li>• Personalized study recommendations</li>
          <li>• Progress tracking over time</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default AnalysisCapabilitiesCard;
