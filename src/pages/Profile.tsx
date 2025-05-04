
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useLocalization } from "@/context/LocalizationContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";

const Profile = () => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  const handleDeleteAccount = async () => {
    setIsLoading(true);
    try {
      // Note: deleteUser is not available directly on auth client
      // We need to call Supabase Edge Function to delete the user
      const { error } = await supabase.functions.invoke('delete-user', {
        body: { confirm: true }
      });
      
      if (error) throw new Error(error.message);
      
      toast({
        title: t("accountDeleted"),
        description: t("accountDeletedSuccess"),
      });
      
      // Sign out after account deletion
      await supabase.auth.signOut();
      window.location.href = "/";
    } catch (error: any) {
      console.error("Error deleting account:", error);
      toast({
        title: t("error"),
        description: error.message || t("accountDeleteFailed"),
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
      setShowDeleteConfirmation(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">{t("yourProfile")}</h1>
      
      <div className="space-y-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">{t("accountSettings")}</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-2">{t("dangerZone")}</h3>
              <p className="text-sm text-gray-500 mb-4">
                {t("deleteAccountWarning")}
              </p>
              
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirmation(true)}
              >
                {t("deleteAccount")}
              </Button>
            </div>
          </div>
        </Card>
      </div>
      
      <Dialog open={showDeleteConfirmation} onOpenChange={setShowDeleteConfirmation}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("confirmAccountDeletion")}</DialogTitle>
            <DialogDescription>
              {t("accountDeletionConfirmationText")}
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button
              variant="default"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              {t("cancel")}
            </Button>
            
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("deleting")}
                </>
              ) : (
                t("confirmDelete")
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Profile;
