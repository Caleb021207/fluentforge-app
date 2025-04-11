
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";

const VoiceChatHeader: React.FC = () => {
  const { currentLanguage, t } = useLocalization();

  const getPracticeDescription = () => {
    if (currentLanguage === "french") {
      return "Pratiquez votre anglais avec notre chat vocal. Cliquez sur le bouton du microphone et commencez à parler en anglais. L'IA vous répondra en anglais et vous aidera à vous entraîner.";
    } else {
      return `Practice your English speaking skills with our voice chat. Click the microphone button and start speaking in English. The AI will respond to you in English and help you practice.`;
    }
  };

  const getBrowserTTSNote = () => {
    if (currentLanguage === "english") {
      return "Note: This uses browser-based text-to-speech. For premium voice quality with ElevenLabs, try our Premium Voice Chat.";
    } else if (currentLanguage === "french") {
      return "Remarque : Ce système utilise la synthèse vocale basée sur le navigateur. Pour une qualité vocale premium avec ElevenLabs, essayez notre Chat Vocal Premium.";
    } else {
      return t("browserBasedTTS") || "Note: This uses browser-based text-to-speech.";
    }
  };

  const getAIModelInfoText = () => {
    if (currentLanguage === "english") {
      return "We're using OpenAI's GPT-4o-mini for natural language understanding and generation, with browser's built-in Speech Synthesis for voice responses.";
    } else if (currentLanguage === "french") {
      return "Nous utilisons GPT-4o-mini d'OpenAI pour la compréhension et la génération du langage naturel, avec la synthèse vocale intégrée au navigateur pour les réponses vocales.";
    } else {
      return t("aiModelInfo") || "Using OpenAI's GPT-4o-mini with browser's built-in Speech Synthesis.";
    }
  };

  const getAIModelLabelText = () => {
    if (currentLanguage === "english") {
      return "AI Model:";
    } else if (currentLanguage === "french") {
      return "Modèle d'IA :";
    } else {
      return "AI Model:";
    }
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        {currentLanguage === "french" ? "Pratique vocale gratuite" : t("unlimitedVoicePractice")}
      </h1>
      <p className="text-gray-600 mb-4">
        {getPracticeDescription()}
      </p>
      <p className="text-sm text-gray-500 mb-2">
        <strong>{getAIModelLabelText()}</strong> {getAIModelInfoText()}
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-amber-800 text-sm">
          {getBrowserTTSNote()}
        </p>
      </div>
    </div>
  );
};

export default VoiceChatHeader;
