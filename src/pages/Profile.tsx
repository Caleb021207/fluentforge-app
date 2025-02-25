import { useState, useEffect } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import UserInfo from "@/components/profile/UserInfo";
import LearningGoals from "@/components/profile/LearningGoals";
import LevelRoadmap from "@/components/profile/LevelRoadmap";

interface ProfileData {
  displayName: string;
  currentLevel: string;
  learningGoal: string;
  targetLevel: string;
  targetDate: string;
}

const ProfilePage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    displayName: "",
    currentLevel: "",
    learningGoal: "",
    targetLevel: "B2",
    targetDate: "",
  });
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          await ensureTablesExist();
          await fetchProfileData(user.id);
          await fetchLatestLevel(user.id);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        toast({
          title: "Error",
          description: "Failed to load user data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, [toast]);

  const ensureTablesExist = async () => {
    try {
      const { error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);

      if (checkError && checkError.code === '42P01') {
        await supabase.rpc('create_profile_tables');
        toast({
          title: "Profile Created",
          description: "Your profile has been set up successfully",
        });
      }
    } catch (error) {
      console.error('Error checking/creating tables:', error);
    }
  };

  const fetchProfileData = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          await supabase
            .from('user_profiles')
            .insert({
              id: userId,
              display_name: '',
              learning_goal: '',
              target_level: 'B2',
              target_date: '',
            });
          return;
        }
        throw error;
      }

      if (profile) {
        setProfileData(prev => ({
          ...prev,
          displayName: profile.display_name || '',
          learningGoal: profile.learning_goal || '',
          targetLevel: profile.target_level || 'B2',
          targetDate: profile.target_date || ''
        }));
        setAvatarUrl(profile.avatar_url);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    }
  };

  const fetchLatestLevel = async (userId: string) => {
    try {
      const { data: attempts, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      if (attempts && attempts.length > 0) {
        const scores = {
          reading: 0,
          writing: 0,
          speaking: 0,
          listening: 0,
          count: 0
        };

        attempts.forEach(attempt => {
          if (!scores[attempt.certification_type]) {
            scores[attempt.certification_type] = attempt.score;
            scores.count++;
          }
        });

        if (scores.count > 0) {
          const averageScore = (scores.reading + scores.writing + scores.speaking + scores.listening) / scores.count;
          const level = determineLevel(averageScore);
          setProfileData(prev => ({ ...prev, currentLevel: level }));
        }
      }
    } catch (error) {
      console.error('Error fetching level:', error);
    }
  };

  if (!user) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p>Please sign in to view your profile.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-lingua-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        Your Profile
      </h1>

      <div className="grid md:grid-cols-2 gap-6">
        <UserInfo
          user={user}
          displayName={profileData.displayName}
          setProfileData={setProfileData}
          avatarUrl={avatarUrl}
          setAvatarUrl={setAvatarUrl}
        />
        
        <LearningGoals
          user={user}
          profileData={profileData}
          setProfileData={setProfileData}
          avatarUrl={avatarUrl}
        />

        <LevelRoadmap
          currentLevel={profileData.currentLevel}
          targetLevel={profileData.targetLevel}
          targetDate={profileData.targetDate}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
