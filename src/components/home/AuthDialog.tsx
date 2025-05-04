import React, { useState } from "react";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoginForm from "@/components/auth/LoginForm";
import SignupForm from "@/components/auth/SignupForm";
import { useLocalization } from "@/hooks/useLocalization";

interface AuthDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AuthDialog: React.FC<AuthDialogProps> = ({ open, onOpenChange }) => {
  const { t } = useLocalization();
  const [activeTab, setActiveTab] = useState("login");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("authentication")}</DialogTitle>
          <DialogDescription>
            {t("loginOrSignup")}
          </DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="login" className="space-y-4">
          <TabsList>
            <TabsTrigger value="login" onClick={() => setActiveTab("login")}>
              {t("login")}
            </TabsTrigger>
            <TabsTrigger value="signup" onClick={() => setActiveTab("signup")}>
              {t("signup")}
            </TabsTrigger>
          </TabsList>
          <TabsContent value="login">
            <LoginForm onClose={onOpenChange} />
          </TabsContent>
          <TabsContent value="signup">
            <SignupForm onClose={onOpenChange} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};

export default AuthDialog;

