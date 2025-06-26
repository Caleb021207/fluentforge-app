
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
    console.log('ProfilePage: No profile found, showing NoProfileState');
    return (
      <NoProfileState 
        user={user} 
        onProfileUpdate={refetchProfile} 
      />
    );
  }

  // Check if user has a profile but no role assigned
  if (!profile.role || profile.role.trim() === '') {
    console.log('ProfilePage: Profile exists but no role assigned, role:', profile.role);
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
