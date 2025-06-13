
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import NewLandingPage from "@/components/layout/NewLandingPage";
import { useLocalization } from "@/context/LocalizationContext";
import { motion } from "framer-motion";
import HomeNavigationGrid from "@/components/home/HomeNavigationGrid";

const Index = () => {
  const { t } = useLocalization();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getUser();
        setIsSignedIn(!!data.user);
      } catch (error) {
        console.error('Error checking user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      setIsSignedIn(!!session?.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    return <NewLandingPage />;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          <h1 className="text-4xl md:text-6xl font-bold text-foreground">
            {t("welcomeBack") || "Welcome Back!"}
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-12">
            {t("continueYourLearningJourney") || "Continue your language learning journey"}
          </p>
          
          <HomeNavigationGrid />
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
