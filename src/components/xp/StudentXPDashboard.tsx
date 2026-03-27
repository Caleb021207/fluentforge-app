import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Star, Flame, Trophy, TrendingUp, Zap } from 'lucide-react';
import { getLevelInfo, getLevelColor, getLevelTier } from '@/utils/levelSystem';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import AchievementCard from '@/components/gamification/AchievementCard';
import AnimatedLoader from '@/components/ui/animated-loader';
import { LeaderboardSection } from '@/components/profile/LeaderboardSection';

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
  category: string;
}

interface UserAchievement {
  achievement_id: string;
  unlocked_at: string;
}

interface StudentXPDashboardProps {
  progression: UserProgression | null;
}

const StudentXPDashboard = ({ progression }: StudentXPDashboardProps) => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userAchievements, setUserAchievements] = useState<UserAchievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        // Fetch all achievements and user's unlocked achievements in parallel
        // achievements and user_achievements tables don't exist yet — skip
        const achievementsRes = { data: [] as any[] };
        const userAchievementsRes = { data: [] as any[] };

        if (achievementsRes.data) setAchievements(achievementsRes.data);
        if (userAchievementsRes.data) setUserAchievements(userAchievementsRes.data);
      } catch (error) {
        console.error('Error fetching achievements:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (!progression) {
    return (
      <Card className="glass">
        <CardContent className="py-12 text-center">
          <p className="text-muted-foreground">Start practicing to earn XP!</p>
        </CardContent>
      </Card>
    );
  }

  const levelInfo = getLevelInfo(progression.total_xp);
  const colorGradient = getLevelColor(levelInfo.level);
  const tier = getLevelTier(levelInfo.level);

  const unlockedAchievementIds = new Set(userAchievements.map(ua => ua.achievement_id));

  const stats = [
    { label: 'Total XP', value: progression.total_xp.toLocaleString(), icon: <Zap className="w-5 h-5 text-yellow-500" /> },
    { label: 'Current Streak', value: `${progression.current_streak_days} days`, icon: <Flame className="w-5 h-5 text-orange-500" /> },
    { label: 'Lessons Done', value: progression.lessons_completed, icon: <TrendingUp className="w-5 h-5 text-green-500" /> },
    { label: 'Certifications', value: progression.certifications_completed, icon: <Trophy className="w-5 h-5 text-purple-500" /> },
  ];

  return (
    <div className="space-y-6">
      {/* Main XP Display */}
      <Card className="glass overflow-hidden">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            {/* Level Badge */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 200, damping: 15 }}
              className={cn(
                "relative w-32 h-32 rounded-full bg-gradient-to-br flex items-center justify-center flex-shrink-0",
                colorGradient
              )}
            >
              <div className="absolute inset-2 rounded-full bg-background/90 flex flex-col items-center justify-center">
                <Star className="w-8 h-8 text-primary mb-1" />
                <span className="text-3xl font-bold">{levelInfo.level}</span>
                <span className="text-xs text-muted-foreground">{tier}</span>
              </div>
            </motion.div>

            {/* Progress Info */}
            <div className="flex-1 w-full space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-lg font-semibold">Level {levelInfo.level}</span>
                  <span className="text-sm text-muted-foreground">
                    {levelInfo.xpToNextLevel.toLocaleString()} XP to Level {levelInfo.level + 1}
                  </span>
                </div>
                <Progress
                  value={levelInfo.progressPercent}
                  className="h-4"
                  indicatorClassName="bg-gradient-to-r from-primary to-accent transition-all duration-500"
                />
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="text-center p-3 rounded-lg bg-muted/50"
                  >
                    <div className="flex justify-center mb-1">{stat.icon}</div>
                    <p className="text-xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* XP Earning Guide */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            How to Earn XP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { action: 'Text Practice', xp: '5 XP/message' },
              { action: 'Voice Chat', xp: '5 XP/message' },
              { action: 'Pronunciation', xp: '5-25 XP' },
              { action: 'Complete Lesson', xp: '50+ XP' },
              { action: 'Daily Streak', xp: '25 XP/day' },
              { action: 'Certification', xp: '200-1500 XP' },
              { action: 'Voice Session', xp: '30+ XP' },
              { action: 'Daily Quest', xp: '100 XP' },
            ].map((item) => (
              <div key={item.action} className="p-3 rounded-lg bg-primary/5 border border-primary/10">
                <p className="font-medium text-sm">{item.action}</p>
                <p className="text-primary font-semibold">{item.xp}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Achievements Section */}
      <Card className="glass">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-primary" />
            Achievements ({userAchievements.length}/{achievements.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <AnimatedLoader size="sm" message="Loading achievements..." />
          ) : achievements.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">No achievements available yet.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement) => {
                const userAchievement = userAchievements.find(ua => ua.achievement_id === achievement.id);
                return (
                  <AchievementCard
                    key={achievement.id}
                    name={achievement.name}
                    description={achievement.description}
                    icon={achievement.icon}
                    xpReward={achievement.xp_reward}
                    unlocked={unlockedAchievementIds.has(achievement.id)}
                    unlockedAt={userAchievement?.unlocked_at}
                  />
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Class Leaderboard */}
      <LeaderboardSection />
    </div>
  );
};

export default StudentXPDashboard;
