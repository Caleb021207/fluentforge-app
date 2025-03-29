
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, WifiOff } from "lucide-react";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";

interface ErrorDisplayProps {
  error: string | null;
}

const ErrorDisplay = ({ error }: ErrorDisplayProps) => {
  const { isOffline } = useConnectionStatus();

  if (!error) return null;

  return (
    <Alert variant={isOffline ? "warning" : "destructive"}>
      {isOffline ? (
        <WifiOff className="h-4 w-4" />
      ) : (
        <AlertCircle className="h-4 w-4" />
      )}
      <AlertDescription>
        {error}
      </AlertDescription>
    </Alert>
  );
};

export default ErrorDisplay;
