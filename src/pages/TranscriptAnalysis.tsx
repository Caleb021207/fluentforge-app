import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TranscriptUpload from "@/components/transcript-analysis/TranscriptUpload";
import AnalysisResults from "@/components/transcript-analysis/AnalysisResults";
import ProgressTimeline from "@/components/transcript-analysis/ProgressTimeline";
import { Analysis } from "@/components/transcript-analysis/types";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Target, FileText } from "lucide-react";

const TranscriptAnalysis = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const { toast } = useToast();

  // Fetch user's transcript analyses
  const { data: analyses, isLoading } = useQuery({
    queryKey: ['transcript-analyses', refreshKey],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('transcript_analyses')
        .select('*')
        .eq('user_id', user.id)
        .order('upload_date', { ascending: false });

      if (error) throw error;
      
      return (data?.map(analysis => ({
        ...analysis,
        upload_date: analysis.created_at,
      })) || []) as Analysis[];
    },
  });

  // Fetch progress milestones
  const { data: milestones } = useQuery({
    queryKey: ['progress-milestones', refreshKey],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data, error } = await supabase
        .from('progress_milestones')
        .select('*')
        .eq('user_id', user.id)
        .order('achievement_date', { ascending: false });

      if (error) throw error;
      return data;
    },
  });


  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
    toast({
      title: "Analysis Complete",
      description: "Your transcript has been analyzed successfully",
    });
  };

  const latestAnalysis = analyses?.[0];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 text-foreground">
          <Brain className="h-8 w-8 text-blue-600" />
          AI Progress Analysis
        </h1>
        <p className="text-muted-foreground">
          Upload your language test transcripts and get AI-powered insights to accelerate your learning progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Total Analyses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyses?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Level
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{latestAnalysis?.cefr_level || 'N/A'}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <Target className="h-5 w-5" />
              Latest Score
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {latestAnalysis?.overall_score ? `${latestAnalysis.overall_score}%` : 'N/A'}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="upload" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upload">Upload & Analyze</TabsTrigger>
          <TabsTrigger value="results">Analysis Results</TabsTrigger>
          <TabsTrigger value="progress">Progress Timeline</TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <TranscriptUpload onUploadSuccess={handleUploadSuccess} />
        </TabsContent>

        <TabsContent value="results">
          <AnalysisResults analyses={analyses} isLoading={isLoading} />
        </TabsContent>

        <TabsContent value="progress">
          <ProgressTimeline analyses={analyses} milestones={milestones} />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default TranscriptAnalysis;
