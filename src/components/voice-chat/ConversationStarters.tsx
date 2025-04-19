
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";

interface ConversationStartersProps {
  onPhraseClick: (phrase: string) => void;
}

export const ConversationStarters = ({ onPhraseClick }: ConversationStartersProps) => {
  const { t, currentLanguage } = useLocalization();
  
  const getConversationStarters = () => {
    const phraseKeys = ["phrase1", "phrase2", "phrase3", "phrase4", "phrase5", "phrase6", "phrase7", "phrase8"];
    const { practice } = getLanguagePair(currentLanguage);
    
    let nativeLanguagePhrases = phraseKeys.map(key => t(key));
    let targetLanguagePhrases = phraseKeys.map(key => t(key));

    if (currentLanguage === "english") {
      if (practice.toLowerCase() === "french") {
        targetLanguagePhrases = [
          "Bonjour, comment allez-vous aujourd'hui ?",
          "Quel temps fait-il chez vous ?",
          "Pouvez-vous recommander un bon restaurant ?",
          "Quels sont vos passe-temps et centres d'intérêt ?",
          "Parlez-moi de votre livre ou film préféré.",
          "Qu'avez-vous fait le week-end dernier ?",
          "Quels sont vos projets pour demain ?",
          "Comment dit-on... en anglais ?"
        ];
      } else {
        targetLanguagePhrases = [
          "¡Hola! ¿Cómo estás hoy?",
          "¿Qué tiempo hace donde vives?",
          "¿Puedes recomendar un buen restaurante?",
          "¿Cuáles son tus pasatiempos e intereses?",
          "Háblame de tu libro o película favorita.",
          "¿Qué hiciste el fin de semana pasado?",
          "¿Cuáles son tus planes para mañana?",
          "¿Cómo se dice... en inglés?"
        ];
      }
    }
    
    return { nativeLanguagePhrases, targetLanguagePhrases };
  };

  const { nativeLanguagePhrases, targetLanguagePhrases } = getConversationStarters();
  const { practice, native } = getLanguagePair(currentLanguage);

  return (
    <Card className="p-6">
      <h3 className="font-medium mb-4">{t("conversationStarters")}</h3>
      <p className="text-sm text-gray-600 mb-4">
        {t("tryThesePhrases")}
      </p>
      
      <div className="space-y-6">
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {native}:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {nativeLanguagePhrases.map((phrase, index) => (
              <Button 
                key={index}
                variant="outline"
                className="justify-start text-left h-auto py-2 px-3"
                onClick={() => onPhraseClick(phrase)}
              >
                {phrase}
              </Button>
            ))}
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-gray-700">
            {practice}:
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {targetLanguagePhrases.map((phrase, index) => (
              <Button 
                key={index}
                variant="outline"
                className="justify-start text-left h-auto py-2 px-3"
                onClick={() => onPhraseClick(phrase)}
              >
                {phrase}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
