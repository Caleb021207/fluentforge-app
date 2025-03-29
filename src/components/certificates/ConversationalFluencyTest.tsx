
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";

interface LanguagePair {
  sourceLanguage: string;
  targetLanguage: string;
}

interface ConversationalFluencyProps {
  onTestComplete: () => void;
  languagePair?: LanguagePair | null;
}

const ConversationalFluency = ({ onTestComplete, languagePair }: ConversationalFluencyProps) => {
  const navigate = useNavigate();
  const { t, currentLanguage } = useLocalization();

  const getLocalizedDescription = () => {
    let baseDescription = '';
    
    switch(currentLanguage) {
      case "spanish":
        baseDescription = "La Prueba de Fluidez Conversacional evalúa tu capacidad para entender y comunicarte en conversaciones en tiempo real. Esta prueba evalúa tu comprensión auditiva, expresión oral y habilidades generales de comunicación.";
        break;
      case "portuguese":
        baseDescription = "O Teste de Fluência Conversacional avalia sua capacidade de entender e se comunicar em conversas em tempo real. Este teste avalia sua compreensão auditiva, expressão oral e habilidades gerais de comunicação.";
        break;
      default:
        baseDescription = "The Conversational Fluency Test evaluates your ability to understand and communicate in real-time conversations. This test assesses your listening comprehension, speaking expression, and overall communication skills.";
    }
    
    // If we have a selected language pair, customize the description
    if (languagePair) {
      const sourceLanguage = getLanguageName(languagePair.sourceLanguage);
      const targetLanguage = getLanguageName(languagePair.targetLanguage);
      
      // Add language pair specific information to the description
      if (currentLanguage === "spanish") {
        return `${baseDescription} Esta prueba evaluará tu habilidad para comunicarte desde ${sourceLanguage} hacia ${targetLanguage}.`;
      } else if (currentLanguage === "portuguese") {
        return `${baseDescription} Este teste avaliará sua capacidade de se comunicar de ${sourceLanguage} para ${targetLanguage}.`;
      } else {
        return `${baseDescription} This test will evaluate your ability to communicate from ${sourceLanguage} to ${targetLanguage}.`;
      }
    }
    
    return baseDescription;
  };

  const getLanguageName = (code: string): string => {
    switch(code) {
      case 'english': 
        return currentLanguage === "spanish" ? "Inglés" : 
               currentLanguage === "portuguese" ? "Inglês" : "English";
      case 'spanish': 
        return currentLanguage === "spanish" ? "Español" : 
               currentLanguage === "portuguese" ? "Espanhol" : "Spanish";
      case 'portuguese': 
        return currentLanguage === "spanish" ? "Portugués" : 
               currentLanguage === "portuguese" ? "Português" : "Portuguese";
      default: 
        return code.charAt(0).toUpperCase() + code.slice(1);
    }
  };

  const handleStartTest = () => {
    // We'll pass the language pair information to the test page
    navigate('/certificates/conversation', { 
      state: { 
        languagePair,
        onTestComplete 
      } 
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{t("conversationalFluency")}</CardTitle>
        <MessageCircle className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            {getLocalizedDescription()}
          </p>
          <Button 
            onClick={handleStartTest}
            className="w-full md:w-auto"
          >
            {t("startTest")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationalFluency;
