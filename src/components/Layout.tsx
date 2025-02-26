
import { ReactNode } from "react";
import Navigation from "./Navigation";
import { Routes, Route } from "react-router-dom";
import Index from "../pages/Index";
import NotFound from "../pages/NotFound";
import PlacementQuiz from "../pages/PlacementQuiz";
import Lessons from "../pages/Lessons";
import Practice from "../pages/Practice";
import Certificates from "../pages/Certificates";
import ProgressPage from "../pages/Progress";
import ProfilePage from "../pages/Profile";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { User } from "@supabase/supabase-js";
import LogoutButton from "./auth/LogoutButton";

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-lingua-secondary to-white overflow-x-hidden w-full">
      {user && (
        <div className="w-full bg-white border-b py-2 px-4 flex flex-col sm:flex-row justify-between items-center space-y-2 sm:space-y-0">
          <div className="flex items-center">
            <span className="text-xs sm:text-sm text-gray-600 mr-1 sm:mr-2">Signed in as:</span>
            <span className="font-medium text-xs sm:text-sm truncate max-w-[150px] sm:max-w-none">{user.email}</span>
          </div>
          <LogoutButton />
        </div>
      )}

      <div className="flex flex-col md:flex-row min-h-screen">
        <Navigation />
        <main className="flex-1 p-3 sm:p-4 md:p-6 lg:p-8 mb-16 md:mb-0 md:ml-64 overflow-x-hidden w-full">
          <div className="max-w-full">
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/placement-quiz" element={<PlacementQuiz />} />
              <Route path="/lessons" element={<Lessons />} />
              <Route path="/practice" element={<Practice />} />
              <Route path="/certificates" element={<Certificates />} />
              <Route path="/progress" element={<ProgressPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
