
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import NewLandingPage from "@/components/layout/NewLandingPage";
import WelcomeAnimation from "@/components/welcome/WelcomeAnimation";

const Index = () => {
  const navigate = useNavigate();
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [showWelcomeAnimation, setShowWelcomeAnimation] = useState(false);

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

  // Check if this is the first visit
  useEffect(() => {
    const hasSeenWelcome = localStorage.getItem('palavox-welcome-seen');
    if (!hasSeenWelcome && !isLoading) {
      setShowWelcomeAnimation(true);
    }
  }, [isLoading]);

  // Redirect to profile page when user signs in
  useEffect(() => {
    if (isSignedIn && !isLoading) {
      navigate('/profile');
    }
  }, [isSignedIn, isLoading, navigate]);

  const handleWelcomeComplete = () => {
    localStorage.setItem('palavox-welcome-seen', 'true');
    setShowWelcomeAnimation(false);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isSignedIn) {
    if (showWelcomeAnimation) {
      return <WelcomeAnimation onComplete={handleWelcomeComplete} />;
    }
    return <NewLandingPage />;
  }

  // This return should not be reached due to the redirect, but kept as fallback
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
    </div>
  );
};

export default Index;
