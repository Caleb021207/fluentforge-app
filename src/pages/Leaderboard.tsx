import { useState, useEffect } from "react";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trophy, Flame, BookOpen, Crown } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import XPProgressBar from "@/components/gamification/XPProgressBar";

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

const Leaderboard = () => {
  const { isAuthenticated, isLoading: authLoading } = useAuthGuard();
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState<'xp' | 'streak' | 'lessons'>('xp');
  const [scope, setScope] = useState<'global' | 'school' | 'class'>('global');
  const [userRank, setUserRank] = useState<number | null>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchLeaderboard();
    }
  }, [isAuthenticated, type, scope]);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('get-leaderboard-data', {
        body: { type, scope, limit: 50 },
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

  if (authLoading || !isAuthenticated) {
    return (
      <div className="container mx-auto py-8">
        <Skeleton className="h-96" />
      </div>
    );
  }

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown className="w-5 h-5 text-yellow-500" />;
    if (rank === 2) return <Trophy className="w-5 h-5 text-gray-400" />;
    if (rank === 3) return <Trophy className="w-5 h-5 text-amber-600" />;
    return null;
  };

  const getValueDisplay = (entry: LeaderboardEntry) => {
    if (type === 'xp') return `${entry.total_xp.toLocaleString()} XP`;
    if (type === 'streak') return `${entry.current_streak_days} days 🔥`;
    return `${entry.lessons_completed} lessons`;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Leaderboard</h1>
        <p className="text-muted-foreground">Compete with other learners and climb the ranks!</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <Select value={scope} onValueChange={(v: any) => setScope(v)}>
          <SelectTrigger className="w-full md:w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="global">Global</SelectItem>
            <SelectItem value="school">My School</SelectItem>
            <SelectItem value="class">My Class</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs value={type} onValueChange={(v: any) => setType(v)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="xp">
            <Trophy className="w-4 h-4 mr-2" />
            XP
          </TabsTrigger>
          <TabsTrigger value="streak">
            <Flame className="w-4 h-4 mr-2" />
            Streak
          </TabsTrigger>
          <TabsTrigger value="lessons">
            <BookOpen className="w-4 h-4 mr-2" />
            Lessons
          </TabsTrigger>
        </TabsList>

        <TabsContent value={type} className="mt-6">
          {userRank && (
            <Card className="p-4 mb-4 bg-primary/5 border-primary">
              <p className="text-sm font-medium">
                Your Rank: <span className="text-primary text-lg">#{userRank}</span>
              </p>
            </Card>
          )}

          <Card className="overflow-hidden">
            <div className="divide-y">
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <div key={i} className="p-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))
              ) : leaderboardData.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  No data available yet. Be the first to make it on the leaderboard!
                </div>
              ) : (
                leaderboardData.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`p-4 flex items-center gap-4 hover:bg-muted/50 transition-colors ${
                      entry.is_current_user ? 'bg-primary/5' : ''
                    }`}
                  >
                    <div className="w-12 flex items-center justify-center">
                      {getRankIcon(entry.rank) || (
                        <span className="text-lg font-bold text-muted-foreground">
                          #{entry.rank}
                        </span>
                      )}
                    </div>

                    <Avatar className="w-12 h-12">
                      <AvatarImage src={entry.avatar_url} />
                      <AvatarFallback>
                        {entry.display_name?.charAt(0)?.toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {entry.display_name}
                        {entry.is_current_user && (
                          <span className="ml-2 text-xs text-primary">(You)</span>
                        )}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Level {entry.current_level}
                      </p>
                    </div>

                    <div className="text-right">
                      <p className="font-bold">{getValueDisplay(entry)}</p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leaderboard;
