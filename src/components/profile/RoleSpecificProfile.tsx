
import { ExtendedUserProfile } from "@/types/school";
import StudentProfile from "./StudentProfile";
import TeacherProfile from "./TeacherProfile";
import AdminProfile from "./AdminProfile";
import DistrictProfile from "./DistrictProfile";
import NoProfileState from "./NoProfileState";
import { User as SupabaseUser } from "@supabase/supabase-js";

interface RoleSpecificProfileProps {
  profile: ExtendedUserProfile;
  user: SupabaseUser;
  onProfileUpdate: () => void;
}

const RoleSpecificProfile = ({ profile, user, onProfileUpdate }: RoleSpecificProfileProps) => {
  console.log('RoleSpecificProfile: Rendering profile for role:', profile.role);

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
      console.log('RoleSpecificProfile: Unknown role, showing NoProfileState for role:', profile.role);
      return (
        <NoProfileState 
          user={user} 
          onProfileUpdate={onProfileUpdate} 
        />
      );
  }
};

export default RoleSpecificProfile;
