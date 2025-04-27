
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";

const NoProgressCard = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  
  return (
    <Card className="border border-dashed border-gray-300 bg-gray-50">
      <CardContent className="text-center py-12">
        <p className="text-lg text-gray-600 mb-4">{t("noProgressData")}</p>
        <Button 
          onClick={() => navigate('/certificates')} 
          className="bg-lingua-primary hover:bg-lingua-primary/90"
        >
          {t("completeTestsToSeeProgress")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoProgressCard;
