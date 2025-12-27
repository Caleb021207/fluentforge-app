/**
 * Hook to determine student's proficiency level from various sources
 * Priority: 1. Learning profile, 2. Certification history, 3. Conversation setting
 */

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getLevelBehavior, conversationLevelToCEFR, LevelBehavior } from "@/utils/proficiencyMapping";

interface ProficiencyData {
  cefrLevel: string;
  actflLevel: string | null;
  source: 'learning_profile' | 'certification' | 'setting' | 'default';
  behavior: LevelBehavior;
}

export const useStudentProficiency = (conversationLevelSetting: string = "intermediate") => {
  const [proficiency, setProficiency] = useState<ProficiencyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchProficiency = useCallback(async () => {
    setIsLoading(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        // Default to conversation setting for unauthenticated users
        const cefrLevel = conversationLevelToCEFR(conversationLevelSetting);
        setProficiency({
          cefrLevel,
          actflLevel: null,
          source: 'setting',
          behavior: getLevelBehavior(cefrLevel)
        });
        return;
      }

      // 1. Try learning profile first (most accurate if profiling is enabled)
      const { data: learningProfile } = await supabase
        .from('student_learning_profiles')
        .select('estimated_cefr_level, estimated_actfl_level, profiling_enabled')
        .eq('student_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (learningProfile?.profiling_enabled && learningProfile.estimated_cefr_level) {
        const cefrLevel = learningProfile.estimated_cefr_level.toUpperCase();
        setProficiency({
          cefrLevel,
          actflLevel: learningProfile.estimated_actfl_level,
          source: 'learning_profile',
          behavior: getLevelBehavior(cefrLevel)
        });
        setIsLoading(false);
        return;
      }

      // 2. Try certification history
      const { data: certifications } = await supabase
        .from('transcript_analyses')
        .select('cefr_level, overall_score')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(5);

      if (certifications && certifications.length > 0) {
        // Get the most common CEFR level from recent analyses
        const validLevels = certifications
          .filter(c => c.cefr_level)
          .map(c => c.cefr_level!.toUpperCase());
        
        if (validLevels.length > 0) {
          // Use most recent valid level
          const cefrLevel = validLevels[0];
          setProficiency({
            cefrLevel,
            actflLevel: null,
            source: 'certification',
            behavior: getLevelBehavior(cefrLevel)
          });
          setIsLoading(false);
          return;
        }
      }

      // 3. Fall back to conversation level setting
      const cefrLevel = conversationLevelToCEFR(conversationLevelSetting);
      setProficiency({
        cefrLevel,
        actflLevel: null,
        source: 'setting',
        behavior: getLevelBehavior(cefrLevel)
      });

    } catch (error) {
      console.error('Error fetching student proficiency:', error);
      // Default on error
      const cefrLevel = conversationLevelToCEFR(conversationLevelSetting);
      setProficiency({
        cefrLevel,
        actflLevel: null,
        source: 'default',
        behavior: getLevelBehavior(cefrLevel)
      });
    } finally {
      setIsLoading(false);
    }
  }, [conversationLevelSetting]);

  useEffect(() => {
    fetchProficiency();
  }, [fetchProficiency]);

  return {
    proficiency,
    isLoading,
    refetch: fetchProficiency
  };
};
