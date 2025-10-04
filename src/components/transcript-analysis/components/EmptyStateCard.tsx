
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";

const EmptyStateCard: React.FC = () => {
  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">No analyses yet</h3>
        <p className="text-muted-foreground">Upload a transcript to get started with AI analysis.</p>
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;
