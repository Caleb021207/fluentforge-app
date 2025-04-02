
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";

const TranslatedReadingCertificationMandarin = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();

  // Mandarin-specific description
  const mandarinDescription = "阅读测试通过文本段落和理解问题评估您的阅读理解能力。该测试评估您理解书面文本、识别主要思想和进行推理的能力。";

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{t("readingTest")}</CardTitle>
        <BookOpen className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            {mandarinDescription}
          </p>
          <Button 
            onClick={() => navigate('/certificates/reading')}
            className="w-full md:w-auto"
          >
            {t("startTest")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranslatedReadingCertificationMandarin;
