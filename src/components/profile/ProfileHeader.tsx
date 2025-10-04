
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ExtendedUserProfile } from "@/types/school";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface ProfileHeaderProps {
  user: SupabaseUser;
  profile: ExtendedUserProfile;
  showDebug: boolean;
  onToggleDebug: () => void;
}

const ProfileHeader = ({ user, profile, showDebug, onToggleDebug }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center gap-3 mb-6">
      <User className="h-8 w-8" />
      <div className="flex-1">
        <h1 className="text-3xl font-bold">
          My Profile
        </h1>
        <p className="text-foreground">
          {profile.display_name || user.email} • {profile.role}
        </p>
      </div>
      <Button 
        variant="outline" 
        size="sm" 
        onClick={onToggleDebug}
      >
        {showDebug ? "Hide" : "Show"} Debug
      </Button>
    </div>
  );
};

export default ProfileHeader;
