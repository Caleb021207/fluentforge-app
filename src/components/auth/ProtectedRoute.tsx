import { ReactNode } from "react";
import { Loader2, ShieldAlert } from "lucide-react";
import { useUserRole } from "@/hooks/useUserRole";
import { Card, CardContent } from "@/components/ui/card";

interface ProtectedRouteProps {
  children: ReactNode;
  requireRole?: "admin" | "moderator" | "user";
}

/**
 * Client-side gate for admin surfaces. This is a UX guard only — the database
 * RLS policies and the edge functions enforce the same check server-side.
 */
export default function ProtectedRoute({ children, requireRole = "admin" }: ProtectedRouteProps) {
  const { hasRole, loading, signedIn } = useUserRole(requireRole);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!hasRole) {
    return (
      <div className="mx-auto max-w-md py-24">
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
            <ShieldAlert className="h-8 w-8 text-muted-foreground" />
            <h1 className="text-lg font-semibold">Restricted area</h1>
            <p className="text-sm text-muted-foreground">
              {signedIn
                ? "This page is limited to curriculum administrators."
                : "Please sign in with an administrator account to continue."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
