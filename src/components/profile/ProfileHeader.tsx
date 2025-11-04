
import { User } from "lucide-react";
import { ExtendedUserProfile } from "@/types/school";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface ProfileHeaderProps {
  user: SupabaseUser;
  profile: ExtendedUserProfile;
}

const ProfileHeader = ({ user, profile }: ProfileHeaderProps) => {
  return (
    <div className="flex items-center gap-3 mb-8 justify-center md:justify-start">
      <User className="h-10 w-10 md:h-12 md:w-12 text-primary" />
      <div className="flex-1 text-center md:text-left">
        <h1 className="text-4xl md:text-5xl font-bold gradient-text mb-2">
          My Profile
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground">
          {profile.display_name || user.email} • {profile.role}
        </p>
      </div>
    </div>
  );
};

export default ProfileHeader;
