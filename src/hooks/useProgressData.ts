
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

interface ProgressData {
  totalAnalyses: number;
  currentLevel: string | null;
  latestScore: number | null;
  isLoading: boolean;
  error: Error | null;
}

export const useProgressData = (): ProgressData => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["progress-data"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        return { totalAnalyses: 0, currentLevel: null, latestScore: null };
      }

      // Fetch transcript analyses count and latest data
      const { data: analyses, error: analysesError } = await supabase
        .from("transcript_analyses")
        .select("id, cefr_level, overall_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (analysesError) throw analysesError;

      const totalAnalyses = analyses?.length || 0;
      const latestAnalysis = analyses?.[0];
      
      // Also check user's profile for target level if no analyses
      const { data: profile } = await supabase
        .from("profiles")
        .select("target_level")
        .eq("id", user.id)
        .single();

      return {
        totalAnalyses,
        currentLevel: latestAnalysis?.cefr_level || profile?.target_level || null,
        latestScore: latestAnalysis?.overall_score || null,
      };
    },
  });

  return {
    totalAnalyses: data?.totalAnalyses ?? 0,
    currentLevel: data?.currentLevel ?? null,
    latestScore: data?.latestScore ?? null,
    isLoading,
    error: error as Error | null,
  };
};
