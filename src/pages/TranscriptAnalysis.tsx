import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import TranscriptUpload from "@/components/transcript-analysis/TranscriptUpload";
import AnalysisResults from "@/components/transcript-analysis/AnalysisResults";
import ProgressTimeline from "@/components/transcript-analysis/ProgressTimeline";
import { Analysis } from "@/components/transcript-analysis/types";
import { InteractiveCard, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Brain, TrendingUp, Target, FileText, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { GradientBlob } from "@/components/ui/decorative-elements";

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
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="max-w-4xl mx-auto p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2 gradient-text">
            <Brain className="h-7 w-7 text-primary" />
            AI Progress Analysis
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" />
            Upload your language test transcripts and get AI-powered insights to accelerate your learning progress.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          <InteractiveCard className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Total Analyses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{analyses?.length || 0}</div>
            </CardContent>
          </InteractiveCard>

          <InteractiveCard className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Current Level
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">{latestAnalysis?.cefr_level || 'N/A'}</div>
            </CardContent>
          </InteractiveCard>

          <InteractiveCard className="glass">
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5" />
                Latest Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold gradient-text">
                {latestAnalysis?.overall_score ? `${latestAnalysis.overall_score}%` : 'N/A'}
              </div>
            </CardContent>
          </InteractiveCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3 bg-background/60 backdrop-blur-sm p-1">
              <TabsTrigger value="upload" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-palavox-accent data-[state=active]:to-palavox-teal data-[state=active]:text-white transition-all">
                Upload & Analyze
              </TabsTrigger>
              <TabsTrigger value="results" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-palavox-accent data-[state=active]:to-palavox-teal data-[state=active]:text-white transition-all">
                Analysis Results
              </TabsTrigger>
              <TabsTrigger value="progress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-palavox-accent data-[state=active]:to-palavox-teal data-[state=active]:text-white transition-all">
                Progress Timeline
              </TabsTrigger>
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
        </motion.div>
      </div>
    </div>
  );
};

export default TranscriptAnalysis;
