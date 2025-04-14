
import React from "react";
import { Info, AlertCircle } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const TestInstructions = () => {
  const { currentLanguage, t } = useLocalization();
  
  // Determine the target language based on user's native language
  const getInstructions = () => {
    if (currentLanguage === "spanish" || currentLanguage === "portuguese" || 
        currentLanguage === "korean" || currentLanguage === "indonesian") {
      // For Spanish/Portuguese/Korean/Indonesian speakers learning English
      return (
        <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc">
          <li>{t("speakNaturallyInEnglish") || "Speak naturally in English at your current level of comfort—don't worry about perfect grammar."}</li>
          <li>{t("answerTutorQuestions") || "Answer the tutor's questions as completely as you can, using full sentences when possible."}</li>
          <li>{t("keepConversationFlowing") || "Try to keep the conversation flowing by asking follow-up questions or adding additional details to your answers."}</li>
          <li>{t("listenCarefully") || "Listen carefully to understand questions and instructions—it's okay to ask for clarification if needed."}</li>
          <li>{t("dontWorryAboutMistakes") || "Don't worry about mistakes—this test is to measure your current level, not to judge your abilities."}</li>
          <li>{t("tryToUseVariedVocabulary") || "Try to use varied vocabulary and sentence structures if possible, but stay within your comfort zone."}</li>
          <li>{t("expressYourThoughtsInDetail") || "Express your thoughts in detail when answering open questions to demonstrate your language range."}</li>
        </ul>
      );
    } else {
      // For English speakers learning Spanish/Portuguese/Korean/Indonesian
      return (
        <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc">
          <li>{t("speakNaturallyInTargetLanguage") || "Speak naturally in your target language at your current level—use simple sentences if you're a beginner."}</li>
          <li>{t("answerTutorQuestions") || "Answer the tutor's questions as completely as you can with the vocabulary you know."}</li>
          <li>{t("keepConversationFlowing") || "Try to keep the conversation flowing with simple follow-up questions or comments."}</li>
          <li>{t("listenCarefully") || "Listen carefully to understand questions and instructions—the tutor will adjust to your level."}</li>
          <li>{t("dontWorryAboutMistakes") || "Don't worry about making mistakes—they are an essential part of the learning process."}</li>
          <li>{t("tryToUseVariedVocabulary") || "Try to use vocabulary and grammar you've learned so far, even if it feels challenging."}</li>
          <li>{t("expressYourThoughtsInDetail") || "Take your time and express your thoughts as clearly as possible—pausing to think is perfectly fine."}</li>
        </ul>
      );
    }
  };

  const getTestFormat = () => {
    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium flex items-center">
          <AlertCircle className="h-4 w-4 text-amber-500 mr-2" />
          {t("testFormat") || "Test Format"}
        </h4>
        <ul className="text-sm text-gray-600 space-y-1 pl-6 list-disc mt-1">
          <li>{t("testFormatPoint1") || "The test lasts approximately 10-15 minutes and adapts to your speaking ability."}</li>
          <li>{t("testFormatPoint2") || "You'll discuss everyday topics such as hobbies, travel, food, family, or work."}</li>
          <li>{t("testFormatPoint3") || "The AI will assess your fluency, vocabulary range, grammatical accuracy, and listening comprehension."}</li>
          <li>{t("testFormatPoint4") || "You'll receive a detailed assessment with personalized improvement suggestions when completed."}</li>
        </ul>
      </div>
    );
  };

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <Info className="h-4 w-4 text-blue-500 mr-2" />
        <h3 className="text-sm font-medium">{t("testInstructions") || "Test Instructions"}</h3>
      </div>
      {getInstructions()}
      {getTestFormat()}
    </div>
  );
};

export default TestInstructions;
