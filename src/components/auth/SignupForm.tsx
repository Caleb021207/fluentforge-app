
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { useLocalization } from "@/hooks/useLocalization";
import { Loader2 } from "lucide-react";

interface SignupFormProps {
  onClose: (open: boolean) => void;
}

const SignupForm = ({ onClose }: SignupFormProps) => {
  const { t } = useLocalization();
  const [passcode, setPasscode] = useState("");
  
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    isLoading, 
    authError,
    setIsLogin
  } = useAuthFlow(() => {
    onClose(false);
  });

  // Initialize with signup mode
  React.useEffect(() => {
    setIsLogin(false);
  }, [setIsLogin]);

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const passcodeInput = form.elements.namedItem('passcode') as HTMLInputElement;
    const passcode = passcodeInput?.value || '';
    
    // Call handleEmailAuth with the passcode
    handleEmailAuth(e, passcode);
  };

  const handleEmailAuth = (e: React.FormEvent, passcode?: string) => {
    e.preventDefault();
    // This is a placeholder for the actual auth implementation
    console.log("Signup with:", { email, password, passcode });
    
    // Simulate success and close dialog
    setTimeout(() => {
      onClose(false);
    }, 1500);
  };

  return (
    <form onSubmit={handleSignup} className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="email">{t("email")}</Label>
        <Input
          id="email"
          type="email"
          placeholder={t("enterEmail")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="password">{t("password")}</Label>
        <Input
          id="password"
          type="password"
          placeholder={t("enterPassword")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>

      <div className="grid gap-2">
        <Label htmlFor="passcode">{t("accessPasscode")}</Label>
        <Input
          id="passcode"
          type="text"
          placeholder="Access code"
          value={passcode}
          onChange={(e) => setPasscode(e.target.value)}
          required
        />
      </div>

      {authError && (
        <div className="text-sm text-red-500">{authError}</div>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
            {t("processing")}
          </>
        ) : (
          t("register")
        )}
      </Button>
    </form>
  );
};

export default SignupForm;
