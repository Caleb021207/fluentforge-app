import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getXPReward } from '@/utils/levelSystem';
import { useXPNotification } from '@/contexts/XPNotificationContext';
import LevelUpModal from '@/components/gamification/LevelUpModal';

interface UserProgression {
  total_xp: number;
  current_level: number;
  current_streak_days: number;
  lessons_completed: number;
  certifications_completed: number;
  voice_sessions_completed: number;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  xp_reward: number;
}

export const useGamification = () => {
  const [progression, setProgression] = useState<UserProgression | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLevelUpModal, setShowLevelUpModal] = useState(false);
  const [levelUpData, setLevelUpData] = useState<{ oldLevel: number; newLevel: number } | null>(null);
  const { toast } = useToast();
  const { triggerXPNotification } = useXPNotification();

  useEffect(() => {
    const initializeProgression = async () => {
      await fetchProgression();
      // Only check streak after progression is loaded and user is confirmed
      await checkStreak();
    };
    
    initializeProgression();
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
        setProgression(data);
      }
    } catch (error) {
      console.error('Error fetching progression:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkStreak = async () => {
    try {
      // Get current session to ensure auth token is available
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        console.log('No active session, skipping streak check');
        return;
      }

      const { data, error } = await supabase.functions.invoke('check-streak', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });
      
      if (error) {
        console.error('Streak check error:', error);
        throw error;
      }

      if (data.streak_bonus_xp > 0) {
        toast({
          title: `🔥 ${data.current_streak} Day Streak!`,
          description: `+${data.streak_bonus_xp} bonus XP for maintaining your streak!`,
        });
        fetchProgression();
      }
    } catch (error) {
      console.error('Error checking streak:', error);
    }
  };

  const awardXP = async (
    activityType: 'lesson' | 'certification' | 'voice' | 'streak' | 'quest' | 
                  'text_message' | 'voice_message' | 'pronunciation' | 
                  'conversation_analysis' | 'exam_analysis' | 'premium_voice' | 'realtime_ai',
    metadata?: { 
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
  ) => {
    try {
      console.log('🎮 awardXP called:', { activityType, metadata });
      const xpAmount = getXPReward(activityType, metadata);
      console.log('🎮 Calculated XP amount:', xpAmount);

      const { data, error } = await supabase.functions.invoke('award-xp', {
        body: {
          xp_amount: xpAmount,
          source: activityType,
          metadata,
        },
      });

      if (error) throw error;

      console.log('🎮 XP awarded successfully:', data);

      // Trigger XP notification through context
      if (data.xp_awarded) {
        triggerXPNotification(data.xp_awarded);
      }

      // Show level up modal if leveled up
      if (data.leveled_up) {
        console.log('🎮 Level up!', { oldLevel: data.old_level, newLevel: data.new_level });
        setLevelUpData({ oldLevel: data.old_level, newLevel: data.new_level });
        setShowLevelUpModal(true);
      }

      // Show achievement unlocks
      if (data.new_achievements?.length > 0) {
        data.new_achievements.forEach((achievement: Achievement) => {
          toast({
            title: `🏆 Achievement Unlocked!`,
            description: `${achievement.icon} ${achievement.name} (+${achievement.xp_reward} XP)`,
            duration: 5000,
          });
        });
      }

      // Refresh progression
      await fetchProgression();

      return data;
    } catch (error) {
      console.error('❌ Error awarding XP:', error);
      return null;
    }
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
