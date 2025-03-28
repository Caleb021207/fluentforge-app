
import React from "react";
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
                ? t("processing")
                : isLogin ? t("signIn") : t("createAccount")}
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
  );
};

export default AuthDialog;
