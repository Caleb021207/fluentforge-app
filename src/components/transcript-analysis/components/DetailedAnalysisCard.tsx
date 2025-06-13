
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface DetailedAnalysisCardProps {
  feedback: string;
}

const DetailedAnalysisCard: React.FC<DetailedAnalysisCardProps> = ({ feedback }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Analysis</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-foreground leading-relaxed">
          {feedback}
        </p>
      </CardContent>
    </Card>
  );
};

export default DetailedAnalysisCard;
