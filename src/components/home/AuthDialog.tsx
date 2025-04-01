
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useLocalization } from "@/context/LocalizationContext";
import { AlertCircle } from "lucide-react";
import { executeRecaptcha, verifyRecaptchaToken } from "@/utils/recaptcha";
import { useToast } from "@/hooks/use-toast";

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleEmailAuth: (e: React.FormEvent) => void;
  handleGoogleLogin: () => void;
  isLoading: boolean;
}

const AuthDialog = ({
  isOpen,
  onOpenChange,
  isLogin,
  setIsLogin,
  email,
  setEmail,
  password,
  setPassword,
  handleEmailAuth,
  handleGoogleLogin,
  isLoading
}: AuthDialogProps) => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  const [verifyingRecaptcha, setVerifyingRecaptcha] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Only check passcode for signup, not login
    if (!isLogin && passcode !== "08132010") {
      setPasscodeError(true);
      return;
    }
    
    setPasscodeError(false);

    // If it's signup, verify with reCAPTCHA first
    if (!isLogin) {
      try {
        setVerifyingRecaptcha(true);
        
        // Get reCAPTCHA token
        const token = await executeRecaptcha('signup');
        
        // Verify token with our edge function
        const verification = await verifyRecaptchaToken(token);
        
        if (!verification.success) {
          toast({
            title: "Verification Failed",
            description: verification.message || "Could not verify you are human. Please try again.",
            variant: "destructive"
          });
          setVerifyingRecaptcha(false);
          return;
        }
        
        // If score is low but not failing, we can show a warning
        if (verification.score && verification.score < 0.7) {
          console.warn(`Low reCAPTCHA score: ${verification.score}`);
        }
        
        setVerifyingRecaptcha(false);
      } catch (error) {
        console.error("reCAPTCHA verification error:", error);
        toast({
          title: "Verification Error",
          description: "Could not complete verification. Please try again.",
          variant: "destructive"
        });
        setVerifyingRecaptcha(false);
        return;
      }
    }
    
    // Proceed with authentication
    handleEmailAuth(e);
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] rounded-lg">
        <DialogHeader>
          <DialogTitle>{isLogin ? t("signIn") : t("createAccount")}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? "Sign in to your account to continue"
              : "Create a new account to get started"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
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
          
          {!isLogin && (
            <div>
              <Input
                type="password"
                placeholder="Access Passcode"
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (passcodeError) setPasscodeError(false);
                }}
                required
                className={`text-sm ${passcodeError ? 'border-red-500' : ''}`}
              />
              {passcodeError && (
                <div className="flex items-center mt-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>Incorrect passcode. Please try again.</span>
                </div>
              )}
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button type="submit" className="text-sm" disabled={isLoading || verifyingRecaptcha}>
              {isLoading || verifyingRecaptcha
                ? (verifyingRecaptcha ? "Verifying..." : t("processing"))
                : isLogin ? t("signIn") : t("createAccount")}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              onClick={handleGoogleLogin} 
              className="text-sm"
              disabled={isLoading || verifyingRecaptcha}
            >
              {isLoading || verifyingRecaptcha ? "Please wait..." : "Continue with Google"}
            </Button>
          </div>
          <Button
            type="button"
            variant="link"
            onClick={() => {
              setPasscode("");
              setPasscodeError(false);
              setIsLogin(!isLogin);
            }}
            className="w-full text-sm"
            disabled={isLoading || verifyingRecaptcha}
          >
            {isLogin
              ? "Don't have an account? Sign up"
              : "Already have an account? Sign in"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
