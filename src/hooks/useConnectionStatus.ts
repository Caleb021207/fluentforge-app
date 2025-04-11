
import { useState, useEffect } from "react";

export type ConnectionStatus = "online" | "offline" | "reconnecting";

export function useConnectionStatus() {
  const [status, setStatus] = useState<ConnectionStatus>(
    navigator.onLine ? "online" : "offline"
  );
  const [lastOnlineAt, setLastOnlineAt] = useState<Date | null>(
    navigator.onLine ? new Date() : null
  );

  useEffect(() => {
    const handleOnline = () => {
      setStatus("online");
      setLastOnlineAt(new Date());
    };

    const handleOffline = () => {
      setStatus("offline");
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  const setReconnecting = () => {
    setStatus("reconnecting");
  };

  const setOnline = () => {
    setStatus("online");
    setLastOnlineAt(new Date());
  };

  return {
    status,
    lastOnlineAt,
    isOnline: status === "online",
    isOffline: status === "offline",
    isReconnecting: status === "reconnecting",
    setReconnecting,
    setOnline,
  };
}
