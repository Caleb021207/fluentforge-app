
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";

const NoProgressCard = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  
  return (
    <Card className="border border-dashed border-gray-300 dark:border-gray-700/50 bg-lingua-accent/10 dark:bg-gray-900/50 transition-all duration-300">
      <CardContent className="text-center py-12">
        <p className="text-lg text-lingua-secondary dark:text-gray-300 mb-5 transition-colors duration-200">
          {t("noProgressData")}
        </p>
        <Button 
          onClick={() => navigate('/certificates')} 
          className="bg-lingua-accent hover:bg-lingua-accent-hover text-lingua-primary font-medium shadow-sm hover:shadow transition-all duration-200
                   dark:bg-lingua-blue-primary dark:hover:bg-lingua-blue-dark dark:text-white"
        >
          {t("completeTestsToSeeProgress")}
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoProgressCard;
