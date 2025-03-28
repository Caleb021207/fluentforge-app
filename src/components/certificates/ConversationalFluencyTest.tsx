
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { useConversationTest } from "./hooks/useConversationTest";
import TestStartPrompt from "./fluency/TestStartPrompt";
import ActiveTest from "./fluency/ActiveTest";
import TestResults from "./fluency/TestResults";
import { useLocalization } from "@/context/LocalizationContext";

interface ConversationalFluencyTestProps {
  onTestComplete?: () => void;
}

const ConversationalFluencyTest = ({ onTestComplete }: ConversationalFluencyTestProps) => {
  const { t, currentLanguage } = useLocalization();
  
  const {
    isStarted,
    isComplete,
    timeRemaining,
    isLoggedIn,
    microphoneAccess,
    testResult,
    isLoading,
    conversation,
    startTest,
    endTest,
    resetTest,
    conversationTranscript
  } = useConversationTest(onTestComplete);

  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">{t("conversationalFluency")}</CardTitle>
        <MessageSquare className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            {currentLanguage === "spanish"
              ? "La Prueba de Fluidez Conversacional evalúa tu capacidad para entender y responder al idioma hablado en conversaciones en tiempo real. Esta prueba evalúa tanto tus habilidades de expresión oral como tu comprensión auditiva."
              : "The Conversational Fluency Test evaluates your ability to understand and respond to spoken Spanish in real-time conversations. This test assesses both your speaking skills and your listening comprehension."}
          </p>
          
          {isComplete ? (
            <TestResults testResult={testResult} onReset={resetTest} />
          ) : isStarted ? (
            <ActiveTest 
              timeRemaining={timeRemaining}
              conversationStatus={conversation.status}
              onEndEarly={endTest}
            />
          ) : (
            <TestStartPrompt
              isLoading={isLoading}
              isLoggedIn={isLoggedIn}
              microphoneAccess={microphoneAccess}
              onStart={startTest}
            />
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationalFluencyTest;
