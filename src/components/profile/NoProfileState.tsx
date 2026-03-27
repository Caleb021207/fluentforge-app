
import { User } from "@supabase/supabase-js";
import OnboardingWizard from "@/components/onboarding/OnboardingWizard";

interface NoProfileStateProps {
  user: User;
  onProfileUpdate: () => void;
}

const NoProfileState = ({ user, onProfileUpdate }: NoProfileStateProps) => {
  return <OnboardingWizard user={user} onComplete={onProfileUpdate} />;
};

export default NoProfileState;
