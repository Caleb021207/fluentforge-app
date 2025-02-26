
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const Index = () => {
  const { toast } = useToast();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsSignedIn(!!user);
    };
    checkUser();

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    return () => {
      subscription.unsubscribe();
    };
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
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6 max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-lingua-text mb-4">
            Welcome to <span className="text-lingua-primary">Lingua.AI</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Your personal AI-powered language learning companion. Start your journey
            to fluency today.
          </p>
          <div className="space-x-4">
            {!isSignedIn ? (
              <Button 
                size="lg" 
                className="bg-lingua-primary hover:bg-lingua-primary/90"
                onClick={() => {
                  setIsLogin(true);
                  setIsAuthDialogOpen(true);
                }}
              >
                Sign In
              </Button>
            ) : (
              <Link to="/profile">
                <Button 
                  size="lg" 
                  className="bg-lingua-primary hover:bg-lingua-primary/90"
                >
                  Go to Dashboard
                </Button>
              </Link>
            )}
            <Link to="/practice">
              <Button size="lg" variant="outline">
                Practice with AI
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      <Dialog open={isAuthDialogOpen} onOpenChange={setIsAuthDialogOpen}>
        <DialogContent className="sm:max-w-md max-w-[90vw] rounded-lg">
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
                className="text-sm"
              />
            </div>
            <div>
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="text-sm"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Button type="submit" className="text-sm">
                {isLogin ? "Sign In" : "Create Account"}
              </Button>
              <Button type="button" variant="outline" onClick={handleGoogleLogin} className="text-sm">
                Continue with Google
              </Button>
            </div>
            <Button
              type="button"
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-sm"
            >
              {isLogin
                ? "Don't have an account? Sign up"
                : "Already have an account? Sign in"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Index;
