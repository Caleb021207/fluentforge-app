import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, InteractiveCard } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Trophy, Flame, BookOpen, Crown, Medal, Sparkles } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { staggerList, slideInUp } from "@/lib/animations";

interface LeaderboardEntry {
  rank: number;
  user_id: string;
  display_name: string;
  avatar_url?: string;
  total_xp: number;
  current_level: number;
  current_streak_days: number;
  lessons_completed: number;
  is_current_user: boolean;
}

export const LeaderboardSection = () => {
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'xp' | 'streak' | 'lessons'>('xp');
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    fetchLeaderboard();
  }, [type]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-leaderboard-data', {
        body: { type, scope: 'class', limit: 50 },
      });

      if (error) throw error;

      setLeaderboardData(data.leaderboard || []);
      setUserRank(data.user_rank);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-6 h-6 text-yellow-400 drop-shadow-lg" />;
    if (rank === 2) return <Medal className="w-6 h-6 text-gray-400 drop-shadow-lg" />;
    if (rank === 3) return <Medal className="w-6 h-6 text-amber-600 drop-shadow-lg" />;
    return null;
  };

  const getRankGradient = (rank: number) => {
    if (rank === 1) return "from-yellow-400 via-yellow-500 to-amber-600";
    if (rank === 2) return "from-gray-300 via-gray-400 to-gray-500";
    if (rank === 3) return "from-amber-500 via-amber-600 to-orange-600";
    return "";
  };

  const topThree = leaderboardData.slice(0, 3);
  const restOfLeaderboard = leaderboardData.slice(3);

  const getValueDisplay = (entry: LeaderboardEntry) => {
    if (type === 'xp') return `${entry.total_xp.toLocaleString()} XP`;
    if (type === 'streak') return `${entry.current_streak_days} days 🔥`;
    return `${entry.lessons_completed} lessons`;
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-2 gradient-text">Class Leaderboard</h2>
        <p className="text-muted-foreground flex items-center justify-center gap-2">
          <Sparkles className="w-4 h-4 text-palavox-accent" />
          Compete with classmates and climb the ranks!
          <Sparkles className="w-4 h-4 text-palavox-teal" />
        </p>
      </div>

      <Tabs value={type} onValueChange={(v: any) => setType(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-background/60 backdrop-blur-sm p-1">
          <TabsTrigger value="xp" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-palavox-accent data-[state=active]:to-palavox-teal data-[state=active]:text-white transition-all">
            <Trophy className="w-4 h-4 mr-2" />
            XP
          </TabsTrigger>
          <TabsTrigger value="streak" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-red-500 data-[state=active]:text-white transition-all">
            <Flame className="w-4 h-4 mr-2" />
            Streak
          </TabsTrigger>
          <TabsTrigger value="lessons" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white transition-all">
            <BookOpen className="w-4 h-4 mr-2" />
            Lessons
          </TabsTrigger>
        </TabsList>

        <TabsContent value={type} className="mt-6">
          <AnimatePresence mode="wait">
            {userRank && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
              >
                <Card className="p-4 mb-6 bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 border-primary/50 shadow-lg glow-accent">
                  <p className="text-sm font-medium flex items-center justify-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary" />
                    Your Rank: <span className="text-primary text-2xl font-bold">#{userRank}</span>
                    <Sparkles className="w-4 h-4 text-primary" />
                  </p>
                </Card>
              </motion.div>
            )}

            {loading ? (
              <Card className="overflow-hidden">
                <div className="divide-y">
                  {Array.from({ length: 10 }).map((_, i) => (
                    <div key={i} className="p-4">
                      <Skeleton className="h-16 w-full" />
                    </div>
                  ))}
                </div>
              </Card>
            ) : leaderboardData.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                <Card className="p-12 text-center">
                  <Trophy className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                  <p className="text-lg text-muted-foreground">
                    No data available yet. Be the first to make it on the leaderboard!
                  </p>
                </Card>
              </motion.div>
            ) : (
              <>
                {/* Top 3 Podium */}
                {topThree.length >= 3 && (
                  <motion.div
                    variants={staggerList}
                    initial="hidden"
                    animate="visible"
                    className="grid grid-cols-3 gap-4 mb-8"
                  >
                    {/* 2nd Place */}
                    <motion.div variants={slideInUp} className="pt-12">
                      <InteractiveCard className={`p-6 text-center bg-gradient-to-br ${getRankGradient(2)} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                        <div className="relative z-10">
                          <div className="flex justify-center mb-3">
                            {getRankIcon(2)}
                          </div>
                          <Avatar className="w-16 h-16 mx-auto mb-3 ring-4 ring-white/50">
                            <AvatarImage src={topThree[1]?.avatar_url} />
                            <AvatarFallback className="bg-white text-gray-700 font-bold">
                              {topThree[1]?.display_name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-bold text-white text-lg mb-1 drop-shadow-lg">
                            {topThree[1]?.display_name}
                          </p>
                          <p className="text-white/90 text-sm font-semibold">
                            {getValueDisplay(topThree[1])}
                          </p>
                          <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-white/70 text-xs">Level {topThree[1]?.current_level}</p>
                          </div>
                        </div>
                      </InteractiveCard>
                    </motion.div>

                    {/* 1st Place */}
                    <motion.div variants={slideInUp}>
                      <InteractiveCard className={`p-6 text-center bg-gradient-to-br ${getRankGradient(1)} relative overflow-hidden shadow-2xl scale-105 glow-accent`}>
                        <motion.div
                          className="absolute inset-0 bg-white/10 backdrop-blur-sm"
                          animate={{ opacity: [0.1, 0.2, 0.1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        />
                        <div className="relative z-10">
                          <motion.div
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="flex justify-center mb-3"
                          >
                            {getRankIcon(1)}
                          </motion.div>
                          <Avatar className="w-20 h-20 mx-auto mb-3 ring-4 ring-white shadow-xl">
                            <AvatarImage src={topThree[0]?.avatar_url} />
                            <AvatarFallback className="bg-white text-yellow-700 font-bold text-xl">
                              {topThree[0]?.display_name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-bold text-white text-xl mb-1 drop-shadow-lg">
                            {topThree[0]?.display_name}
                          </p>
                          <p className="text-white text-base font-bold">
                            {getValueDisplay(topThree[0])}
                          </p>
                          <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-white/80 text-sm">Level {topThree[0]?.current_level}</p>
                          </div>
                        </div>
                      </InteractiveCard>
                    </motion.div>

                    {/* 3rd Place */}
                    <motion.div variants={slideInUp} className="pt-12">
                      <InteractiveCard className={`p-6 text-center bg-gradient-to-br ${getRankGradient(3)} relative overflow-hidden`}>
                        <div className="absolute inset-0 bg-white/10 backdrop-blur-sm" />
                        <div className="relative z-10">
                          <div className="flex justify-center mb-3">
                            {getRankIcon(3)}
                          </div>
                          <Avatar className="w-16 h-16 mx-auto mb-3 ring-4 ring-white/50">
                            <AvatarImage src={topThree[2]?.avatar_url} />
                            <AvatarFallback className="bg-white text-amber-700 font-bold">
                              {topThree[2]?.display_name?.charAt(0)?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <p className="font-bold text-white text-lg mb-1 drop-shadow-lg">
                            {topThree[2]?.display_name}
                          </p>
                          <p className="text-white/90 text-sm font-semibold">
                            {getValueDisplay(topThree[2])}
                          </p>
                          <div className="mt-4 pt-4 border-t border-white/20">
                            <p className="text-white/70 text-xs">Level {topThree[2]?.current_level}</p>
                          </div>
                        </div>
                      </InteractiveCard>
                    </motion.div>
                  </motion.div>
                )}

                {/* Rest of Leaderboard */}
                <Card className="overflow-hidden glass">
                  <motion.div 
                    variants={staggerList}
                    initial="hidden"
                    animate="visible"
                    className="divide-y divide-border/50"
                  >
                    {restOfLeaderboard.map((entry, index) => (
                      <motion.div
                        key={entry.user_id}
                        variants={slideInUp}
                        custom={index}
                        className={`p-4 flex items-center gap-4 hover:bg-accent/10 transition-all duration-300 ${
                          entry.is_current_user ? 'bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 shadow-inner glow-accent' : ''
                        }`}
                      >
                        <div className="w-14 flex items-center justify-center">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg ${
                            entry.is_current_user 
                              ? 'bg-gradient-to-br from-primary to-accent text-white shadow-lg' 
                              : 'bg-muted text-muted-foreground'
                          }`}>
                            #{entry.rank}
                          </div>
                        </div>

                        <Avatar className={`w-12 h-12 ${entry.is_current_user ? 'ring-2 ring-primary' : ''}`}>
                          <AvatarImage src={entry.avatar_url} />
                          <AvatarFallback className={entry.is_current_user ? 'bg-primary text-white' : ''}>
                            {entry.display_name?.charAt(0)?.toUpperCase() || '?'}
                          </AvatarFallback>
                        </Avatar>

                        <div className="flex-1 min-w-0">
                          <p className={`font-semibold truncate ${entry.is_current_user ? 'text-lg' : ''}`}>
                            {entry.display_name}
                            {entry.is_current_user && (
                              <span className="ml-2 text-xs font-bold text-primary px-2 py-1 bg-primary/10 rounded-full">
                                YOU
                              </span>
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Level {entry.current_level}
                          </p>
                        </div>

                        <div className="text-right">
                          <p className={`font-bold ${entry.is_current_user ? 'text-lg text-primary' : ''}`}>
                            {getValueDisplay(entry)}
                          </p>
                        </div>
                      </motion.div>
                    ))}
                  </motion.div>
                </Card>
              </>
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>
    </div>
  );
};
