
import { useState } from "react";
import { ExtendedUserProfile } from "@/types/school";
import { User as SupabaseUser } from "@supabase/supabase-js";
import ProfileHeader from "./ProfileHeader";
import ProfileDebugPanel from "./ProfileDebugPanel";
import UserInfo from "./UserInfo";
import RoleSpecificProfile from "./RoleSpecificProfile";

interface ProfileLayoutProps {
  user: SupabaseUser;
  profile: ExtendedUserProfile;
  debugInfo: any;
  onProfileUpdate: () => void;
}

const ProfileLayout = ({ user, profile, debugInfo, onProfileUpdate }: ProfileLayoutProps) => {
  const [showDebug, setShowDebug] = useState(false);

  const handleProfileDataUpdate = (data: any) => {
    // This would need to be passed up to update the profile state
    // For now, we'll just trigger a refresh
    onProfileUpdate();
  };

  return (
    <div className="space-y-6">
      <ProfileHeader
        user={user}
        profile={profile}
        showDebug={showDebug}
        onToggleDebug={() => setShowDebug(!showDebug)}
      />

      {showDebug && <ProfileDebugPanel debugInfo={debugInfo} />}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <UserInfo
            user={user}
            displayName={profile.display_name || ""}
            setProfileData={handleProfileDataUpdate}
            userRole={profile.role}
            userSchool={profile.school?.name}
            onProfileUpdate={onProfileUpdate}
          />
        </div>

        <div className="lg:col-span-2">
          <RoleSpecificProfile
            profile={profile}
            user={user}
            onProfileUpdate={onProfileUpdate}
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileLayout;
