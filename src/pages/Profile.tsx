
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { determineLevel } from "@/components/certifications/utils/scoreUtils";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Upload, Calendar, TrendingUp } from "lucide-react";
import { getLevelDescription } from "@/components/certifications/utils/scoreUtils";
import { Progress } from "@/components/ui/progress";

interface ProfileData {
  displayName: string;
  currentLevel: string;
  learningGoal: string;
  targetLevel: string;
  targetDate: string;
}

interface UserProfile {
  id: string;
  display_name: string;
  learning_goal: string;
  target_level: string;
  target_date: string;
  avatar_url: string | null;
}

interface CertificationAttempt {
  certification_type: string;
  completed_at: string;
  created_at: string;
  id: string;
  level: string;
  score: number;
  user_id: string;
}

const CEFR_LEVELS = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

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

  const fetchProfileData = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select<'user_profiles', UserProfile>('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile doesn't exist yet, create it
          const { error: createError } = await supabase
            .from('user_profiles')
            .insert<Partial<UserProfile>>({
              id: userId,
              display_name: '',
              learning_goal: '',
              target_level: 'B2',
              target_date: '',
            });
          
          if (createError) throw createError;
          return;
        }
        throw error;
      }

      if (data) {
        setProfileData(prev => ({
          ...prev,
          displayName: data.display_name || '',
          learningGoal: data.learning_goal || '',
          targetLevel: data.target_level || 'B2',
          targetDate: data.target_date || ''
        }));
        setAvatarUrl(data.avatar_url);
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
        .select<'certification_attempts', CertificationAttempt>('*')
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

  const calculateProgressToNextLevel = () => {
    const currentLevelIndex = CEFR_LEVELS.indexOf(profileData.currentLevel);
    const targetLevelIndex = CEFR_LEVELS.indexOf(profileData.targetLevel);
    
    if (currentLevelIndex === -1 || targetLevelIndex === -1) return 0;
    if (currentLevelIndex >= targetLevelIndex) return 100;
    
    const totalLevels = targetLevelIndex - currentLevelIndex;
    return Math.round((1 / totalLevels) * 100);
  };

  const getRemainingTime = () => {
    if (!profileData.targetDate) return "No target date set";
    
    const target = new Date(profileData.targetDate);
    const now = new Date();
    const days = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    if (days < 0) return "Target date has passed";
    if (days === 0) return "Today is the target date";
    return `${days} days remaining`;
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || !event.target.files[0] || !user) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      setAvatarUrl(publicUrl);

      const { error: updateError } = await supabase
        .from('user_profiles')
        .update<Partial<UserProfile>>({ avatar_url: publicUrl })
        .eq('id', user.id);

      if (updateError) throw updateError;

      toast({
        title: "Success",
        description: "Profile picture updated successfully",
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    }
  };

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert<UserProfile>({
          id: user.id,
          display_name: profileData.displayName,
          learning_goal: profileData.learningGoal,
          target_level: profileData.targetLevel,
          target_date: profileData.targetDate,
          avatar_url: avatarUrl,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
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
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-col items-center space-y-4 mb-6">
              <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200">
                    <span className="text-gray-500 text-4xl">
                      {profileData.displayName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <Label htmlFor="avatar" className="cursor-pointer">
                  <div className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800">
                    <Upload className="w-4 h-4" />
                    <span>Upload Photo</span>
                  </div>
                  <Input
                    id="avatar"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileUpload}
                  />
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={profileData.displayName}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    displayName: e.target.value,
                  }))
                }
                placeholder="Enter your display name"
              />
            </div>

            {profileData.currentLevel && (
              <div className="space-y-2">
                <Label>Current CEFR Level</Label>
                <div className="p-3 bg-gray-50 rounded-md">
                  <p className="font-medium text-lg">{profileData.currentLevel}</p>
                  <p className="text-sm text-gray-600">
                    {getLevelDescription(profileData.currentLevel)}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Goals</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="learningGoal">What do you want to achieve?</Label>
              <Input
                id="learningGoal"
                value={profileData.learningGoal}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    learningGoal: e.target.value,
                  }))
                }
                placeholder="E.g., Improve business English"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetLevel">Target CEFR Level</Label>
              <select
                id="targetLevel"
                className="w-full p-2 border rounded-md"
                value={profileData.targetLevel}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    targetLevel: e.target.value,
                  }))
                }
              >
                <option value="A1">A1 - Beginner</option>
                <option value="A2">A2 - Elementary</option>
                <option value="B1">B1 - Intermediate</option>
                <option value="B2">B2 - Upper Intermediate</option>
                <option value="C1">C1 - Advanced</option>
                <option value="C2">C2 - Mastery</option>
              </select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="targetDate">Target Date</Label>
              <Input
                id="targetDate"
                type="date"
                value={profileData.targetDate}
                onChange={(e) =>
                  setProfileData((prev) => ({
                    ...prev,
                    targetDate: e.target.value,
                  }))
                }
              />
            </div>

            <Button onClick={handleProfileUpdate} className="w-full">
              Save Changes
            </Button>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              CEFR Level Roadmap
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-gray-600">
                  <span>{profileData.currentLevel || 'Not assessed'}</span>
                  <span>{profileData.targetLevel}</span>
                </div>
                <Progress value={calculateProgressToNextLevel()} />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-sm font-medium">Progress to Goal</span>
                  <span className="text-sm text-gray-600">{calculateProgressToNextLevel()}%</span>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="h-4 w-4" />
                <span>{getRemainingTime()}</span>
              </div>

              <div className="grid gap-4 mt-4">
                {CEFR_LEVELS.map((level, index) => {
                  const currentLevelIndex = CEFR_LEVELS.indexOf(profileData.currentLevel);
                  const targetLevelIndex = CEFR_LEVELS.indexOf(profileData.targetLevel);
                  const isCompleted = currentLevelIndex >= index;
                  const isCurrent = currentLevelIndex === index;
                  const isTarget = targetLevelIndex === index;

                  return (
                    <div
                      key={level}
                      className={`p-3 rounded-lg border ${
                        isCurrent
                          ? 'bg-blue-50 border-blue-200'
                          : isCompleted
                          ? 'bg-green-50 border-green-200'
                          : isTarget
                          ? 'bg-yellow-50 border-yellow-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{level}</span>
                        <span className="text-sm">
                          {isCurrent && '(Current)'}
                          {isTarget && '(Target)'}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {getLevelDescription(level)}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProfilePage;
