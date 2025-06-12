import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase, typedSupabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";

interface TestResultsProps {
  testResult: any;
  onReset: () => void;
}

const TestResults = ({ testResult, onReset }: TestResultsProps) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  
  // Enhanced function to get a more accurate color based on skill level
  const getColorForScore = (score: number): string => {
    if (score >= 9) return "bg-green-500"; 
    if (score >= 8) return "bg-green-400";
    if (score >= 7) return "bg-blue-500";  
    if (score >= 6) return "bg-blue-400";  
    if (score >= 5) return "bg-yellow-400";
    if (score >= 4) return "bg-yellow-500";
    return "bg-red-500";
  };
  
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
      
      // Create speaking attempt with weighted scoring
      const speakingScore = testResult?.speaking?.overallScore || 0;
      if (speakingScore > 0) {
        const speakingLevel = determineLevel(speakingScore);
        await (typedSupabase as any).from('certification_attempts').insert({
          user_id: user.id,
          certification_type: 'speaking',
          score: speakingScore,
          level: speakingLevel,
          created_at: new Date().toISOString()
        });
      }
      
      // Create listening attempt with weighted scoring
      const listeningScore = testResult?.listening?.overallScore || 0;
      if (listeningScore > 0) {
        const listeningLevel = determineLevel(listeningScore);
        await (typedSupabase as any).from('certification_attempts').insert({
          user_id: user.id,
          certification_type: 'listening',
          score: listeningScore,
          level: listeningLevel,
          created_at: new Date().toISOString()
        });
      }
      
      // Create fluency attempt (average of speaking and listening)
      // Adding weight to prioritize speaking slightly more than listening for fluency
      const fluencyScore = Math.round((speakingScore * 0.6 + listeningScore * 0.4));
      if (fluencyScore > 0) {
        const fluencyLevel = determineLevel(fluencyScore);
        await (typedSupabase as any).from('certification_attempts').insert({
          user_id: user.id,
          certification_type: 'fluency',
          score: fluencyScore,
          level: fluencyLevel,
          created_at: new Date().toISOString()
        });
      }
      
      toast({
        title: "Scores submitted successfully",
        description: "Your certificate scores have been updated",
        variant: "default"
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
            <Progress 
              value={testResult?.speaking?.pronunciation * 10} 
              className="h-2 mb-3" 
              indicatorClassName={getColorForScore(testResult?.speaking?.pronunciation || 0)}
            />
            
            <div className="flex justify-between mb-1">
              <span>Fluency</span>
              <span>{testResult?.speaking?.fluency}/10</span>
            </div>
            <Progress 
              value={testResult?.speaking?.fluency * 10} 
              className="h-2 mb-3" 
              indicatorClassName={getColorForScore(testResult?.speaking?.fluency || 0)}
            />
            
            <div className="flex justify-between mb-1">
              <span>Grammar</span>
              <span>{testResult?.speaking?.grammar}/10</span>
            </div>
            <Progress 
              value={testResult?.speaking?.grammar * 10} 
              className="h-2" 
              indicatorClassName={getColorForScore(testResult?.speaking?.grammar || 0)}
            />
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
            <Progress 
              value={testResult?.listening?.understanding * 10} 
              className="h-2 mb-3" 
              indicatorClassName={getColorForScore(testResult?.listening?.understanding || 0)}
            />
            
            <div className="flex justify-between mb-1">
              <span>Vocabulary</span>
              <span>{testResult?.listening?.vocabulary}/10</span>
            </div>
            <Progress 
              value={testResult?.listening?.vocabulary * 10} 
              className="h-2 mb-3" 
              indicatorClassName={getColorForScore(testResult?.listening?.vocabulary || 0)}
            />
            
            <div className="flex justify-between mb-1">
              <span>Response Quality</span>
              <span>{testResult?.listening?.interaction}/10</span>
            </div>
            <Progress 
              value={testResult?.listening?.interaction * 10} 
              className="h-2" 
              indicatorClassName={getColorForScore(testResult?.listening?.interaction || 0)}
            />
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
