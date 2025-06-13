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


const ProfilePage = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profile, setProfile] = useState<ExtendedUserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t, currentLanguage } = useLocalization();

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
        try {
          const extendedProfile = await getExtendedUserProfile(user.id);
          console.log('Profile fetch result:', extendedProfile);
          setProfile(extendedProfile);
        } catch (error) {
          console.error('Error fetching extended profile:', error);
          // Don't show toast error on initial load if profile doesn't exist yet
          if (showLoadingState) {
            toast({
              title: "Error loading profile",
              description: "There was a problem loading your profile data.",
              variant: "destructive"
            });
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

  useEffect(() => {
    fetchUserData();
  }, [toast]);

  const handleSignIn = () => {
    navigate("/");
  };

  const handleProfileUpdate = async () => {
    console.log('Profile update requested, refreshing data...');
    
    // Add a small delay to ensure database changes are committed
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Refresh the profile data
    await fetchUserData(false);
    
    // Force a page refresh if profile still isn't showing correctly
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

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
          {currentLanguage === "spanish" ? "Autenticación Requerida" : "Authentication Required"}
        </h1>
        <p className="mb-6">
          {currentLanguage === "spanish" 
            ? "Por favor inicia sesión para ver tu perfil." 
            : "Please sign in to view your profile."}
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

  // Show NoProfileState when user exists but profile is null/undefined or has no role
  if (!profile || !profile.role) {
    return (
      <NoProfileState 
        user={user} 
        onProfileUpdate={handleProfileUpdate} 
      />
    );
  }

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'student': return currentLanguage === "spanish" ? "Estudiante" : "Student";
      case 'teacher': return currentLanguage === "spanish" ? "Profesor" : "Teacher";
      case 'admin': return currentLanguage === "spanish" ? "Administrador" : "Administrator";
      case 'district': return currentLanguage === "spanish" ? "Distrito" : "District Admin";
      default: return role;
    }
  };

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
            <h3 className="text-lg font-medium mb-2">Role Not Assigned</h3>
            <p className="text-muted-foreground">
              Please use an access code to assign your role in the system.
            </p>
          </div>
        );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <User className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">
            {currentLanguage === "spanish" ? "Mi Perfil" : "My Profile"}
          </h1>
          <p className="text-muted-foreground">
            {profile.display_name || user.email} • {getRoleDisplayName(profile.role)}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* User Info Card - Always visible */}
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

        {/* Role-specific content */}
        <div className="lg:col-span-2">
          {renderRoleSpecificProfile()}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
