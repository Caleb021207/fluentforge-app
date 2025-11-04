
import { ExtendedUserProfile } from "@/types/school";
import { User as SupabaseUser } from "@supabase/supabase-js";
import ProfileHeader from "./ProfileHeader";
import UserInfo from "./UserInfo";
import RoleSpecificProfile from "./RoleSpecificProfile";
import { motion } from "framer-motion";
import { GradientBlob } from "@/components/ui/decorative-elements";

interface ProfileLayoutProps {
  user: SupabaseUser;
  profile: ExtendedUserProfile;
  debugInfo: any;
  onProfileUpdate: () => void;
}

const ProfileLayout = ({ user, profile, debugInfo, onProfileUpdate }: ProfileLayoutProps) => {
  const handleProfileDataUpdate = (data: any) => {
    // This would need to be passed up to update the profile state
    // For now, we'll just trigger a refresh
    onProfileUpdate();
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="space-y-6 relative z-10 p-4 md:p-6">
        <motion.div 
          initial={{ opacity: 0, y: -20 }} 
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <ProfileHeader user={user} profile={profile} />
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ delay: 0.1, duration: 0.4 }} 
          className="grid gap-6 lg:grid-cols-3"
        >
          <motion.div 
            className="lg:col-span-1"
            whileHover={{ scale: 1.01 }}
            transition={{ duration: 0.2 }}
          >
            <UserInfo user={user} displayName={profile.display_name || ""} setProfileData={handleProfileDataUpdate} userRole={profile.role} userSchool={profile.school?.name} onProfileUpdate={onProfileUpdate} />
          </motion.div>
          <motion.div 
            className="lg:col-span-2"
            whileHover={{ scale: 1.005 }}
            transition={{ duration: 0.2 }}
          >
            <RoleSpecificProfile profile={profile} user={user} onProfileUpdate={onProfileUpdate} />
          </motion.div>
        </motion.div>

      </div>
    </div>
  );
};

export default ProfileLayout;
