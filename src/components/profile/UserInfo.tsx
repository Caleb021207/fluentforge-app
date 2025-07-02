
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { User } from "@supabase/supabase-js";
import { updateUserProfile } from "@/utils/profileUtils";
import { supabase } from "@/integrations/supabase/client";
import { useLocalization } from "@/context/LocalizationContext";
import AccessCodeInput from "./AccessCodeInput";

interface UserInfoProps {
  user: User | null;
  displayName: string;
  setProfileData: (data: any) => void;
  userRole?: string;
  userSchool?: string;
  onProfileUpdate?: () => void;
}

const UserInfo = ({ 
  user, 
  displayName, 
  setProfileData, 
  userRole,
  userSchool,
  onProfileUpdate
}: UserInfoProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);
  const { t } = useLocalization();

  const handleEditToggle = () => {
    if (isEditing) {
      setNewDisplayName(displayName);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      const updatedProfile = await updateUserProfile(user.id, { 
        display_name: newDisplayName 
      });

      if (updatedProfile) {
        setProfileData((prev: any) => ({
          ...prev,
          displayName: newDisplayName,
        }));

        setIsEditing(false);
        
        toast({
          title: t("success"),
          description: t("profileInformationUpdated"),
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: t("error"),
        description: t("failedToUpdateProfile"),
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };


  const handleCodeProcessed = () => {
    if (onProfileUpdate) {
      onProfileUpdate();
    }
  };

  return (
    <div className="space-y-6">
      {/* Personal Information Card */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>
            {t("personalInformation")}
          </CardTitle>
          <Button
            variant="outline" 
            size="sm"
            onClick={handleEditToggle}
          >
            {isEditing ? t("cancel") : t("edit")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-muted">
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-muted-foreground text-4xl">
                  {displayName.charAt(0).toUpperCase() || "U"}
                </span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">
              {t("displayName")}
            </Label>
            {isEditing ? (
              <Input
                id="displayName"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder={t("enterDisplayName")}
              />
            ) : (
              <Input
                id="displayName"
                value={displayName}
                readOnly
                className="bg-muted text-foreground"
              />
            )}
          </div>

          {isEditing && (
            <Button 
              className="w-full mt-4" 
              onClick={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("saving")}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {t("saveChanges")}
                </>
              )}
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Access Code Input */}
      <AccessCodeInput 
        onCodeProcessed={handleCodeProcessed}
        currentRole={userRole}
        currentAssignment={userSchool}
      />
    </div>
  );
};

export default UserInfo;
