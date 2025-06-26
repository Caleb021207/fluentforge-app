
import { useProfileData } from "@/hooks/useProfileData";
import ProfileLoadingState from "@/components/profile/ProfileLoadingState";
import AuthRequiredState from "@/components/profile/AuthRequiredState";
import NoProfileState from "@/components/profile/NoProfileState";
import ProfileLayout from "@/components/profile/ProfileLayout";

const ProfilePage = () => {
  const { user, profile, isLoading, authError, debugInfo, refetchProfile } = useProfileData();

  console.log('🎯 ProfilePage render state:', {
    hasUser: !!user,
    hasProfile: !!profile,
    profileRole: profile?.role,
    isLoading,
    authError,
    debugInfo
  });

  if (isLoading) {
    console.log('⏳ Showing loading state');
    return <ProfileLoadingState />;
  }

  if (!user || authError) {
    console.log('🚫 No user or auth error, showing auth required');
    return <AuthRequiredState />;
  }

  // Check if user has no profile at all
  if (!profile) {
    console.log('❌ No profile found, showing NoProfileState');
    return (
      <NoProfileState 
        user={user} 
        onProfileUpdate={refetchProfile} 
      />
    );
  }

  // Check if user has a profile but no role assigned
  if (!profile.role || profile.role.trim() === '') {
    console.log('❌ Profile exists but no role assigned, role:', profile.role);
    return (
      <NoProfileState 
        user={user} 
        onProfileUpdate={refetchProfile} 
      />
    );
  }

  console.log('✅ Profile found with role:', profile.role, 'showing ProfileLayout');
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
