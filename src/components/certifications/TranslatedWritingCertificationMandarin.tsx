
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";

const TranslatedWritingCertificationMandarin = () => {
  const navigate = useNavigate();
  const { t } = useLocalization();

  // Mandarin-specific description
  const mandarinDescription = "写作测试评估您以清晰、准确和流利的方式书面表达自己的能力。该测试评估您对语法、词汇和句子结构的掌握。";

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{t("writingTest")}</CardTitle>
        <FileText className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            {mandarinDescription}
          </p>
          <Button 
            onClick={() => navigate('/certificates/writing')}
            className="w-full md:w-auto"
          >
            {t("startTest")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TranslatedWritingCertificationMandarin;
