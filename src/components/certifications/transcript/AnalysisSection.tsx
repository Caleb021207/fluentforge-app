
import React, { useState } from "react";
import { Activity, AlertTriangle, Save, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface AnalysisSectionProps {
  analysisData: any;
  attemptId?: string; // Optional attempt ID for saving results
}

const AnalysisSection = ({ analysisData, attemptId }: AnalysisSectionProps) => {
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  if (!analysisData) {
    return null;
  }

  // Check if analysis data is empty or invalid
  const isValidAnalysis = typeof analysisData === 'object' && Object.keys(analysisData).length > 0;
  
  if (!isValidAnalysis) {
    return (
      <Alert variant="destructive" className="mt-4">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          Analysis data is not available or in an unexpected format.
        </AlertDescription>
      </Alert>
    );
  }

  // Extract key data safely
  const analysis = analysisData.analysis || '';
  const speakingLevel = analysisData.speakingLevel || 'N/A';
  const speakingScore = analysisData.speakingScore || '0';
  const listeningLevel = analysisData.listeningLevel || 'N/A';
  const listeningScore = analysisData.listeningScore || '0';
  const feedback = analysisData.feedback || '';
  const strengths = Array.isArray(analysisData.strengths) ? analysisData.strengths : [];
  const areasForImprovement = Array.isArray(analysisData.areas_for_improvement) 
    ? analysisData.areas_for_improvement 
    : [];

  // Handle applying the score to the user's profile
  const handleApplyScore = async () => {
    if (!attemptId) {
      toast({
        title: "Cannot apply score",
        description: "No attempt ID was provided. Please try again.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSaving(true);

      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("You must be logged in to apply scores");
      }
      
      // Update the certification_attempts table with the updated scores and levels
      const { error: speakingError } = await supabase
        .from('certification_attempts')
        .update({ 
          score: parseInt(speakingScore), 
          level: speakingLevel 
        })
        .eq('id', attemptId)
        .eq('certification_type', 'speaking')
        .eq('user_id', user.id);
        
      if (speakingError) {
        throw speakingError;
      }
      
      // Create a listening certification attempt if one doesn't exist
      if (listeningLevel !== 'N/A' && listeningScore !== '0') {
        const { error: listeningError } = await supabase
          .from('certification_attempts')
          .insert([
            {
              certification_type: 'listening',
              score: parseInt(listeningScore),
              level: listeningLevel,
              completed_at: new Date().toISOString(),
              user_id: user.id,
            }
          ]);
          
        if (listeningError) {
          throw listeningError;
        }
      }
      
      // Update transcript record with finalized analysis data
      const { error: transcriptError } = await supabase
        .from('certification_transcripts')
        .update({
          analysis_data: {
            ...analysisData,
            applied: true,
            appliedAt: new Date().toISOString()
          }
        })
        .eq('attempt_id', attemptId)
        .eq('user_id', user.id);
        
      if (transcriptError) {
        throw transcriptError;
      }

      toast({
        title: "Score applied successfully",
        description: "Your assessment results have been saved to your profile",
      });
      
      setSaved(true);
    } catch (error) {
      console.error("Error applying score:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to apply score. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Activity className="h-5 w-5 text-lingua-primary" />
          Analysis
        </h3>
        
        {attemptId && !saved && (
          <Button 
            onClick={handleApplyScore} 
            disabled={isSaving}
            size="sm"
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            {isSaving ? (
              "Saving..."
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Apply Score
              </>
            )}
          </Button>
        )}
        
        {saved && (
          <div className="flex items-center text-green-600 text-sm font-medium">
            <Check className="h-4 w-4 mr-1" />
            Applied to Profile
          </div>
        )}
      </div>
      
      {/* Summary scores section */}
      {(speakingLevel !== 'N/A' || listeningLevel !== 'N/A') && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
          {speakingLevel !== 'N/A' && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
              <h4 className="font-medium text-blue-800 mb-1">Speaking</h4>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{speakingLevel}</span>
                <span className="text-lg">{speakingScore}%</span>
              </div>
            </div>
          )}
          
          {listeningLevel !== 'N/A' && (
            <div className="p-3 bg-green-50 rounded-lg border border-green-100">
              <h4 className="font-medium text-green-800 mb-1">Listening</h4>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">{listeningLevel}</span>
                <span className="text-lg">{listeningScore}%</span>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Detailed analysis */}
      <div className="p-4 bg-muted rounded-lg">
        {analysis ? (
          <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
        ) : (
          <p className="text-gray-500 italic text-sm">No detailed analysis available.</p>
        )}
        
        {feedback && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Feedback</h4>
            <p className="text-sm">{feedback}</p>
          </div>
        )}
        
        {strengths.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {strengths.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
        
        {areasForImprovement.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <h4 className="font-medium mb-2">Areas for Improvement</h4>
            <ul className="list-disc pl-5 text-sm space-y-1">
              {areasForImprovement.map((item: string, i: number) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalysisSection;
