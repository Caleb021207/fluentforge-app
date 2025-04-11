
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

const ProgressPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  const { toast } = useToast();
  const { isOffline, isReconnecting, setReconnecting, setOnline } = useConnectionStatus();
  const { t } = useLocalization();
  
  // Rate limit fetching to avoid hammering the API
  const FETCH_INTERVAL = 5000; // 5 seconds
  
  const getCurrentUser = useCallback(async (force = false) => {
    try {
      // Rate limit checks to avoid excessive API calls
      const now = Date.now();
      if (!force && now - lastFetchTime < FETCH_INTERVAL) {
        return;
      }
      
      setLastFetchTime(now);
      
      // If we're offline, don't try to fetch the user
      if (isOffline) {
        setErrorMessage(t("offlineDataMayNotBeUpToDate"));
        setIsLoading(false);
        return;
      }

      const { data: { user }, error } = await supabase.auth.getUser();
      
      if (error) {
        console.error('Auth error:', error);
        
        // Check if this is a network error
        if (error.message.includes("Failed to fetch")) {
          setReconnecting(); // Set status to reconnecting
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
        setOnline(); // We successfully made a network request, so we're online
        
        // If we have a user, prefetch profile data for better performance
        if (user) {
          try {
            await getUserProfile(user.id);
          } catch (error) {
            console.error('Error prefetching profile:', error);
            // Non-blocking error, don't need to show to user
          }
        }
      }
    } catch (error) {
      console.error('Error getting user:', error);
      
      // Check if this is a network error
      if (error instanceof Error && error.message.includes("Failed to fetch")) {
        setReconnecting(); // Set status to reconnecting
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
    // Initial data fetch
    getCurrentUser(true);
    
    // Handle reconnection attempts if we're offline or if we're trying to reconnect
    let intervalId: number | null = null;
    
    // When network conditions change, immediately try to fetch data
    if (!isOffline && isReconnecting) {
      // Clear the cache on network change to ensure fresh data
      if (user) {
        clearUserCache(user.id);
      }
      getCurrentUser(true);
    }
    
    // Set up polling interval for reconnection attempts
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

  // Handle refresh request from the user
  const handleRefresh = () => {
    if (user) {
      // Clear cache for current user
      clearUserCache(user.id);
    }
    
    // Force a refresh of user data
    setIsLoading(true);
    getCurrentUser(true);
    
    toast({
      title: t("refreshing"),
      description: t("refreshingProgressData"),
    });
  };

  // Show loading state
  if (isLoading) {
    return <LoadingProgress />;
  }

  // Show the connection status indicator if we're offline or reconnecting
  const showConnectionStatus = isOffline || isReconnecting;

  // Show error message if any
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

  // If user is not authenticated or there was an auth error
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

  // User is authenticated and no errors
  return (
    <div className="space-y-4">
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
      
      <AuthenticatedProgress user={user} />
    </div>
  );
};

export default ProgressPage;
