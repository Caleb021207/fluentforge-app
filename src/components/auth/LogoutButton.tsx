
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";

interface LogoutButtonProps {
  iconOnly?: boolean;
  onClose?: () => void;
}

const LogoutButton = ({ iconOnly = false, onClose }: LogoutButtonProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { t } = useLocalization();

  const handleLogout = async () => {
    setIsLoading(true);
    
    try {
      await supabase.auth.signOut();
      
      toast({
        title: t("success"),
        description: t("logoutSuccess"),
      });
      
      navigate("/");
      
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Logout error:", error);
      toast({
        title: t("error"),
        description: t("errorOccurred"),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button
      variant="outline"
      className="w-full"
      onClick={handleLogout}
      disabled={isLoading}
    >
      <LogOut className="h-4 w-4 mr-2" />
      {iconOnly ? null : <span>{t("logout")}</span>}
      {isLoading && <span className="animate-spin ml-1">⟳</span>}
    </Button>
  );
};

export default LogoutButton;
