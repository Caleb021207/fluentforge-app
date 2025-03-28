
import { Wifi, WifiOff, RefreshCw } from "lucide-react";
import { useConnectionStatus } from "@/hooks/useConnectionStatus";
import { Badge } from "@/components/ui/badge";

export function ConnectionStatusIndicator() {
  const { status, isOnline, isOffline, isReconnecting } = useConnectionStatus();

  if (isOnline) {
    return null; // Don't show anything when online
  }

  return (
    <Badge variant="outline" className={`
      flex items-center gap-1.5 px-2.5 py-1 
      ${isOffline ? "bg-red-50 text-red-600 border-red-200" : ""}
      ${isReconnecting ? "bg-yellow-50 text-yellow-600 border-yellow-200" : ""}
    `}>
      {isOffline && <WifiOff className="h-3.5 w-3.5" />}
      {isReconnecting && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
      {isOffline && "Offline"}
      {isReconnecting && "Reconnecting..."}
    </Badge>
  );
}
