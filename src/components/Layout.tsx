
import { ReactNode } from "react";
import Navigation from "./Navigation";
import { Routes, Route } from "react-router-dom";
import Index from "../pages/Index";
import NotFound from "../pages/NotFound";
import PlacementQuiz from "../pages/PlacementQuiz";
import Lessons from "../pages/Lessons";
import Practice from "../pages/Practice";
import Certificates from "../pages/Certificates";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import { Textarea } from "./ui/textarea";

const Layout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (error) throw error;
    } catch (error) {
      toast({
        title: "Error signing in",
        description: "Please try again later",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-lingua-secondary to-white">
      <Textarea 
        className="w-full h-24 p-4 font-mono text-sm" 
        value='<meta name="google-site-verification" content="rzbcrRRdlW8pdBIDqgmE6W_R8U1jDjrRAozB5I0YcuI" />'
        readOnly
      />
      {!user && (
        <div className="w-full bg-white border-b p-4 flex justify-center items-center space-x-4">
          <p className="text-gray-600">Sign in to track your progress and earn certificates</p>
          <Button onClick={handleLogin} variant="default">
            Sign in with Google
          </Button>
        </div>
      )}
      <div className="flex flex-col md:flex-row min-h-screen">
        <Navigation />
        <main className="flex-1 p-4 md:p-8 mb-16 md:mb-0 md:ml-64">
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/placement-quiz" element={<PlacementQuiz />} />
            <Route path="/lessons" element={<Lessons />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/certificates" element={<Certificates />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </div>
  );
};

export default Layout;
