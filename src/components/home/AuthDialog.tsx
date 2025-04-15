
import React, { useState, useEffect } from "react";
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
import { AlertCircle, RefreshCw } from "lucide-react";

interface AuthDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  isLogin: boolean;
  setIsLogin: (isLogin: boolean) => void;
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  handleEmailAuth: (e: React.FormEvent, passcode?: string) => void;
  isLoading: boolean;
  authError?: string | null;
  retryCount?: number;
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
  isLoading,
  authError,
  retryCount = 0
}: AuthDialogProps) => {
  const { t } = useLocalization();
  const [passcode, setPasscode] = useState("");
  const [passcodeError, setPasscodeError] = useState(false);
  
  // Reset passcode error when dialog opens/closes or login mode changes
  useEffect(() => {
    setPasscodeError(false);
    setPasscode("");
  }, [isOpen, isLogin]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleEmailAuth(e, passcode);
  };
  
  const isNetworkError = authError?.includes("Connection") || 
                          authError?.includes("Network") || 
                          authError?.includes("fetch");
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-w-[90vw] rounded-lg">
        <DialogHeader>
          <DialogTitle className="text-lg">{isLogin ? t("signIn") : t("createAccount")}</DialogTitle>
          <DialogDescription>
            {isLogin
              ? t("signInToContinue") 
              : t("createAccountToGetStarted")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Input
              type="email"
              placeholder={t("email")}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="text-sm"
            />
          </div>
          <div>
            <Input
              type="password"
              placeholder={t("password")}
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
                placeholder={t("accessPasscode")}
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  if (passcodeError) setPasscodeError(false);
                }}
                required
                className={`text-sm ${passcodeError || authError ? 'border-red-500' : ''}`}
              />
              {(passcodeError || authError) && (
                <div className="flex items-center mt-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4 mr-1" />
                  <span>{authError || t("incorrectPasscode")}</span>
                </div>
              )}
            </div>
          )}
          
          {isLogin && authError && (
            <div className="flex items-center mt-2 text-red-500 text-sm">
              {isNetworkError ? <RefreshCw className="h-4 w-4 mr-1 animate-spin" /> : <AlertCircle className="h-4 w-4 mr-1" />}
              <span>{authError}</span>
            </div>
          )}
          
          <div className="flex flex-col gap-2">
            <Button type="submit" className="text-sm" disabled={isLoading}>
              {isLoading 
                ? retryCount > 0 ? `${t("retrying")}... (${retryCount}/3)` : t("processing")
                : isLogin ? t("signIn") : t("createAccount")}
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
            disabled={isLoading}
          >
            {isLogin
              ? t("dontHaveAccount") 
              : t("alreadyHaveAccount")}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;
