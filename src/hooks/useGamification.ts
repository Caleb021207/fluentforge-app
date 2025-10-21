import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { getXPReward } from '@/utils/levelSystem';

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

  useEffect(() => {
    fetchProgression();
    checkStreak();
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
      const { data, error } = await supabase.functions.invoke('check-streak');
      
      if (error) throw error;

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
    activityType: 'lesson' | 'certification' | 'voice',
    metadata?: { score?: number; difficulty?: string; minutes?: number }
  ) => {
    try {
      const xpAmount = getXPReward(activityType, metadata);

      const { data, error } = await supabase.functions.invoke('award-xp', {
        body: {
          xp_amount: xpAmount,
          source: activityType,
          metadata,
        },
      });

      if (error) throw error;

      // Show XP toast
      toast({
        title: `+${xpAmount} XP`,
        description: `Great job! Keep up the learning!`,
      });

      // Show level up modal if leveled up
      if (data.leveled_up) {
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
      console.error('Error awarding XP:', error);
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
    levelUpData,
  };
};
