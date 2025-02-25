
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

interface TestScores {
  reading?: number;
  writing?: number;
  speaking?: number;
  listening?: number;
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
  const [testScores, setTestScores] = useState<TestScores>({});
  const { toast } = useToast();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        if (user) {
          await createUserProfile(user.id);
          await fetchProfileData(user.id);
          await fetchLatestLevel(user.id);
          await fetchTestScores(user.id);
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

  // Effect to update target level when current level changes
  useEffect(() => {
    if (profileData.currentLevel) {
      const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const currentLevelIndex = CEFR_LEVELS.indexOf(profileData.currentLevel);
      
      // If current level is valid and not the highest level
      if (currentLevelIndex !== -1 && currentLevelIndex < CEFR_LEVELS.length - 1) {
        const nextLevel = CEFR_LEVELS[currentLevelIndex + 1];
        setProfileData(prev => ({
          ...prev,
          targetLevel: nextLevel
        }));
        
        // Update the target level in the database
        if (user) {
          updateTargetLevel(user.id, nextLevel);
        }
      }
    }
  }, [profileData.currentLevel, user]);

  const updateTargetLevel = async (userId: string, targetLevel: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ target_level: targetLevel })
        .eq('id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating target level:', error);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      // First, check if the tables exist
      const { error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);

      // If tables don't exist, create them directly
      if (checkError && checkError.code === '42P01') {
        // Execute SQL to create tables
        const { error: createError } = await supabase.rpc('create_profile_tables');
        
        if (createError) {
          console.error('Error creating tables:', createError);
          // Fallback: create the profile directly if RPC fails
          await manuallyCreateProfile(userId);
          return;
        }
        
        toast({
          title: "Profile Created",
          description: "Your profile has been set up successfully",
        });
      }
      
      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            display_name: '',
            learning_goal: '',
            target_level: 'B2',
            target_date: '',
          });
      }
    } catch (error) {
      console.error('Error checking/creating profile:', error);
    }
  };

  const manuallyCreateProfile = async (userId: string) => {
    try {
      // Create user_profiles table and insert user's profile
      await supabase.auth.admin.createUser({
        id: userId,
        email: '',
        user_metadata: { initialized: true }
      });
      
      const { error: insertError } = await supabase
        .from('user_profiles')
        .insert({
          id: userId,
          display_name: '',
          learning_goal: '',
          target_level: 'B2',
          target_date: '',
        });
        
      if (insertError && insertError.code !== '23505') { // Ignore duplicate key errors
        console.error('Error creating profile:', insertError);
      }
    } catch (error) {
      console.error('Error manually creating profile:', error);
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
          // Profile doesn't exist, create it
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
        description: "Failed to load profile data. Please try refreshing the page.",
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

  const fetchTestScores = async (userId: string) => {
    try {
      const { data: attempts, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) throw error;

      if (attempts && attempts.length > 0) {
        const latestScores: TestScores = {};
        
        // Get the most recent score for each certification type
        attempts.forEach(attempt => {
          if (latestScores[attempt.certification_type] === undefined) {
            latestScores[attempt.certification_type] = attempt.score;
          }
        });
        
        setTestScores(latestScores);
      }
    } catch (error) {
      console.error('Error fetching test scores:', error);
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
          testScores={testScores}
        />
      </div>
    </div>
  );
};

export default ProfilePage;
