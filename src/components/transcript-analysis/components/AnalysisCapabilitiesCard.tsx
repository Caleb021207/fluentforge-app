
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-primary" />
              Strengths
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Pronunciation</li>
              <li>• Oral Communication</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-3 text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              Areas for Improvement
            </h4>
            <ul className="space-y-2 text-muted-foreground">
              <li>• Reading Comprehension</li>
              <li>• Listening Comprehension</li>
              <li>• Written Expression</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AnalysisCapabilitiesCard;
