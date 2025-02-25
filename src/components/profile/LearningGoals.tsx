
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LearningGoalsProps {
  user: User | null;
  profileData: {
    learningGoal: string;
    targetLevel: string;
    targetDate: string;
    displayName: string;
  };
  setProfileData: (data: any) => void;
  avatarUrl: string | null;
}

const LearningGoals = ({ user, profileData, setProfileData, avatarUrl }: LearningGoalsProps) => {
  const { toast } = useToast();

  const handleProfileUpdate = async () => {
    if (!user) return;
    
    try {
      const { error } = await supabase
        .from('user_profiles')
        .upsert({
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

  return (
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
              setProfileData((prev: any) => ({
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
              setProfileData((prev: any) => ({
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
              setProfileData((prev: any) => ({
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
  );
};

export default LearningGoals;
