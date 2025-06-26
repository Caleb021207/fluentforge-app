import { useState, useEffect } from "react";
import { Loader2, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";
import { ExtendedUserProfile } from "@/types/school";
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
      console.log('ProfilePage: Starting fetchUserData');
      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth error:', error);
        setAuthError(true);
        setIsLoading(false);
        return;
      }
      
      setUser(user);
      
      if (user) {
        console.log('ProfilePage: Fetching profile for user:', user.id);
        
        try {
          // Fetch basic profile first
          const { data: basicProfile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          console.log('ProfilePage: Basic profile result:', basicProfile, 'Error:', profileError);
          
          if (profileError) {
            console.log('ProfilePage: No profile found, showing NoProfileState');
            setProfile(null);
            setDebugInfo({
              profileError,
              userId: user.id,
              step: 'no_profile_found'
            });
            return;
          }

          // If we have a basic profile, now fetch additional data based on role
          let extendedProfile: ExtendedUserProfile = {
            ...basicProfile,
            school: null,
            district_associations: []
          };

          // If user is district admin, fetch district associations
          if (basicProfile.role === 'district') {
            console.log('ProfilePage: Fetching district associations for district admin');
            const { data: districtAssociations, error: districtError } = await supabase
              .from('district_users')
              .select(`
                *,
                school_districts (
                  id,
                  name,
                  code,
                  created_at,
                  updated_at
                )
              `)
              .eq('user_id', user.id);

            if (!districtError && districtAssociations) {
              extendedProfile.district_associations = districtAssociations;
              console.log('ProfilePage: District associations:', districtAssociations);
            }
          }

          // If user has a school_id, fetch school info
          if (basicProfile.school_id) {
            console.log('ProfilePage: Fetching school info for school_id:', basicProfile.school_id);
            const { data: schoolData, error: schoolError } = await supabase
              .from('schools')
              .select('*')
              .eq('id', basicProfile.school_id)
              .single();

            if (!schoolError && schoolData) {
              extendedProfile.school = schoolData;
              console.log('ProfilePage: School data:', schoolData);
            }
          }

          setProfile(extendedProfile);
          setDebugInfo({
            extendedProfile,
            userId: user.id,
            step: 'profile_loaded_successfully'
          });

        } catch (error) {
          console.error('ProfilePage: Profile fetch error:', error);
          setProfile(null);
          setDebugInfo({
            profileError: error,
            userId: user.id,
            step: 'profile_fetch_error'
          });
        }
      }
    } catch (error) {
      console.error('ProfilePage: Top-level error:', error);
      setAuthError(true);
      setDebugInfo({
        topLevelError: error,
        step: 'top_level_error'
      });
    } finally {
      if (showLoadingState) setIsLoading(false);
    }
  };

  const handleSignIn = () => {
    navigate("/");
  };

  const handleProfileUpdate = async () => {
    console.log('ProfilePage: Profile update requested, refreshing data...');
    await fetchUserData(false);
  };

  useEffect(() => {
    fetchUserData();
  }, []);

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

  // Check if user has no profile at all
  if (!profile) {
    console.log('ProfilePage: No profile found, showing NoProfileState');
    return (
      <NoProfileState 
        user={user} 
        onProfileUpdate={handleProfileUpdate} 
      />
    );
  }

  // Check if user has a profile but no role assigned - this is the key fix
  if (!profile.role || profile.role.trim() === '') {
    console.log('ProfilePage: Profile exists but no role assigned, role:', profile.role);
    return (
      <NoProfileState 
        user={user} 
        onProfileUpdate={handleProfileUpdate} 
      />
    );
  }

  console.log('ProfilePage: Rendering profile for role:', profile.role);

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
        console.log('ProfilePage: Unknown role, showing NoProfileState for role:', profile.role);
        return (
          <NoProfileState 
            user={user} 
            onProfileUpdate={handleProfileUpdate} 
          />
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
