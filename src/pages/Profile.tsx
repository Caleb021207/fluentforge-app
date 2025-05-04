import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Session, User } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocalization } from "@/hooks/useLocalization";

const Profile = () => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLocalization();

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        setSession(initialSession);
        setUser(initialSession?.user || null);
        
        if (initialSession?.user) {
          setName(initialSession.user.user_metadata?.name || "");
          setEmail(initialSession.user.email || "");
          setIsVerified(initialSession.user.email_confirmed_at !== null);
        }
      } catch (error) {
        console.error("Error fetching session:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSession();

    supabase.auth.onAuthStateChange((event, currentSession) => {
      setSession(currentSession);
      setUser(currentSession?.user || null);
      
      if (currentSession?.user) {
        setName(currentSession.user.user_metadata?.name || "");
        setEmail(currentSession.user.email || "");
        setIsVerified(currentSession.user.email_confirmed_at !== null);
      }
    });
  }, []);

  const handleUpdateProfile = async () => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          name: name,
        },
      });

      if (error) {
        setUpdateError(error.message);
        toast({
          title: t("updateFailed"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("updateSuccess"),
          description: t("profileUpdatedSuccessfully"),
        });
      }
    } catch (error: any) {
      setUpdateError(error.message);
      toast({
        title: t("updateFailed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleEmailChange = async () => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const { error } = await supabase.auth.updateUser({
        email: email,
      });

      if (error) {
        setUpdateError(error.message);
        toast({
          title: t("updateFailed"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("updateSuccess"),
          description: t("verificationEmailSent"),
        });
      }
    } catch (error: any) {
      setUpdateError(error.message);
      toast({
        title: t("updateFailed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordReset = async () => {
    setIsUpdating(true);
    setUpdateError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/update-password`,
      });

      if (error) {
        setUpdateError(error.message);
        toast({
          title: t("resetFailed"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: t("resetEmailSent"),
          description: t("checkEmailToResetPassword"),
        });
      }
    } catch (error: any) {
      setUpdateError(error.message);
      toast({
        title: t("resetFailed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(t("confirmAccountDeletion"));
    if (!confirmDelete) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        setUpdateError(error.message);
        toast({
          title: t("deleteFailed"),
          description: error.message,
          variant: "destructive",
        });
      } else {
        await supabase.auth.deleteUser();
        toast({
          title: t("accountDeleted"),
          description: t("accountDeletedSuccessfully"),
        });
        navigate("/");
      }
    } catch (error: any) {
      setUpdateError(error.message);
      toast({
        title: t("deleteFailed"),
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-8">{t("loading")}...</div>;
  }

  if (!session) {
    return <div className="p-8">{t("notLoggedIn")}</div>;
  }

  return (
    <div className="container max-w-3xl mx-auto space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{t("profileSettings")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">{t("email")}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isVerified}
            />
            {!isVerified && (
              <Button size="sm" onClick={handleEmailChange} disabled={isUpdating}>
                {isUpdating ? t("updating") : t("updateEmail")}
              </Button>
            )}
            {isVerified ? (
              <Alert variant="outline">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t("emailVerified")} <Check className="h-4 w-4 ml-2 text-green-500" />
                </AlertDescription>
              </Alert>
            ) : (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  {t("emailNotVerified")}
                </AlertDescription>
              </Alert>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="name">{t("name")}</Label>
            <Input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <Button onClick={handleUpdateProfile} disabled={isUpdating}>
            {isUpdating ? t("updating") : t("updateProfile")}
          </Button>
          {updateError && <p className="text-red-500">{updateError}</p>}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">{t("accountManagement")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="destructive" onClick={handleDeleteAccount} disabled={isUpdating}>
            {isUpdating ? t("deleting") : t("deleteAccount")}
          </Button>
          <Button variant="secondary" onClick={handlePasswordReset} disabled={isUpdating}>
            {isUpdating ? t("sendingReset") : t("resetPassword")}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profile;
