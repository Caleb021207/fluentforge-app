
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";

interface LogoutButtonProps {
  iconOnly?: boolean;
  onClose?: () => void;
}

const LogoutButton = ({ iconOnly = false, onClose }: LogoutButtonProps) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { t } = useLocalization();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: t("loggedOutSuccessfully"),
        description: t("youHaveBeenSignedOut"),
      });
      
      if (onClose) {
        onClose();
      }
      
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: t("errorSigningOut"),
        description: t("errorOccurredWhileSigningOut"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (iconOnly) {
    return (
      <Button 
        onClick={handleLogout} 
        variant="ghost" 
        className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        disabled={isLoading}
      >
        <LogOut className="h-5 w-5 mr-2" />
        <span>{t("signOut")}</span>
      </Button>
    );
  }

  return (
    <Button 
      onClick={handleLogout} 
      variant="outline" 
      size="sm"
      disabled={isLoading}
      className="flex items-center gap-2"
    >
      <LogOut className="h-4 w-4" />
      <span>{t("logout")}</span>
    </Button>
  );
};

export default LogoutButton;
