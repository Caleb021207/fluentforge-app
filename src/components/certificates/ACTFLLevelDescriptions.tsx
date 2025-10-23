
import React from "react";
import { rubricData } from "./ACTFLLevelRubric";
import { useLocalization } from "@/context/LocalizationContext";

const ACTFLLevelDescriptions = () => {
  const { currentLanguage } = useLocalization();
  
  const getACTFLDescription = (level: string) => {
    switch (level) {
      case 'Distinguished':
        return 'Can tailor language to a variety of audiences by adapting speech and register in ways that are culturally authentic. Can use language skillfully, with accuracy, efficiency, and effectiveness.';
      case 'Superior':
        return 'Can communicate with accuracy and fluency in order to participate fully and effectively in conversations on a variety of topics in formal and informal settings.';
      case 'Advanced High':
        return 'Can narrate and describe with great ease and in detail across major time frames. Can handle linguistically unfamiliar situations with confidence.';
      case 'Advanced Mid':
        return 'Can handle a variety of communicative tasks with ease, confidence, and competence. Can narrate and describe in major time frames with good control.';
      case 'Advanced Low':
        return 'Can narrate and describe in major time frames with good control. Can handle a variety of communicative tasks, though there may be occasional difficulty.';
      case 'Intermediate High':
        return 'Can handle a variety of communicative tasks, although there may be some hesitation and inaccuracy. Can narrate and describe with some detail.';
      case 'Intermediate Mid':
        return 'Can handle successfully a variety of uncomplicated communicative tasks in straightforward social situations.';
      case 'Intermediate Low':
        return 'Can handle a limited number of uncomplicated communicative tasks involving topics related to basic personal information.';
      case 'Novice High':
        return 'Can handle a variety of tasks pertaining to the Intermediate level, but cannot sustain performance at that level.';
      case 'Novice Mid':
        return 'Can communicate minimally with learned material. Can produce lists and memorized phrases.';
      case 'Novice Low':
        return 'Can communicate using isolated words and high-frequency phrases. Has limited ability to create with the language.';
      default:
        return '';
    }
  };
  
  const getLocalizedTitle = () => {
    switch(currentLanguage) {
      case "spanish":
        return "Descripciones de Niveles ACTFL";
      case "portuguese":
        return "Descrições de Níveis ACTFL";
      default:
        return "ACTFL Level Descriptions";
    }
  };
  
  return (
    <div className="mt-6 space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">
        {getLocalizedTitle()}
      </h3>
      <div className="grid gap-4">
        {rubricData.map((item) => (
          <div key={item.level} className="p-4 bg-white rounded border">
            <h4 className="font-medium mb-2">
              {item.level}
            </h4>
            <p className="text-sm text-gray-600">
              {getACTFLDescription(item.level)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ACTFLLevelDescriptions;
