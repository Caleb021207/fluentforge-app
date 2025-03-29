
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";

const TranslatedReadingCertification = () => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLocalization();

  // Function to get localized description and adjust for target language
  const getLocalizedDescription = () => {
    // Base descriptions translated to the user's interface language
    let baseDescription = '';
    
    switch(currentLanguage) {
      case "spanish":
        baseDescription = "La Prueba de Lectura evalúa tu comprensión lectora a través de pasajes de texto y preguntas de comprensión. Esta prueba evalúa tu capacidad para entender textos escritos, identificar ideas principales y hacer inferencias.";
        break;
      case "portuguese":
        baseDescription = "O Teste de Leitura avalia sua compreensão de leitura através de passagens de texto e perguntas de compreensão. Este teste avalia sua capacidade de entender textos escritos, identificar ideias principais e fazer inferências.";
        break;
      default:
        baseDescription = "The Reading Test evaluates your reading comprehension through text passages and comprehension questions. This test assesses your ability to understand written texts, identify main ideas, and make inferences.";
    }
    
    return baseDescription;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{t("readingTest")}</CardTitle>
        <BookOpen className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            {getLocalizedDescription()}
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

export default TranslatedReadingCertification;
