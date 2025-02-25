
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface UserInfoProps {
  user: User | null;
  displayName: string;
  setProfileData: (data: any) => void;
  avatarUrl: string | null;
  setAvatarUrl: (url: string | null) => void;
}

const UserInfo = ({ 
  user, 
  displayName, 
  setProfileData, 
  avatarUrl, 
  setAvatarUrl 
}: UserInfoProps) => {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [newDisplayName, setNewDisplayName] = useState(displayName);
  const [isSaving, setIsSaving] = useState(false);

  const handleEditToggle = () => {
    if (isEditing) {
      // If we're exiting edit mode without saving, reset to original value
      setNewDisplayName(displayName);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    
    try {
      setIsSaving(true);
      
      // Check if user_profiles table exists
      const { error: checkError } = await supabase
        .from('user_profiles')
        .select('id')
        .limit(1);

      // If table doesn't exist, create it via RPC
      if (checkError && checkError.code === '42P01') {
        await supabase.rpc('create_profile_tables');
        
        // Insert the user profile after creating tables
        await supabase
          .from('user_profiles')
          .insert({
            id: user.id,
            display_name: newDisplayName,
            target_level: 'B2',
          });
      } else {
        // Update existing profile
        const { error } = await supabase
          .from('user_profiles')
          .update({ 
            display_name: newDisplayName 
          })
          .eq('id', user.id);

        if (error) {
          console.error('Update error:', error);
          // If we get "not found" error, try inserting instead
          if (error.code === 'PGRST116') {
            const { error: insertError } = await supabase
              .from('user_profiles')
              .insert({
                id: user.id,
                display_name: newDisplayName,
                target_level: 'B2',
              });
              
            if (insertError) throw insertError;
          } else {
            throw error;
          }
        }
      }

      setProfileData((prev: any) => ({
        ...prev,
        displayName: newDisplayName,
      }));

      setIsEditing(false);
      
      toast({
        title: "Success",
        description: "Profile information updated successfully",
      });
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

      // Check if avatars storage bucket exists
      try {
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, file, { upsert: true });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);

        setAvatarUrl(publicUrl);

        const { error: updateError } = await supabase
          .from('user_profiles')
          .update({ avatar_url: publicUrl })
          .eq('id', user.id);

        if (updateError) throw updateError;

        toast({
          title: "Success",
          description: "Profile picture updated successfully",
        });
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

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Personal Information</CardTitle>
        <Button
          variant="outline" 
          size="sm"
          onClick={handleEditToggle}
        >
          {isEditing ? "Cancel" : "Edit"}
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
                <span>Upload Photo</span>
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
          <Label htmlFor="displayName">Display Name</Label>
          {isEditing ? (
            <Input
              id="displayName"
              value={newDisplayName}
              onChange={(e) => setNewDisplayName(e.target.value)}
              placeholder="Enter your display name"
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
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default UserInfo;
