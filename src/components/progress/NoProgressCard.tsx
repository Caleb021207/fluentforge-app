
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const NoProgressCard = () => {
  const navigate = useNavigate();
  
  return (
    <Card className="border border-dashed border-gray-300 bg-gray-50">
      <CardContent className="text-center py-12">
        <p className="text-lg text-gray-600 mb-4">Complete certification tests to see your progress!</p>
        <Button onClick={() => navigate('/certificates')} className="bg-lingua-primary">
          Take a Certification Test
        </Button>
      </CardContent>
    </Card>
  );
};

export default NoProgressCard;
