
import React from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
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
        await supabase.from('certification_attempts').insert({
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
        await supabase.from('certification_attempts').insert({
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
        await supabase.from('certification_attempts').insert({
          user_id: user.id,
          certification_type: 'fluency',
          score: fluencyScore,
          level: fluencyLevel,
          created_at: new Date().toISOString()
        });
      }
      
      // Check if they've achieved functional or professional fluency by getting all scores
      const { data: attempts, error: attemptsError } = await supabase
        .from('certification_attempts')
        .select('certification_type, score')
        .eq('user_id', user.id)
        .order('score', { ascending: false });
      
      if (!attemptsError && attempts) {
        // Get highest score for each type
        const highestScores: Record<string, number> = {};
        attempts.forEach(attempt => {
          if (!highestScores[attempt.certification_type] || attempt.score > highestScores[attempt.certification_type]) {
            highestScores[attempt.certification_type] = attempt.score;
          }
        });
        
        const reading = highestScores.reading || 0;
        const writing = highestScores.writing || 0;
        const speaking = highestScores.speaking || speakingScore;
        const listening = highestScores.listening || listeningScore;

        // Award XP based on fluency level achievement
        await supabase.functions.invoke('award-xp', {
          body: {
            xp_amount: 0, // Will be calculated in the edge function based on metadata
            source: 'certification',
            metadata: {
              certificationScores: {
                reading,
                writing,
                speaking,
                listening
              }
            }
          }
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="p-6 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-xl md:text-2xl mb-3">Speaking Results</h3>
          <div className="mb-3 text-base md:text-lg">
            <span className="font-medium">Score:</span> {testResult?.speaking?.overallScore}%
          </div>
          <div className="mb-3 text-base md:text-lg">
            <span className="font-medium">CEFR Level:</span> {testResult?.speaking?.level}
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-lg md:text-xl mb-3">Speaking Skills</h4>
            <div className="flex justify-between mb-2 text-base md:text-lg">
              <span>Pronunciation</span>
              <span>{testResult?.speaking?.pronunciation}/10</span>
            </div>
            <Progress 
              value={testResult?.speaking?.pronunciation * 10} 
              className="h-3 mb-4" 
              indicatorClassName={getColorForScore(testResult?.speaking?.pronunciation || 0)}
            />
            
            <div className="flex justify-between mb-2 text-base md:text-lg">
              <span>Fluency</span>
              <span>{testResult?.speaking?.fluency}/10</span>
            </div>
            <Progress 
              value={testResult?.speaking?.fluency * 10} 
              className="h-3 mb-4" 
              indicatorClassName={getColorForScore(testResult?.speaking?.fluency || 0)}
            />
            
            <div className="flex justify-between mb-2 text-base md:text-lg">
              <span>Grammar</span>
              <span>{testResult?.speaking?.grammar}/10</span>
            </div>
            <Progress 
              value={testResult?.speaking?.grammar * 10} 
              className="h-3" 
              indicatorClassName={getColorForScore(testResult?.speaking?.grammar || 0)}
            />
          </div>
        </div>
        
        <div className="p-6 bg-blue-50 rounded-lg">
          <h3 className="font-medium text-xl md:text-2xl mb-3">Listening Results</h3>
          <div className="mb-3 text-base md:text-lg">
            <span className="font-medium">Score:</span> {testResult?.listening?.overallScore}%
          </div>
          <div className="mb-3 text-base md:text-lg">
            <span className="font-medium">CEFR Level:</span> {testResult?.listening?.level}
          </div>
          
          <div className="mt-4">
            <h4 className="font-medium text-lg md:text-xl mb-3">Listening Skills</h4>
            <div className="flex justify-between mb-2 text-base md:text-lg">
              <span>Understanding</span>
              <span>{testResult?.listening?.understanding}/10</span>
            </div>
            <Progress 
              value={testResult?.listening?.understanding * 10} 
              className="h-3 mb-4" 
              indicatorClassName={getColorForScore(testResult?.listening?.understanding || 0)}
            />
            
            <div className="flex justify-between mb-2 text-base md:text-lg">
              <span>Vocabulary</span>
              <span>{testResult?.listening?.vocabulary}/10</span>
            </div>
            <Progress 
              value={testResult?.listening?.vocabulary * 10} 
              className="h-3 mb-4" 
              indicatorClassName={getColorForScore(testResult?.listening?.vocabulary || 0)}
            />
            
            <div className="flex justify-between mb-2 text-base md:text-lg">
              <span>Response Quality</span>
              <span>{testResult?.listening?.interaction}/10</span>
            </div>
            <Progress 
              value={testResult?.listening?.interaction * 10} 
              className="h-3" 
              indicatorClassName={getColorForScore(testResult?.listening?.interaction || 0)}
            />
          </div>
        </div>
      </div>
      
      <div className="p-6 bg-gray-50 rounded-lg">
        <h3 className="font-medium text-xl md:text-2xl mb-3">Feedback</h3>
        <p className="text-gray-700 text-base md:text-lg mb-6">{testResult?.feedback}</p>
        
        <div className="mb-6">
          <h4 className="font-medium text-lg md:text-xl mb-3">Strengths:</h4>
          <ul className="list-disc pl-5 space-y-2">
            {testResult?.strengths?.map((strength: string, i: number) => (
              <li key={i} className="text-gray-700 text-base md:text-lg">{strength}</li>
            ))}
          </ul>
        </div>
        
        <div>
          <h4 className="font-medium text-lg md:text-xl mb-3">Areas for Improvement:</h4>
          <ul className="list-disc pl-5 space-y-2">
            {testResult?.areasToImprove?.map((area: string, i: number) => (
              <li key={i} className="text-gray-700 text-base md:text-lg">{area}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-4">
        <Button 
          onClick={handleSubmitScores} 
          disabled={isSubmitting}
          className="flex-1 text-lg md:text-xl px-8 py-6"
          variant="success"
        >
          {isSubmitting ? "Submitting..." : "Submit Scores"}
        </Button>
        <Button 
          onClick={onReset} 
          variant="outline"
          className="flex-1 text-lg md:text-xl px-8 py-6"
        >
          Take Test Again
        </Button>
      </div>
    </div>
  );
};

export default TestResults;
