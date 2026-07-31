
import { useProfileData } from "@/hooks/useProfileData";
import ProfileLoadingState from "@/components/profile/ProfileLoadingState";
import AuthRequiredState from "@/components/profile/AuthRequiredState";
import NoProfileState from "@/components/profile/NoProfileState";
import ProfileLayout from "@/components/profile/ProfileLayout";

const ProfilePage = () => {
  const { user, profile, isLoading, authError, debugInfo, refetchProfile } = useProfileData();

  if (isLoading) {
    return <ProfileLoadingState />;
  }

  if (!user || authError) {
    return <AuthRequiredState />;
  }

  // Check if user has no profile at all
  if (!profile) {
    return (
      <NoProfileState
        user={user}
        onProfileUpdate={refetchProfile}
      />
    );
  }

  // Check if user has a profile but no role assigned or missing language setup
  if (!profile.role || profile.role.trim() === '' || !profile.native_language || !profile.target_language) {
    return (
      <NoProfileState
        user={user}
        onProfileUpdate={refetchProfile}
      />
    );
  }

  return (
    <ProfileLayout
      user={user}
      profile={profile}
      debugInfo={debugInfo}
      onProfileUpdate={refetchProfile}
    />
  );
};

export default ProfilePage;
