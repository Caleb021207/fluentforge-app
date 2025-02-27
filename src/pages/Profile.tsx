
import { useState, useEffect } from "react";
import { Loader2, LayoutDashboard } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import LevelRoadmap from "@/components/profile/LevelRoadmap";
import LearningGoals from "@/components/profile/LearningGoals";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface ProfileData {
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

const DashboardPage = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [profileData, setProfileData] = useState<ProfileData>({
    currentLevel: "",
    learningGoal: "",
    targetLevel: "B2",
    targetDate: "",
  });
  const [testScores, setTestScores] = useState<TestScores>({});
  const [isExampleProfile, setIsExampleProfile] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        // Check if this is the example profile
        if (user?.email === "Example@gmail.com") {
          setIsExampleProfile(true);
        }
        
        if (user) {
          try {
            await createProfileTablesIfNeeded();
            await createUserProfile(user.id);
            await fetchProfileData(user.id);
            await fetchLatestLevel(user.id);
            await fetchTestScores(user.id);
          } catch (error) {
            console.error('Error in profile setup:', error);
          }
        }
      } catch (error) {
        console.error('Error getting user:', error);
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
      const targetLevelIndex = CEFR_LEVELS.indexOf(profileData.targetLevel);
      
      // Don't set a target level for C2 users
      if (profileData.currentLevel === 'C2') {
        setProfileData(prev => ({
          ...prev,
          targetLevel: ''
        }));
        
        // Update the target level in the database
        if (user) {
          updateTargetLevel(user.id, '');
        }
        return;
      }
      
      // Only update if:
      // 1. Current level is valid
      // 2. Current level is not C2 (highest level)
      // 3. Target level is lower than or equal to current level
      if (currentLevelIndex !== -1 && 
          currentLevelIndex < CEFR_LEVELS.length - 1 && 
          (targetLevelIndex === -1 || targetLevelIndex <= currentLevelIndex)) {
        
        const nextLevel = CEFR_LEVELS[currentLevelIndex + 1];
        console.log(`Updating target level from ${profileData.targetLevel} to ${nextLevel}`);
        
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
  }, [profileData.currentLevel, profileData.targetLevel, user]);

  const createProfileTablesIfNeeded = async () => {
    try {
      const { error } = await supabase.rpc('create_profile_tables');
      if (error) {
        console.error('Error creating tables:', error);
        
        // Manually create tables if RPC fails
        await createTablesManually();
      }
    } catch (error) {
      console.error('Error in createProfileTablesIfNeeded:', error);
      await createTablesManually();
    }
  };

  const createTablesManually = async () => {
    try {
      // Check if user_profiles table exists
      const { error: checkError } = await supabase.from('user_profiles').select('id').limit(1);
      
      if (checkError && checkError.code === '42P01') {
        // Table doesn't exist, create it
        const { error: createError } = await supabase.rpc('create_tables', {
          sql_statements: `
            CREATE TABLE IF NOT EXISTS public.user_profiles (
              id UUID PRIMARY KEY,
              display_name TEXT,
              learning_goal TEXT,
              target_level TEXT DEFAULT 'B2',
              target_date TEXT,
              avatar_url TEXT,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );
            
            CREATE TABLE IF NOT EXISTS public.certification_attempts (
              id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
              user_id UUID,
              certification_type TEXT NOT NULL,
              level TEXT NOT NULL,
              score INTEGER NOT NULL,
              completed_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
              created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
            );
            
            ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
            ALTER TABLE public.certification_attempts ENABLE ROW LEVEL SECURITY;
            
            CREATE POLICY "Users can view own profile" ON public.user_profiles
              FOR SELECT USING (auth.uid() = id);
            
            CREATE POLICY "Users can update own profile" ON public.user_profiles
              FOR UPDATE USING (auth.uid() = id);
            
            CREATE POLICY "Users can insert own profile" ON public.user_profiles
              FOR INSERT WITH CHECK (auth.uid() = id);
            
            CREATE POLICY "Users can view own attempts" ON public.certification_attempts
              FOR SELECT USING (auth.uid() = user_id);
            
            CREATE POLICY "Users can insert own attempts" ON public.certification_attempts
              FOR INSERT WITH CHECK (auth.uid() = user_id);
          `
        });
        
        if (createError) {
          console.error('Error manually creating tables:', createError);
        }
      }
    } catch (error) {
      console.error('Error in createTablesManually:', error);
    }
  };

  const updateTargetLevel = async (userId: string, targetLevel: string) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ target_level: targetLevel })
        .eq('id', userId);

      if (error) {
        throw error;
      }
    } catch (error) {
      console.error('Error updating target level:', error);
    }
  };

  const createUserProfile = async (userId: string) => {
    try {
      // Check if user profile exists
      const { data: profile, error: profileError } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('id', userId)
        .single();
      
      // If profile doesn't exist, create it
      if (profileError && profileError.code === 'PGRST116') {
        const { error } = await supabase
          .from('user_profiles')
          .insert({
            id: userId,
            display_name: '',
            learning_goal: '',
            target_level: 'B2',
            target_date: '',
          });
          
        if (error) {
          console.error('Error creating user profile:', error);
        }
      }
    } catch (error) {
      console.error('Error checking/creating profile:', error);
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
        console.error('Error fetching profile:', error);
        return;
      }

      if (profile) {
        setProfileData(prev => ({
          ...prev,
          learningGoal: profile.learning_goal || '',
          targetLevel: profile.target_level || 'B2',
          targetDate: profile.target_date || ''
        }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    }
  };

  const fetchLatestLevel = async (userId: string) => {
    try {
      const { data: attempts, error } = await supabase
        .from('certification_attempts')
        .select('*')
        .eq('user_id', userId)
        .order('completed_at', { ascending: false });

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet
          return;
        }
        throw error;
      }

      if (attempts && attempts.length > 0) {
        // Get highest score for each certification type
        const highestScores = {
          reading: 0,
          writing: 0,
          speaking: 0,
          listening: 0,
          count: 0
        };

        attempts.forEach(attempt => {
          const type = attempt.certification_type;
          if (attempt.score > highestScores[type]) {
            highestScores[type] = attempt.score;
            
            // Only count each certification type once
            if (highestScores[type] === attempt.score && !highestScores[`${type}_counted`]) {
              highestScores.count++;
              highestScores[`${type}_counted`] = true;
            }
          }
        });

        if (highestScores.count > 0) {
          const averageScore = (highestScores.reading + highestScores.writing + highestScores.speaking + highestScores.listening) / highestScores.count;
          const level = determineLevel(averageScore);
          console.log(`Determined current level: ${level}`);
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

      if (error) {
        if (error.code === '42P01') {
          // Table doesn't exist yet
          return;
        }
        throw error;
      }

      if (attempts && attempts.length > 0) {
        const highestScores: TestScores = {};
        
        // Get the highest score for each certification type
        attempts.forEach(attempt => {
          const skill = attempt.certification_type;
          if (highestScores[skill] === undefined || attempt.score > highestScores[skill]) {
            highestScores[skill] = attempt.score;
          }
        });
        
        setTestScores(highestScores);
      }
    } catch (error) {
      console.error('Error fetching test scores:', error);
    }
  };

  const handleSignIn = () => {
    navigate("/");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-lingua-primary" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Authentication Required</h1>
        <p className="mb-6">Please sign in to view your dashboard and track your language learning progress.</p>
        <Button 
          onClick={handleSignIn} 
          className="bg-lingua-primary hover:bg-lingua-primary/90"
        >
          Sign In
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-lingua-text mb-4 flex items-center gap-2">
        <LayoutDashboard className="h-7 w-7" />
        Language Learning Dashboard
      </h1>

      <div className="grid gap-6">
        <LearningGoals
          user={user}
          profileData={profileData}
          setProfileData={setProfileData}
          avatarUrl={null}
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

export default DashboardPage;
