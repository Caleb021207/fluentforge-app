
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Mic, Volume2, Award, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { determineLevel } from "./utils/scoreUtils";

const SpeakingListeningCertification = () => {
  const [testType, setTestType] = useState<"idle" | "speaking" | "listening">("idle");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const startSpeakingTest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("You need to be logged in to take this test");
        return;
      }
      
      setTestType("speaking");
      // Additional setup for speaking test would go here
      
    } catch (err) {
      setError("Failed to start test. Please try again.");
      console.error("Error starting speaking test:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const startListeningTest = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setError("You need to be logged in to take this test");
        return;
      }
      
      setTestType("listening");
      // Additional setup for listening test would go here
      
    } catch (err) {
      setError("Failed to start test. Please try again.");
      console.error("Error starting listening test:", err);
    } finally {
      setIsLoading(false);
    }
  };
  
  const resetTest = () => {
    setTestType("idle");
    setError(null);
  };
  
  const renderTestSelection = () => {
    return (
      <div className="space-y-6">
        <p className="text-gray-600">
          Choose the type of certification test you'd like to take:
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-blue-50">
              <CardTitle className="flex items-center text-lg">
                <Mic className="mr-2 h-5 w-5 text-blue-600" />
                Speaking Test
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Test your Spanish speaking skills through interactive conversation prompts.
              </p>
              <Button 
                onClick={startSpeakingTest} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Loading..." : "Start Speaking Test"}
              </Button>
            </CardContent>
          </Card>
          
          <Card className="overflow-hidden hover:shadow-md transition-shadow">
            <CardHeader className="bg-purple-50">
              <CardTitle className="flex items-center text-lg">
                <Volume2 className="mr-2 h-5 w-5 text-purple-600" />
                Listening Test
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <p className="text-sm text-gray-600 mb-4">
                Test your Spanish listening comprehension with audio clips and questions.
              </p>
              <Button 
                onClick={startListeningTest} 
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Loading..." : "Start Listening Test"}
              </Button>
            </CardContent>
          </Card>
        </div>
        
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
      </div>
    );
  };
  
  const renderSpeakingTest = () => {
    // Placeholder for the actual speaking test UI
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Speaking Certification Test</h3>
          <Button variant="outline" onClick={resetTest}>Cancel Test</Button>
        </div>
        
        <Alert className="bg-blue-50 border-blue-200">
          <AlertTitle>Coming Soon</AlertTitle>
          <AlertDescription>
            The speaking test is currently under development. Check back soon!
          </AlertDescription>
        </Alert>
        
        <Button onClick={resetTest}>Return to Test Selection</Button>
      </div>
    );
  };
  
  const renderListeningTest = () => {
    // Placeholder for the actual listening test UI
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-medium">Listening Certification Test</h3>
          <Button variant="outline" onClick={resetTest}>Cancel Test</Button>
        </div>
        
        <Alert className="bg-purple-50 border-purple-200">
          <AlertTitle>Coming Soon</AlertTitle>
          <AlertDescription>
            The listening test is currently under development. Check back soon!
          </AlertDescription>
        </Alert>
        
        <Button onClick={resetTest}>Return to Test Selection</Button>
      </div>
    );
  };
  
  const renderContent = () => {
    switch (testType) {
      case "speaking":
        return renderSpeakingTest();
      case "listening":
        return renderListeningTest();
      default:
        return renderTestSelection();
    }
  };
  
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Award className="mr-2 h-5 w-5 text-teal-600" />
          Speaking & Listening Certification
        </CardTitle>
      </CardHeader>
      <CardContent>
        {renderContent()}
      </CardContent>
    </Card>
  );
};

export default SpeakingListeningCertification;
