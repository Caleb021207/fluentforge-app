
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';
import { useNavigate } from 'react-router-dom';
import { SwipeUpPanel } from '@/components/ui/swipe-up-panel';
import { Button } from '@/components/ui/button';
import { Triangle } from 'lucide-react';
import AuthDialog from '@/components/home/AuthDialog';
import LanguageSelectionCard from '@/components/home/LanguageSelectionCard';
import { useLocalization } from '@/context/LocalizationContext';
import { useAuthFlow } from '@/hooks/useAuthFlow';
import { useToast } from '@/hooks/use-toast';
import { hasStudyMaterials } from '@/utils/languageUtils';

interface NewLandingPageProps {
  onPlayWelcomeAnimation?: () => void;
}

const NewLandingPage: React.FC<NewLandingPageProps> = ({ onPlayWelcomeAnimation }) => {
  const { theme } = useTheme();
  const { t, setCurrentLanguage } = useLocalization();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [studyMaterialsAvailable, setStudyMaterialsAvailable] = useState(true);

  const handleAuthSuccess = () => {
    console.log('Auth success - navigating to profile');
    setIsAuthDialogOpen(false);
    navigate('/profile');
  };

  const {
    isLogin,
    setIsLogin,
    email,
    setEmail,
    password,
    setPassword,
    isLoading,
    handleEmailAuth,
    authError,
    retryCount
  } = useAuthFlow(handleAuthSuccess);

  const handleLanguageSelection = () => {
    if (nativeLanguage && targetLanguage) {
      localStorage.setItem("nativeLanguage", nativeLanguage);
      localStorage.setItem("targetLanguage", targetLanguage);
      
      const languagePair = `${nativeLanguage}-${targetLanguage}`;
      sessionStorage.setItem("languagePair", languagePair);
      
      const materialsAvailable = hasStudyMaterials(nativeLanguage, targetLanguage);
      sessionStorage.setItem("hasStudyMaterials", materialsAvailable.toString());
      
      setCurrentLanguage(nativeLanguage);
      
      toast({
        title: t("languagePreferencesSaved"),
        description: t("learningLanguageFromNative", {
          targetLanguage: t(`languages.${targetLanguage}`),
          nativeLanguage: t(`languages.${nativeLanguage}`)
        }),
      });
      
      setIsPanelOpen(false);
      window.location.reload();
    } else {
      toast({
        title: t("pleaseSelectBothLanguages"),
        description: t("youNeedToSelectBoth"),
        variant: "destructive",
      });
    }
  };

  console.log('NewLandingPage rendering with onPlayWelcomeAnimation:', !!onPlayWelcomeAnimation);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Triangle Button for Animation Replay - Always visible for debugging */}
      <Button
        variant="default"
        size="lg"
        onClick={() => {
          console.log('Play Animation button clicked');
          if (onPlayWelcomeAnimation) {
            onPlayWelcomeAnimation();
          } else {
            console.log('No onPlayWelcomeAnimation function provided');
          }
        }}
        className="fixed top-4 right-4 z-50 bg-red-500 hover:bg-red-600 text-white shadow-2xl border-4 border-white"
      >
        <Triangle className="h-6 w-6 mr-2" />
        PLAY ANIMATION
      </Button>
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 25% 25%, var(--primary) 2px, transparent 2px),
                           radial-gradient(circle at 75% 75%, var(--accent) 1px, transparent 1px)`,
          backgroundSize: '60px 60px, 40px 40px'
        }} />
      </div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
        className="text-center space-y-8 max-w-2xl mx-auto relative z-10"
      >
        {/* Logo */}
        <motion.div
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-8"
        >
          {theme === "dark" ? (
            <img 
              src="/lovable-uploads/c1a8d618-54a4-41f8-b53f-06f699ca6180.png" 
              alt="Palavox Logo" 
              className="w-80 h-80 md:w-96 md:h-96 object-contain"
            />
          ) : (
            <img 
              src="/lovable-uploads/6ec27db4-fc32-4cfe-a326-919be83e5960.png" 
              alt="Palavox Logo" 
              className="w-80 h-80 md:w-96 md:h-96 object-contain"
            />
          )}
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-4xl md:text-6xl font-bold text-foreground mb-4 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent"
        >
          {t("welcomeToLanguageLearning")}
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="text-lg md:text-xl text-muted-foreground mb-8"
        >
          {t("yourPersonalAICompanion")}
        </motion.p>

        {/* Swipe Up Indicator */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="cursor-pointer"
          onClick={() => setIsPanelOpen(true)}
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            className="flex flex-col items-center gap-4 p-6 rounded-2xl bg-card/50 backdrop-blur border hover:bg-card/70 transition-colors"
          >
            
            <p className="text-sm font-medium text-muted-foreground">
              Swipe up to get started
            </p>
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Swipe Up Panel */}
      <SwipeUpPanel
        isOpen={isPanelOpen}
        onOpenChange={setIsPanelOpen}
      >
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-center mb-6">Get Started</h2>
          
          <LanguageSelectionCard
            nativeLanguage={nativeLanguage}
            targetLanguage={targetLanguage}
            setNativeLanguage={setNativeLanguage}
            setTargetLanguage={setTargetLanguage}
            hasStudyMaterials={studyMaterialsAvailable}
            handleLanguageSelection={handleLanguageSelection}
          />

          <div className="flex gap-4 justify-center">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsLogin(true);
                setIsAuthDialogOpen(true);
              }}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg font-medium"
            >
              Sign In
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setIsLogin(false);
                setIsAuthDialogOpen(true);
              }}
              className="px-6 py-3 bg-accent text-accent-foreground rounded-lg font-medium"
            >
              Sign Up
            </motion.button>
          </div>
        </div>
      </SwipeUpPanel>

      {/* Auth Dialog */}
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
        isLoading={isLoading}
        authError={authError}
        retryCount={retryCount}
      />
    </div>
  );
};

export default NewLandingPage;
