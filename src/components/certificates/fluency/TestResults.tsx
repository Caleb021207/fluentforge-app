import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface TestResultsProps {
  testResult: any;
  onReset: () => void;
}

const TestResults = ({ testResult, onReset }: TestResultsProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  const handleSubmitScores = async () => {
    try {
      setIsSubmitting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Authentication error",
          description: "You must be logged in to submit scores",
          variant: "destructive"
        });
        return;
      }
      
      // Create speaking attempt
      const speakingScore = testResult?.speaking?.overallScore || 0;
      if (speakingScore > 0) {
        await supabase.from('certification_attempts').insert({
          user_id: user.id,
          certification_type: 'speaking',
          score: speakingScore,
          created_at: new Date().toISOString()
        });
      }
      
      // Create listening attempt
      const listeningScore = testResult?.listening?.overallScore || 0;
      if (listeningScore > 0) {
        await supabase.from('certification_attempts').insert({
          user_id: user.id,
          certification_type: 'listening',
          score: listeningScore,
          created_at: new Date().toISOString()
        });
      }
      
      // Create fluency attempt (average of speaking and listening)
      const fluencyScore = Math.round((speakingScore + listeningScore) / 2);
      if (fluencyScore > 0) {
        await supabase.from('certification_attempts').insert({
          user_id: user.id,
          certification_type: 'fluency',
          score: fluencyScore,
          created_at: new Date().toISOString()
        });
      }
      
      toast({
        title: "Scores submitted successfully",
        description: "Your certificate scores have been updated",
        variant: "success"
      });
      
      // Trigger a refresh event to update UI
      window.dispatchEvent(new CustomEvent('fluency-test-completed'));
      
    } catch (error) {
      console.error("Error submitting scores:", error);
      toast({
        title: "Error submitting scores",
        description: "There was an issue saving your scores. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-lg mb-2">Speaking Results</h3>
          <div className="mb-2">
            <span className="font-medium">Score:</span> {testResult?.speaking?.overallScore}%
          </div>
          <div className="mb-2">
            <span className="font-medium">CEFR Level:</span> {testResult?.speaking?.level}
          </div>
          
          <div className="mt-3">
            <h4 className="font-medium mb-2">Speaking Skills</h4>
            <div className="flex justify-between mb-1">
              <span>Pronunciation</span>
              <span>{testResult?.speaking?.pronunciation}/10</span>
            </div>
            <Progress value={testResult?.speaking?.pronunciation * 10} className="h-2 mb-3" />
            
            <div className="flex justify-between mb-1">
              <span>Fluency</span>
              <span>{testResult?.speaking?.fluency}/10</span>
            </div>
            <Progress value={testResult?.speaking?.fluency * 10} className="h-2 mb-3" />
            
            <div className="flex justify-between mb-1">
              <span>Grammar</span>
              <span>{testResult?.speaking?.grammar}/10</span>
            </div>
            <Progress value={testResult?.speaking?.grammar * 10} className="h-2" />
          </div>
        </div>
        
        <div className="p-4 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-lg mb-2">Listening Results</h3>
          <div className="mb-2">
            <span className="font-medium">Score:</span> {testResult?.listening?.overallScore}%
          </div>
          <div className="mb-2">
            <span className="font-medium">CEFR Level:</span> {testResult?.listening?.level}
          </div>
          
          <div className="mt-3">
            <h4 className="font-medium mb-2">Listening Skills</h4>
            <div className="flex justify-between mb-1">
              <span>Understanding</span>
              <span>{testResult?.listening?.understanding}/10</span>
            </div>
            <Progress value={testResult?.listening?.understanding * 10} className="h-2 mb-3" />
            
            <div className="flex justify-between mb-1">
              <span>Vocabulary</span>
              <span>{testResult?.listening?.vocabulary}/10</span>
            </div>
            <Progress value={testResult?.listening?.vocabulary * 10} className="h-2 mb-3" />
            
            <div className="flex justify-between mb-1">
              <span>Response Quality</span>
              <span>{testResult?.listening?.interaction}/10</span>
            </div>
            <Progress value={testResult?.listening?.interaction * 10} className="h-2" />
          </div>
        </div>
      </div>
      
      <div className="p-4 bg-gray-50 rounded-lg">
        <h3 className="font-medium mb-2">Feedback</h3>
        <p className="text-gray-700 mb-4">{testResult?.feedback}</p>
        
        <div className="mb-4">
          <h4 className="font-medium text-sm mb-2">Strengths:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {testResult?.strengths?.map((strength: string, i: number) => (
              <li key={i} className="text-gray-700">{strength}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-sm mb-2">Areas for Improvement:</h4>
          <ul className="list-disc pl-5 space-y-1">
            {testResult?.areasToImprove?.map((area: string, i: number) => (
              <li key={i} className="text-gray-700">{area}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleSubmitScores} 
          disabled={isSubmitting}
          className="flex-1"
          variant="success"
        >
          {isSubmitting ? "Submitting..." : "Submit Scores"}
        </Button>
        <Button 
          onClick={onReset} 
          variant="outline"
          className="flex-1"
        >
          Take Test Again
        </Button>
      </div>
    </div>
  );
};

export default TestResults;
