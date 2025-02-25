
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Input } from "./ui/input";
import LogoutButton from "./auth/LogoutButton";

const Layout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

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

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      let result;
      if (isLogin) {
        result = await supabase.auth.signInWithPassword({
          email,
          password,
        });
      } else {
        result = await supabase.auth.signUp({
          email,
          password,
        });
      }

      if (result.error) throw result.error;

      setIsAuthDialogOpen(false);
      setEmail("");
      setPassword("");
      
      toast({
        title: isLogin ? "Successfully signed in" : "Account created",
        description: isLogin ? "Welcome back!" : "Please check your email to verify your account",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleGoogleLogin = async () => {
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
      {!user && (
        <div className="w-full bg-white border-b p-4 flex justify-center items-center space-x-4">
          <p className="text-gray-600">Sign in to track your progress and earn certificates</p>
          <div className="space-x-2">
            <Button onClick={() => {
              setIsLogin(true);
              setIsAuthDialogOpen(true);
            }} variant="default">
              Sign In
            </Button>
            <Button onClick={() => {
              setIsLogin(false);
              setIsAuthDialogOpen(true);
            }} variant="outline">
              Sign Up
            </Button>
          </div>
        </div>
      )}

      {user && (
        <div className="w-full bg-white border-b p-4 flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-sm text-gray-600 mr-2">Signed in as:</span>
            <span className="font-medium">{user.email}</span>
          </div>
          <LogoutButton />
        </div>
      )}

      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isLogin ? "Sign In" : "Create Account"}</DialogTitle>
            <DialogDescription>
              {isLogin
                ? "Sign in to your account to continue"
                : "Create a new account to get started"}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEmailAuth} className="space-y-4">
            <div>
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit">
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
              <Button type="button" variant="outline" onClick={handleGoogleLogin}>
                Continue with Google
              </Button>
            </div>
            <Button
              type="button"
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <div className="flex flex-col md:flex-row min-h-screen">
        <Navigation />
        <main className="flex-1 p-4 md:p-8 mb-16 md:mb-0 md:ml-64">
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
        </main>
      </div>
    </div>
  );
};

export default Layout;
