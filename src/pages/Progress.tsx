
import { useState, useEffect } from "react";
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

const ProgressPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authError, setAuthError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { toast } = useToast();
  const { isOffline, isReconnecting, setReconnecting } = useConnectionStatus();

  useEffect(() => {
    const getCurrentUser = async () => {
      try {
        // If we're offline, don't try to fetch the user
        if (isOffline) {
          setErrorMessage("You are currently offline. Please check your internet connection.");
          setIsLoading(false);
          return;
        }

        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Auth error:', error);
          
          // Check if this is a network error
          if (error.message.includes("Failed to fetch")) {
            setReconnecting(); // Set status to reconnecting
            setErrorMessage("Unable to connect to the server. Checking connection...");
          } else {
            setAuthError(true);
            setErrorMessage("Authentication error. Please try signing in again.");
            toast({
              title: "Authentication error",
              description: "Please try signing in again.",
              variant: "destructive"
            });
          }
        } else {
          setUser(user);
          setErrorMessage(null);
        }
      } catch (error) {
        console.error('Error getting user:', error);
        
        // Check if this is a network error
        if (error instanceof Error && error.message.includes("Failed to fetch")) {
          setReconnecting(); // Set status to reconnecting
          setErrorMessage("Network connection issue. Please check your internet connection.");
        } else {
          setAuthError(true);
          setErrorMessage("An unexpected error occurred. Please try again later.");
        }
      } finally {
        setIsLoading(false);
      }
    };

    getCurrentUser();

    // Retry authentication if reconnecting or if connection status changes
    const interval = setInterval(() => {
      if (isReconnecting || (isOffline === false && !user && !authError)) {
        getCurrentUser();
      }
    }, 5000); // Try every 5 seconds

    return () => clearInterval(interval);
  }, [toast, isOffline, isReconnecting, setReconnecting, user, authError]);

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
          <div className="flex justify-end mb-4">
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
        <div className="flex justify-end mb-4">
          <ConnectionStatusIndicator />
        </div>
      )}
      
      <AuthenticatedProgress user={user} />
    </div>
  );
};

export default ProgressPage;
