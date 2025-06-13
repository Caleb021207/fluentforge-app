
import React from "react";
import { Card, CardContent } from "@/components/ui/card";

const LoadingStateCard: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-muted rounded w-3/4 mx-auto"></div>
          <div className="h-4 bg-muted rounded w-1/2 mx-auto"></div>
        </div>
        <p className="text-muted-foreground mt-4">Loading your analysis results...</p>
      </CardContent>
    </Card>
  );
};

export default LoadingStateCard;
