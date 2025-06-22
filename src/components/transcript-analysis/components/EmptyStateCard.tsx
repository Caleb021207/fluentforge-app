
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const EmptyStateCard: React.FC = () => {
  const { t } = useLocalization();

  return (
    <Card>
      <CardContent className="pt-6 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">{t("noAnalysesYet") || "No analyses yet"}</h3>
        <p className="text-muted-foreground">{t("uploadTranscriptToGetStarted") || "Upload a transcript to get started with AI analysis."}</p>
      </CardContent>
    </Card>
  );
};

export default EmptyStateCard;
