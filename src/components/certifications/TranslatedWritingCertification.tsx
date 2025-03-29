
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";

const TranslatedWritingCertification = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLocalization();

  // Function to get localized description and adjust for target language
  const getLocalizedDescription = () => {
    // Base descriptions translated to the user's interface language
    let baseDescription = '';
    
    switch(currentLanguage) {
      case "spanish":
        baseDescription = "La Prueba de Escritura evalúa tu capacidad para expresarte por escrito con claridad, precisión y fluidez. Esta prueba evalúa tu dominio de la gramática, vocabulario y estructura de oraciones.";
        break;
      case "portuguese":
        baseDescription = "O Teste de Escrita avalia sua capacidade de se expressar por escrito com clareza, precisão e fluência. Este teste avalia seu domínio de gramática, vocabulário e estrutura de frases.";
        break;
      default:
        baseDescription = "The Writing Test evaluates your ability to express yourself in writing with clarity, accuracy, and fluency. This test assesses your grasp of grammar, vocabulary, and sentence structure.";
    }
    
    return baseDescription;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{t("writingTest")}</CardTitle>
        <FileText className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            {getLocalizedDescription()}
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

export default TranslatedWritingCertification;
