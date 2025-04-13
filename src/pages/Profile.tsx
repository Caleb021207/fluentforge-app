
import React, { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import UserInfo from "@/components/profile/UserInfo";
import ManualScoreForm from "@/components/profile/ManualScoreForm";
import { supabase } from "@/integrations/supabase/client";
import LearningGoals from "@/components/profile/LearningGoals";
import TierInfoCard from "@/components/profile/TierInfoCard";
import { getUserProfile } from "@/utils/profileUtils";
import { User } from "@supabase/supabase-js";
import { UserProfile } from "@/types/supabase"; // Import the UserProfile type

const Profile = () => {
  const { t } = useLocalization();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [profileData, setProfileData] = useState({
    displayName: "",
    avatarUrl: null as string | null,
    learningGoal: "",
    targetLevel: "B2",
    targetDate: ""
  });

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const loggedIn = !!data.session;
        setIsLoggedIn(loggedIn);
        
        if (loggedIn && data.session?.user) {
          setUser(data.session.user);
          
          // Fetch user profile data
          try {
            const profile = await getUserProfile(data.session.user.id) as UserProfile;
            if (profile) {
              setProfileData({
                displayName: profile.display_name || "",
                avatarUrl: profile.avatar_url || null,
                learningGoal: profile.learning_goal || "",
                targetLevel: profile.target_level || "B2",
                targetDate: profile.target_date || ""
              });
            }
          } catch (error) {
            console.error("Error fetching profile data:", error);
          }
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error checking session:", error);
        setLoading(false);
      }
    };
    
    checkSession();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsLoggedIn(!!session);
      if (session?.user) {
        setUser(session.user);
      } else {
        setUser(null);
      }
    });
    
    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lingua-primary"></div>
      </div>
    );
  }

  if (!isLoggedIn) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg shadow p-6 text-center">
          <h1 className="text-2xl font-bold text-gray-800 mb-4">{t("authRequired")}</h1>
          <p className="text-gray-600">{t("pleaseSignInDashboard")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">{t("languageLearningDashboard")}</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <UserInfo 
            user={user} 
            displayName={profileData.displayName} 
            setProfileData={setProfileData} 
            avatarUrl={profileData.avatarUrl} 
            setAvatarUrl={(url) => setProfileData(prev => ({...prev, avatarUrl: url}))} 
          />
          <LearningGoals 
            user={user}
            profileData={profileData}
            setProfileData={setProfileData}
            avatarUrl={profileData.avatarUrl}
          />
          <ManualScoreForm />
        </div>
        
        <div className="space-y-8">
          <TierInfoCard />
        </div>
      </div>
    </div>
  );
};

export default Profile;
