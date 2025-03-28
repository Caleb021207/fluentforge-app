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
import { ensureUserProfile, getUserProfile, updateUserProfile } from "@/utils/profileUtils";
import { UserProfile } from "@/types/supabase";
import { useLocalization } from "@/context/LocalizationContext";

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
  const [authError, setAuthError] = useState(false);
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
  const { t, currentLanguage } = useLocalization();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          setAuthError(true);
          setIsLoading(false);
          return;
        }
        
        setUser(user);
        
        if (user?.email === "Example@gmail.com") {
          setIsExampleProfile(true);
        }
        
        if (user) {
          try {
            await ensureUserProfile(user.id);
            await fetchProfileData(user.id);
            await fetchLatestLevel(user.id);
            await fetchTestScores(user.id);
          } catch (error) {
            console.error('Error in profile setup:', error);
            toast({
              title: "Error loading profile",
              description: "There was a problem loading your profile data.",
              variant: "destructive"
            });
          }
        }
      } catch (error) {
        console.error('Error getting user:', error);
        setAuthError(true);
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();
  }, [toast]);

  useEffect(() => {
    if (profileData.currentLevel) {
      const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];
      const currentLevelIndex = CEFR_LEVELS.indexOf(profileData.currentLevel);
      const targetLevelIndex = CEFR_LEVELS.indexOf(profileData.targetLevel);
      
      if (profileData.currentLevel === 'C2') {
        setProfileData(prev => ({
          ...prev,
          targetLevel: ''
        }));
        
        if (user) {
          updateTargetLevel(user.id, '');
        }
        return;
      }
      
      if (currentLevelIndex !== -1 && 
          currentLevelIndex < CEFR_LEVELS.length - 1 && 
          (targetLevelIndex === -1 || targetLevelIndex <= currentLevelIndex)) {
        
        const nextLevel = CEFR_LEVELS[currentLevelIndex + 1];
        console.log(`Updating target level from ${profileData.targetLevel} to ${nextLevel}`);
        
        setProfileData(prev => ({
          ...prev,
          targetLevel: nextLevel
        }));
        
        if (user) {
          updateTargetLevel(user.id, nextLevel);
        }
      }
    }
  }, [profileData.currentLevel, profileData.targetLevel, user]);

  const updateTargetLevel = async (userId: string, targetLevel: string) => {
    try {
      await updateUserProfile(userId, { target_level: targetLevel });
    } catch (error) {
      console.error('Error updating target level:', error);
    }
  };

  const fetchProfileData = async (userId: string) => {
    try {
      const profile = await getUserProfile(userId);

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
        throw error;
      }

      if (attempts && attempts.length > 0) {
        const highestScores: Record<string, any> = {
          reading: 0,
          writing: 0,
          speaking: 0,
          listening: 0,
          count: 0
        };

        attempts.forEach(attempt => {
          const type = attempt.certification_type;
          if (!['reading', 'writing', 'speaking', 'listening'].includes(type)) {
            return;
          }
          
          if (attempt.score > highestScores[type]) {
            highestScores[type] = attempt.score;
            
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
        throw error;
      }

      if (attempts && attempts.length > 0) {
        const highestScores: TestScores = {};
        
        attempts.forEach(attempt => {
          const skill = attempt.certification_type;
          if (!['reading', 'writing', 'speaking', 'listening'].includes(skill)) {
            return;
          }
          
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

  if (!user || authError) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">
          {currentLanguage === "spanish" ? "Autenticación Requerida" : "Authentication Required"}
        </h1>
        <p className="mb-6">
          {currentLanguage === "spanish" 
            ? "Por favor inicia sesión para ver tu tablero y seguir tu progreso de aprendizaje de idiomas." 
            : "Please sign in to view your dashboard and track your language learning progress."}
        </p>
        <Button 
          onClick={handleSignIn} 
          className="bg-lingua-primary hover:bg-lingua-primary/90"
        >
          {t("signIn")}
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-lingua-text mb-4 flex items-center gap-2">
        <LayoutDashboard className="h-7 w-7" />
        {currentLanguage === "spanish" ? "Tablero de Aprendizaje de Idiomas" : "Language Learning Dashboard"}
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
