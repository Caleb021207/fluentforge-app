
import { motion } from "framer-motion";
import AuthDialog from "@/components/home/AuthDialog";
import LanguageSelectionCard from "@/components/home/LanguageSelectionCard";
import WelcomeSection from "@/components/home/WelcomeSection";
import HomeActions from "@/components/home/HomeActions";
import { useLanguagePreferences } from "@/hooks/useLanguagePreferences";
import { useAuthentication } from "@/hooks/useAuthentication";

const Index = () => {
  const {
    nativeLanguage,
    targetLanguage,
    hasStudyMaterials,
    setNativeLanguage,
    setTargetLanguage,
    handleLanguageSelection
  } = useLanguagePreferences();

  const {
    isSignedIn,
    isLoading,
    email,
    password,
    isAuthDialogOpen,
    isLogin,
    setEmail,
    setPassword,
    setIsAuthDialogOpen,
    setIsLogin,
    handleEmailAuth,
    handleGoogleLogin
  } = useAuthentication();

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto p-6">
        <WelcomeSection />
        
        <LanguageSelectionCard
          nativeLanguage={nativeLanguage}
          targetLanguage={targetLanguage}
          setNativeLanguage={setNativeLanguage}
          setTargetLanguage={setTargetLanguage}
          hasStudyMaterials={hasStudyMaterials}
          handleLanguageSelection={handleLanguageSelection}
        />
        
        <HomeActions 
          isSignedIn={isSignedIn} 
          onOpenAuthDialog={() => {
            setIsLogin(true);
            setIsAuthDialogOpen(true);
          }} 
        />
      </div>

      <AuthDialog
        isOpen={isAuthDialogOpen}
        onOpenChange={setIsAuthDialogOpen}
        isLogin={isLogin}
        setIsLogin={setIsLogin}
        email={email}
        setEmail={setEmail}
        password={password}
        setPassword={setPassword}
        handleEmailAuth={handleEmailAuth}
        handleGoogleLogin={handleGoogleLogin}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Index;
