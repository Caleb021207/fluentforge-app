
import { useState, useEffect } from "react";
import { Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";
import { ExtendedUserProfile } from "@/types/school";
import { getExtendedUserProfile } from "@/utils/schoolUtils";
import StudentProfile from "@/components/profile/StudentProfile";
import TeacherProfile from "@/components/profile/TeacherProfile";
import AdminProfile from "@/components/profile/AdminProfile";
import DistrictProfile from "@/components/profile/DistrictProfile";
import UserInfo from "@/components/profile/UserInfo";
import NoProfileState from "@/components/profile/NoProfileState";
import AuthDebugPanel from "@/components/debug/AuthDebugPanel";

const ProfilePage = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [showDebug, setShowDebug] = useState(false);
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLocalization();

  const fetchUserData = async (showLoadingState = true) => {
    if (showLoadingState) setIsLoading(true);
    
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth error:', error);
        setAuthError(true);
        setIsLoading(false);
        return;
      }
      
      setUser(user);
      
      if (user) {
        console.log('Fetching profile for user:', user.id);
        
        // First check basic profile
        const { data: basicProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        console.log('Basic profile:', basicProfile, 'Error:', profileError);

        // Check district associations for district admin users
        const { data: districtUsers, error: districtError } = await supabase
          .from('district_users')
          .select('*, school_districts(*)')
          .eq('user_id', user.id);

        console.log('District associations:', districtUsers, 'Error:', districtError);

        setDebugInfo({
          basicProfile,
          profileError,
          districtUsers,
          districtError,
          userId: user.id
        });

        try {
          const extendedProfile = await getExtendedUserProfile(user.id);
          console.log('Extended profile fetch result:', extendedProfile);
          setProfile(extendedProfile);
        } catch (error) {
          console.error('Error fetching extended profile:', error);
          
          // If extended profile fails but we have a basic profile, use that
          if (basicProfile) {
            console.log('Using basic profile as fallback');
            setProfile({
              ...basicProfile,
              school: null,
              district_associations: districtUsers || []
            } as ExtendedUserProfile);
          }
        }
      }
    } catch (error) {
      console.error('Error getting user:', error);
      setAuthError(true);
    } finally {
      if (showLoadingState) setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate("/");
  };

  const handleProfileUpdate = async () => {
    console.log('Profile update requested, refreshing data...');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    await fetchUserData(false);
    
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  useEffect(() => {
    fetchUserData();
  }, [toast]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user || authError) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">
          {t("authenticationRequired")}
        </h1>
        <p className="mb-6">
          {t("pleaseSignInToViewProfile")}
        </p>
        <Button 
          onClick={handleSignIn} 
          className="bg-primary hover:bg-primary/90"
        >
          {t("signIn")}
        </Button>
      </div>
    );
  }

  // Check if user has no profile or role at all
  if (!profile) {
    return (
      <NoProfileState 
        user={user} 
        onProfileUpdate={handleProfileUpdate} 
      />
    );
  }

  // Check if user has a profile but no role assigned
  if (!profile.role) {
    return (
      <NoProfileState 
        user={user} 
        onProfileUpdate={handleProfileUpdate} 
      />
    );
  }

  const renderRoleSpecificProfile = () => {
    switch (profile.role) {
      case 'teacher':
        return <TeacherProfile profile={profile} />;
      case 'student':
        return <StudentProfile profile={profile} />;
      case 'admin':
        return <AdminProfile profile={profile} />;
      case 'district':
        return <DistrictProfile profile={profile} />;
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-lg font-medium mb-2">{t("roleNotAssigned")}</h3>
            <p className="text-muted-foreground">
              {t("pleaseUseAccessCode")}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8" />
        <div className="flex-1">
          <h1 className="text-3xl font-bold">
            {t("myProfile")}
          </h1>
          <p className="text-muted-foreground">
            {profile.display_name || user.email} • {t(profile.role)}
          </p>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setShowDebug(!showDebug)}
        >
          {showDebug ? "Hide" : "Show"} Debug
        </Button>
      </div>

      {showDebug && (
        <div className="mb-6 space-y-4">
          <AuthDebugPanel />
          {debugInfo && (
            <div className="bg-muted p-4 rounded">
              <h3 className="font-semibold mb-2">Profile Detection Debug:</h3>
              <pre className="text-xs overflow-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <UserInfo
            user={user}
            displayName={profile.display_name || ""}
            setProfileData={(data) => {
              if (typeof data === 'function') {
                setProfile(prev => prev ? { ...prev, display_name: data(prev).displayName } : null);
              } else {
                setProfile(prev => prev ? { ...prev, display_name: data.displayName } : null);
              }
            }}
            avatarUrl={profile.avatar_url}
            setAvatarUrl={(url) => setProfile(prev => prev ? { ...prev, avatar_url: url } : null)}
            userRole={profile.role}
            userSchool={profile.school?.name}
            onProfileUpdate={handleProfileUpdate}
          />
        </div>

        <div className="lg:col-span-2">
          {renderRoleSpecificProfile()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
