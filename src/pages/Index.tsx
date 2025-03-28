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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const nativeLanguages = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "italian", label: "Italian" },
  { value: "portuguese", label: "Portuguese" },
  { value: "russian", label: "Russian" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
];

const targetLanguages = [
  { value: "english", label: "English" },
  { value: "spanish", label: "Spanish" },
  { value: "french", label: "French" },
  { value: "german", label: "German" },
  { value: "italian", label: "Italian" },
  { value: "portuguese", label: "Portuguese" },
  { value: "russian", label: "Russian" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
  { value: "korean", label: "Korean" },
];

const availableLanguagePairs = [
  "english-spanish",
  "spanish-english",
];

const Index = () => {
  const { toast } = useToast();
  const [isAuthDialogOpen, setIsAuthDialogOpen] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [nativeLanguage, setNativeLanguage] = useState("");
  const [targetLanguage, setTargetLanguage] = useState("");
  const [hasStudyMaterials, setHasStudyMaterials] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser();
      setIsSignedIn(!!data.user);
    };
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkUser();
    });

    const savedNativeLanguage = localStorage.getItem("nativeLanguage");
    const savedTargetLanguage = localStorage.getItem("targetLanguage");
    
    if (savedNativeLanguage) setNativeLanguage(savedNativeLanguage);
    if (savedTargetLanguage) setTargetLanguage(savedTargetLanguage);

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (nativeLanguage && targetLanguage) {
      const languagePair = `${nativeLanguage}-${targetLanguage}`;
      setHasStudyMaterials(availableLanguagePairs.includes(languagePair));
      
      sessionStorage.setItem("languagePair", languagePair);
      sessionStorage.setItem("hasStudyMaterials", availableLanguagePairs.includes(languagePair).toString());
    }
  }, [nativeLanguage, targetLanguage]);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
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
          options: {
            data: {
              native_language: nativeLanguage || undefined,
              target_language: targetLanguage || undefined,
            }
          }
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
      
      if (nativeLanguage) localStorage.setItem("nativeLanguage", nativeLanguage);
      if (targetLanguage) localStorage.setItem("targetLanguage", targetLanguage);
      
    } catch (error: any) {
      console.error("Authentication error:", error);
      toast({
        title: "Error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: window.location.origin,
        }
      });
      
      if (error) throw error;
    } catch (error: any) {
      console.error("Google sign in error:", error);
      toast({
        title: "Error signing in",
        description: error.message || "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLanguageSelection = () => {
    if (nativeLanguage && targetLanguage) {
      localStorage.setItem("nativeLanguage", nativeLanguage);
      localStorage.setItem("targetLanguage", targetLanguage);
      
      const languagePair = `${nativeLanguage}-${targetLanguage}`;
      sessionStorage.setItem("languagePair", languagePair);
      sessionStorage.setItem("hasStudyMaterials", availableLanguagePairs.includes(languagePair).toString());
      
      toast({
        title: "Language preferences saved",
        description: `You're now learning ${targetLanguage} from ${nativeLanguage}`,
      });
    } else {
      toast({
        title: "Please select both languages",
        description: "You need to select both your native language and the language you want to learn",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8 max-w-2xl mx-auto p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl md:text-6xl font-bold text-lingua-text mb-4">
            Welcome to <span className="text-lingua-primary">Palavox</span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 mb-8">
            Your personal AI-powered language learning companion. Start your journey
            to fluency today.
          </p>
          
          <Card className="bg-white/90 backdrop-blur shadow-lg mb-8">
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Select Your Language Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div className="space-y-2">
                  <Label htmlFor="nativeLanguage">I speak:</Label>
                  <Select value={nativeLanguage} onValueChange={setNativeLanguage}>
                    <SelectTrigger id="nativeLanguage" className="w-full">
                      <SelectValue placeholder="Select your native language" />
                    </SelectTrigger>
                    <SelectContent>
                      {nativeLanguages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="targetLanguage">I want to learn:</Label>
                  <Select value={targetLanguage} onValueChange={setTargetLanguage}>
                    <SelectTrigger id="targetLanguage" className="w-full">
                      <SelectValue placeholder="Select language to learn" />
                    </SelectTrigger>
                    <SelectContent>
                      {targetLanguages.map((lang) => (
                        <SelectItem key={lang.value} value={lang.value}>
                          {lang.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <Button 
                onClick={handleLanguageSelection} 
                className="w-full"
                disabled={!nativeLanguage || !targetLanguage}
              >
                Save Language Preferences
              </Button>
              
              {nativeLanguage && targetLanguage && !hasStudyMaterials && (
                <Alert variant="warning" className="mt-4 bg-yellow-50 border-yellow-200">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <AlertDescription>
                    Study materials for learning {targetLanguage} from {nativeLanguage} are coming soon!
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
          
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
              <Button type="submit" className="text-sm" disabled={isLoading}>
                {isLoading 
                  ? "Processing..." 
                  : isLogin ? "Sign In" : "Create Account"}
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleGoogleLogin} 
                className="text-sm"
                disabled={isLoading}
              >
                {isLoading ? "Please wait..." : "Continue with Google"}
              </Button>
            </div>
            <Button
              type="button"
              variant="link"
              onClick={() => setIsLogin(!isLogin)}
              className="w-full text-sm"
              disabled={isLoading}
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
