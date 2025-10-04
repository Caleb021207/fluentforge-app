
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const AnalysisCapabilitiesCard: React.FC = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What our AI can analyze:</CardTitle>
      </CardHeader>
      <CardContent>
        <ul className="text-sm space-y-1">
          <li>• Overall scores and CEFR levels</li>
          <li>• Individual skill breakdowns (Reading, Writing, Speaking, Listening)</li>
          <li>• Strengths and areas for improvement</li>
          <li>• Progress tracking over time</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default AnalysisCapabilitiesCard;
