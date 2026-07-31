import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserProgression {
  total_xp: number;
  current_level: number;
  level: number;
  current_streak: number;
  current_streak_days: number;
  longest_streak: number;
  lessons_completed: number;
  certifications_completed: number;
  voice_sessions_completed: number;
  last_activity_date: string | null;
  streak_multiplier: number;
}

/**
 * Read-only gamification hook.
 *
 * 2026-07-30 (overhaul WS 1.1, plan 05 §6.2 release 1): the legacy
 * client-driven award paths were removed. The `award-xp` and `check-streak`
 * edge functions are now 410 Gone stubs — XP and streaks are written
 * exclusively server-side by `submit-exercise` / `vocab-review` through
 * `_shared/learnerProgress.ts` (System A: `xp_events` + `learner_streaks`).
 * This hook keeps its previous return shape so existing consumers compile
 * and render unchanged; only the write paths are gone.
 */
export const useGamification = () => {
  const [progression, setProgression] = useState<UserProgression | null>(null);
  const [loading, setLoading] = useState(true);
  // Level-up celebration state is retained for interface compatibility.
  // It can no longer trigger from this hook: levels change only through
  // server-side awards, which the client observes via fetchProgression().
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData] = useState<{ oldLevel: number; newLevel: number } | null>(null);

  useEffect(() => {
    fetchProgression();
  }, []);

  const fetchProgression = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_progression')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setProgression({
          ...data,
          current_level: data.level ?? 1,
          current_streak_days: data.current_streak ?? 0,
          lessons_completed: 0,
          certifications_completed: 0,
          voice_sessions_completed: 0,
        });
      }
    } catch (error) {
      console.error('Error fetching progression:', error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * NO-OP since 2026-07-30 (plan 05 §6.2 release 1, wip-01a F6.1).
   *
   * This used to invoke the `award-xp` edge function with client-computed
   * XP values — an exploitable path (unbounded, client-trusted metadata)
   * that has been retired to a 410 stub. XP is now awarded only
   * server-side after verified work; conversational/voice XP is paused
   * until the mission runtime emits server-corroborated awards.
   *
   * The signature and `null` return are preserved so existing call sites
   * (which already handled the `null` error path) keep working unchanged.
   */
  const awardXP = async (
    _activityType: 'lesson' | 'certification' | 'voice' | 'streak' | 'quest' |
                   'text_message' | 'voice_message' | 'pronunciation' |
                   'conversation_analysis' | 'exam_analysis' | 'premium_voice' | 'realtime_ai',
    _metadata?: {
      score?: number;
      difficulty?: string;
      minutes?: number;
      complexity?: number;
      grammarAccuracy?: number;
      examScore?: number;
      messageLength?: number;
      vocabularyRichness?: number;
      certificationScores?: {
        reading: number;
        writing: number;
        speaking: number;
        listening: number;
      };
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  ): Promise<any> => {
    return null;
  };

  return {
    progression,
    loading,
    awardXP,
    fetchProgression,
    showLevelUpModal,
    setShowLevelUpModal,
    levelUpData
  };
};
