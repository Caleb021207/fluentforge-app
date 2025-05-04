
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuthFlow } from "@/hooks/useAuthFlow";
import { useLocalization } from "@/hooks/useLocalization";
import { Loader2 } from "lucide-react";

interface LoginFormProps {
  onClose: (open: boolean) => void;
}

const LoginForm = ({ onClose }: LoginFormProps) => {
  const { t } = useLocalization();
  const { 
    email, 
    setEmail, 
    password, 
    setPassword, 
    isLoading, 
    handleEmailAuth, 
    authError 
  } = useAuthFlow(() => {
    onClose(false);
  });

  return (
    <form onSubmit={handleEmailAuth} className="space-y-4">
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
        <div className="flex items-center justify-between">
          <Label htmlFor="password">{t("password")}</Label>
          <Button variant="link" className="h-auto p-0" type="button">
            {t("forgotPassword")}
          </Button>
        </div>
        <Input
          id="password"
          type="password"
          placeholder={t("enterPassword")}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
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
          t("login")
        )}
      </Button>
    </form>
  );
};

export default LoginForm;
