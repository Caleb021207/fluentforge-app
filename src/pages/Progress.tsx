import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import LoadingProgress from "@/components/progress/LoadingProgress";
import UnauthenticatedProgress from "@/components/progress/UnauthenticatedProgress";
import AuthenticatedProgress from "@/components/progress/AuthenticatedProgress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { ConnectionStatusIndicator } from "@/components/ui/ConnectionStatusIndicator";
import { useLocalization } from "@/context/LocalizationContext";
import { getUserProfile, clearUserCache } from "@/utils/profileUtils";
import { ClassroomDashboard } from "@/components/classroom/ClassroomDashboard";

const ProgressPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { toast } = useToast();
  const { isOffline, isReconnecting, setReconnecting, setOnline } = useConnectionStatus();
  const { t } = useLocalization();
  
  const FETCH_INTERVAL = 5000; // 5 seconds
  
  const getCurrentUser = useCallback(async (force = false) => {
    try {
      const now = Date.now();
      if (!force && now - lastFetchTime < FETCH_INTERVAL) {
        return;
      }
      
      setLastFetchTime(now);
      
      if (isOffline) {
        setErrorMessage(t("offlineDataMayNotBeUpToDate"));
        setIsLoading(false);
        return;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth error:', error);
        
        if (error.message.includes("Failed to fetch")) {
          setReconnecting();
          setErrorMessage(t("networkConnectionIssue"));
        } else {
          setAuthError(true);
          setErrorMessage(t("authRequired"));
          toast({
            title: t("error"),
            description: t("authRequired"),
            variant: "destructive"
          });
        }
      } else {
        setUser(user);
        setErrorMessage(null);
        setOnline();
        
        if (user) {
          try {
            await getUserProfile(user.id);
          } catch (error) {
            console.error('Error prefetching profile:', error);
          }
        }
      }
    } catch (error) {
      console.error('Error getting user:', error);
      
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        setReconnecting();
        setErrorMessage(t("networkConnectionIssue"));
      } else {
        setAuthError(true);
        setErrorMessage(t("failedToLoadProgressData"));
      }
    } finally {
      setIsLoading(false);
    }
  }, [isOffline, lastFetchTime, setReconnecting, setOnline, t, toast]);

  useEffect(() => {
    getCurrentUser(true);
    
    let intervalId: number | null = null;
    
    if (!isOffline && isReconnecting) {
      if (user) {
        clearUserCache(user.id);
      }
      getCurrentUser(true);
    }
    
    if (isReconnecting || (isOffline === false && !user && !authError)) {
      intervalId = window.setInterval(() => {
        getCurrentUser();
      }, FETCH_INTERVAL);
    }
    
    return () => {
      if (intervalId !== null) {
        clearInterval(intervalId);
      }
    };
  }, [isOffline, isReconnecting, user, authError, getCurrentUser]);

  const handleRefresh = () => {
    if (user) {
      clearUserCache(user.id);
    }
    
    setIsLoading(true);
    getCurrentUser(true);
    
    toast({
      title: t("refreshing"),
      description: t("refreshingProgressData"),
    });
  };

  const showConnectionStatus = isOffline || isReconnecting;

  if (isLoading) {
    return <LoadingProgress />;
  }

  if (errorMessage) {
    return (
      <div className="space-y-4">
        {showConnectionStatus && (
          <div className="flex justify-between mb-4 items-center">
            <button
              onClick={handleRefresh}
              className="text-sm text-lingua-primary hover:underline"
              disabled={isOffline}
            >
              {t("refresh")}
            </button>
            <ConnectionStatusIndicator />
          </div>
        )}
        
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
        
        <UnauthenticatedProgress />
      </div>
    );
  }

  if (!user || authError) {
    return (
      <div className="space-y-4">
        {showConnectionStatus && (
          <div className="flex justify-end mb-4">
            <ConnectionStatusIndicator />
          </div>
        )}
        
        <UnauthenticatedProgress />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {showConnectionStatus && (
        <div className="flex justify-between mb-4 items-center">
          <button
            onClick={handleRefresh}
            className="text-sm text-lingua-primary hover:underline"
          >
            {t("refresh")}
          </button>
          <ConnectionStatusIndicator />
        </div>
      )}
      
      <ClassroomDashboard />
      <AuthenticatedProgress user={user} />
    </div>
  );
};

export default ProgressPage;
