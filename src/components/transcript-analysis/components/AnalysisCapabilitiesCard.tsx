
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AnalysisCapabilitiesCard: React.FC = () => {
  return (
    <Card className="bg-background dark:bg-card border border-border">
      <CardHeader>
        <CardTitle className="text-foreground dark:text-card-foreground">What our AI can analyze:</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="space-y-2 text-foreground dark:text-card-foreground">
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
