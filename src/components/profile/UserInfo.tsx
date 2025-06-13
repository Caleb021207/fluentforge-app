
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Save, Loader2 } from "lucide-react";
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
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
  userRole?: string;
  userSchool?: string;
  onProfileUpdate?: () => void;
}

const UserInfo = ({ 
  user, 
  displayName, 
  setProfileData, 
  avatarUrl, 
  setAvatarUrl,
  userRole,
  userSchool,
  onProfileUpdate
}: UserInfoProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);
  const { currentLanguage } = useLocalization();

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
          title: "Success",
          description: "Profile information updated successfully",
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: "Error",
        description: "Failed to update profile information. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!event.target.files || !event.target.files[0] || !user) return;

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      try {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        setAvatarUrl(publicUrl);

        const updatedProfile = await updateUserProfile(user.id, { 
          avatar_url: publicUrl 
        });

        if (updatedProfile) {
          toast({
            title: "Success",
            description: "Profile picture updated successfully",
          });
        }
      } catch (error) {
        console.error('Error uploading to avatars bucket:', error);
        toast({
          title: "Error",
          description: "Failed to upload profile picture. Storage bucket may not exist.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: "Error",
        description: "Failed to upload profile picture",
        variant: "destructive",
      });
    }
  };

  const handleCodeProcessed = () => {
    // Trigger profile refresh
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
            {currentLanguage === "spanish" ? "Información Personal" : "Personal Information"}
          </CardTitle>
          <Button
            variant="outline" 
            size="sm"
            onClick={handleEditToggle}
          >
            {isEditing 
              ? (currentLanguage === "spanish" ? "Cancelar" : "Cancel") 
              : (currentLanguage === "spanish" ? "Editar" : "Edit")}
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col items-center space-y-4 mb-6">
            <div className="relative w-32 h-32 rounded-full overflow-hidden bg-gray-100">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gray-200">
                  <span className="text-gray-500 text-4xl">
                    {displayName.charAt(0).toUpperCase() || "U"}
                  </span>
                </div>
              )}
            </div>
            <div>
              <Label htmlFor="avatar" className="cursor-pointer">
                <div className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800">
                  <Upload className="w-4 h-4" />
                  <span>
                    {currentLanguage === "spanish" ? "Subir Foto" : "Upload Photo"}
                  </span>
                </div>
                <Input
                  id="avatar"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileUpload}
                />
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="displayName">
              {currentLanguage === "spanish" ? "Nombre de Usuario" : "Display Name"}
            </Label>
            {isEditing ? (
              <Input
                id="displayName"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                placeholder={currentLanguage === "spanish" 
                  ? "Ingresa tu nombre de usuario" 
                  : "Enter your display name"}
              />
            ) : (
              <Input
                id="displayName"
                value={displayName}
                readOnly
                className="bg-gray-50"
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
                  {currentLanguage === "spanish" ? "Guardando..." : "Saving..."}
                </>
              ) : (
                <>
                  <Save className="mr-2 h-4 w-4" />
                  {currentLanguage === "spanish" ? "Guardar Cambios" : "Save Changes"}
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
