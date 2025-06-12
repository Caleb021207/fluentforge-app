
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import NewLandingPage from "@/components/layout/NewLandingPage";
import { useLocalization } from "@/context/LocalizationContext";
import { motion } from "framer-motion";

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
          <p className="text-lg md:text-xl text-muted-foreground">
            {t("continueYourLearningJourney") || "Continue your language learning journey"}
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-card rounded-xl border shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-2">{t("textPractice") || "Text Practice"}</h3>
              <p className="text-muted-foreground">{t("practiceConversations") || "Practice conversations with AI"}</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-card rounded-xl border shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-2">{t("voiceChat") || "Voice Chat"}</h3>
              <p className="text-muted-foreground">{t("speakWithAI") || "Practice speaking with AI"}</p>
            </motion.div>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="p-6 bg-card rounded-xl border shadow-sm"
            >
              <h3 className="text-xl font-semibold mb-2">{t("trackProgress") || "Track Progress"}</h3>
              <p className="text-muted-foreground">{t("seeYourImprovement") || "See your improvement over time"}</p>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Index;
