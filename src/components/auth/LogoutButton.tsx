
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
  const { currentLanguage, t } = useLocalization();

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) throw error;
      
      toast({
        title: currentLanguage === "korean" ? "성공적으로 로그아웃되었습니다" : "Logged out successfully",
        description: currentLanguage === "korean" ? "계정에서 로그아웃되었습니다" : "You have been signed out of your account",
      });
      
      if (onClose) {
        onClose();
      }
      
      navigate("/");
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: currentLanguage === "korean" ? "로그아웃 오류" : "Error signing out",
        description: currentLanguage === "korean" ? "로그아웃 중 오류가 발생했습니다" : "An error occurred while signing out",
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
        <span>{currentLanguage === "korean" ? "로그아웃" : "Sign Out"}</span>
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
      <span>{currentLanguage === "korean" ? "로그아웃" : "Logout"}</span>
    </Button>
  );
};

export default LogoutButton;
