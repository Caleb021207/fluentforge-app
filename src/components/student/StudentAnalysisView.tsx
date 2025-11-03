import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import TranscriptUpload from "@/components/transcript-analysis/TranscriptUpload";
import AnalysisResults from "@/components/transcript-analysis/AnalysisResults";
import ProgressTimeline from "@/components/transcript-analysis/ProgressTimeline";
import { Analysis } from "@/components/transcript-analysis/types";
import { InteractiveCard, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TrendingUp, Target, FileText, Award, Zap, LineChart, FileCheck } from "lucide-react";
import { motion } from "framer-motion";
import { getFluencyCertStatus, getCertDisplayName, getCertDisplayDescription } from "@/utils/fluencyCertification";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const StudentAnalysisView = () => {
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();

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
  };

  const latestAnalysis = analyses?.[0];
  const certStatus = getFluencyCertStatus(analyses);

  return (
    <div className="space-y-6">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
      >
        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <InteractiveCard className="glass relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <div className="p-2 bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                Total Analyses
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-end gap-3">
                <div className="text-4xl font-bold gradient-text">{analyses?.length || 0}</div>
                {analyses && analyses.length > 1 && (
                  <div className="text-sm text-muted-foreground mb-1 flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {analyses.length} uploads
                  </div>
                )}
              </div>
            </CardContent>
          </InteractiveCard>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <InteractiveCard className="glass relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-palavox-teal/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <div className="p-2 bg-gradient-to-br from-palavox-teal/20 to-primary/20 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-palavox-teal" />
                </div>
                Current Level
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="text-4xl font-bold gradient-text mb-2">{latestAnalysis?.cefr_level || 'N/A'}</div>
              {certStatus.level && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 p-3 bg-gradient-to-r from-primary/10 to-accent/10 rounded-lg border border-primary/20"
                >
                  <div className="flex items-start gap-2">
                    <Award className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                    <div>
                      <div className="font-semibold text-sm text-foreground">{getCertDisplayName(certStatus.level)}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{getCertDisplayDescription(certStatus.level)}</div>
                    </div>
                  </div>
                </motion.div>
              )}
            </CardContent>
          </InteractiveCard>
        </motion.div>

        <motion.div whileHover={{ scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
          <InteractiveCard className="glass relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardHeader className="pb-2 relative z-10">
              <CardTitle className="text-base flex items-center gap-2 text-foreground">
                <div className="p-2 bg-gradient-to-br from-accent/20 to-palavox-teal/20 rounded-lg">
                  <Target className="h-5 w-5 text-accent" />
                </div>
                Latest Score
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-end gap-2">
                <div className="text-4xl font-bold gradient-text">
                  {latestAnalysis?.overall_score ? `${latestAnalysis.overall_score}` : 'N/A'}
                </div>
                {latestAnalysis?.overall_score && (
                  <div className="text-2xl text-muted-foreground mb-1">%</div>
                )}
              </div>
              {analyses && analyses.length > 1 && latestAnalysis && analyses[analyses.length - 2] && (
                <div className="mt-2 flex items-center gap-1 text-sm">
                  {(() => {
                    const prev = analyses[analyses.length - 2].overall_score || 0;
                    const current = latestAnalysis.overall_score || 0;
                    const change = current - prev;
                    return change > 0 ? (
                      <>
                        <LineChart className="h-4 w-4 text-green-500" />
                        <span className="text-green-500 font-medium">+{change}% from last</span>
                      </>
                    ) : change < 0 ? (
                      <>
                        <LineChart className="h-4 w-4 text-red-500 rotate-180" />
                        <span className="text-red-500 font-medium">{change}% from last</span>
                      </>
                    ) : (
                      <span className="text-muted-foreground">No change</span>
                    );
                  })()}
                </div>
              )}
            </CardContent>
          </InteractiveCard>
        </motion.div>
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

      {/* Certificate Button */}
      {certStatus.level && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex justify-center"
        >
          <Button
            onClick={() => navigate('/certificate')}
            size="lg"
            className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90"
          >
            <FileCheck className="w-5 h-5" />
            View My Certificate
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default StudentAnalysisView;
