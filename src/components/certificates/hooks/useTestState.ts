
import { useState, useEffect } from "react";
import { TEST_DURATION } from "@/utils/constants";

export const useTestState = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(TEST_DURATION);
  const [testResult, setTestResult] = useState<any>(null);

  useEffect(() => {
    if (isStarted && !isComplete && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [isStarted, isComplete, timeRemaining]);

  const startTest = () => {
    setIsStarted(true);
    setTimeRemaining(TEST_DURATION);
  };

  const completeTest = (result: any) => {
    setIsComplete(true);
    setIsStarted(false);
    setTestResult(result);
  };

  const resetTest = () => {
    setIsStarted(false);
    setIsComplete(false);
    setTimeRemaining(TEST_DURATION);
    setTestResult(null);
  };

  return {
    isStarted,
    isComplete,
    timeRemaining,
    testResult,
    startTest,
    completeTest,
    resetTest
  };
};
