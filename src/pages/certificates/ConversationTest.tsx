
import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useConversationTest, formatTime } from "@/components/certificates/hooks/useConversationTest";
import TestStartPrompt from "@/components/certificates/fluency/TestStartPrompt";
import ActiveTest from "@/components/certificates/fluency/ActiveTest";
import TestResults from "@/components/certificates/fluency/TestResults";
import TestInstructions from "@/components/certificates/fluency/TestInstructions";

interface LanguagePair {
  sourceLanguage: string;
  targetLanguage: string;
}

interface LocationState {
  onTestComplete?: () => void;
  languagePair?: LanguagePair;
}

const ConversationTest = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  
  // Extract language pair information from navigation state
  const languagePair = state?.languagePair;
  
  console.log("ConversationTest page loaded with language pair:", languagePair);
  
  const {
    isStarted,
    isComplete,
    timeRemaining,
    testResult,
    isLoading,
    conversation,
    startTest,
    endTest,
    resetTest,
    conversationTranscript
  } = useConversationTest(state?.onTestComplete, languagePair);

  const handleBackToOverview = () => {
    navigate('/certificates');
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-900">
        Conversational Fluency Test {languagePair && `(${languagePair.sourceLanguage} → ${languagePair.targetLanguage})`}
      </h1>
      
      <Card>
        {!isStarted && !isComplete && (
          <TestStartPrompt onStart={startTest} languagePair={languagePair} />
        )}
        
        {isStarted && !isComplete && (
          <ActiveTest 
            timeRemaining={formatTime(timeRemaining)}
            onEnd={endTest}
            conversation={conversation}
            conversationTranscript={conversationTranscript}
            languagePair={languagePair}
          />
        )}
        
        {isComplete && testResult && (
          <TestResults 
            result={testResult}
            onRetry={resetTest}
            onBackToOverview={handleBackToOverview}
            isLoading={isLoading}
            languagePair={languagePair}
          />
        )}
        
        {!isStarted && !isComplete && (
          <TestInstructions languagePair={languagePair} />
        )}
      </Card>
    </div>
  );
};

export default ConversationTest;
