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
import { Brain, TrendingUp, Target, FileText, Sparkles, Award } from "lucide-react";
import { motion } from "framer-motion";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { getFluencyCertStatus, getCertDisplayName, getCertDisplayDescription } from "@/utils/fluencyCertification";

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
    // XP notification will handle the success feedback
  };

  const latestAnalysis = analyses?.[0];
  const certStatus = getFluencyCertStatus(analyses);

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="max-w-4xl mx-auto p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 md:h-12 md:h-12 text-primary" />
            AI Progress Analysis
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
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
              {certStatus.level && (
                <div className="mt-2 flex items-center gap-2">
                  <Award className="h-4 w-4 text-primary" />
                  <div className="text-xs">
                    <div className="font-semibold text-foreground">{getCertDisplayName(certStatus.level)}</div>
                    <div className="text-muted-foreground">{getCertDisplayDescription(certStatus.level)}</div>
                  </div>
                </div>
              )}
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
