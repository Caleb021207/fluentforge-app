import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Eye, Shield, AlertCircle, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";

interface AccessLog {
  id: string;
  accessor_user_id: string;
  access_type: string;
  data_category: string;
  data_accessed: string;
  educational_justification: string;
  legitimate_interest_verified: boolean;
  access_granted: boolean;
  denial_reason: string | null;
  accessed_at: string;
  accessor_profile?: {
    display_name: string;
    role: string;
  };
}

const DataAccessAuditLog = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [accessLogs, setAccessLogs] = useState<AccessLog[]>([]);

  useEffect(() => {
    loadAccessLogs();
  }, []);

  const loadAccessLogs = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Get access logs
      const { data: logs, error: logsError } = await supabase
        .from('educational_data_access_audit')
        .select('*')
        .eq('accessed_user_id', user.id)
        .order('accessed_at', { ascending: false })
        .limit(50);

      if (logsError) throw logsError;

      // Get accessor profiles
      if (logs && logs.length > 0) {
        const accessorIds = [...new Set(logs.map(log => log.accessor_user_id))];
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('id, display_name, role')
          .in('id', accessorIds);

        if (profilesError) throw profilesError;

        // Map profiles to logs
        const logsWithProfiles = logs.map(log => ({
          ...log,
          accessor_profile: profiles?.find(p => p.id === log.accessor_user_id)
        }));

        setAccessLogs(logsWithProfiles as AccessLog[]);
      } else {
        setAccessLogs([]);
      }
    } catch (error) {
      console.error('Error loading access logs:', error);
      toast({
        title: "Error",
        description: "Failed to load access logs",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const getAccessTypeLabel = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const getDataCategoryLabel = (category: string) => {
    return category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Loading Access Logs...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Eye className="h-5 w-5 text-primary" />
          Educational Data Access Audit Log
        </CardTitle>
        <CardDescription>
          FERPA-compliant record of who accessed your educational data and why
        </CardDescription>
      </CardHeader>
      <CardContent>
        {accessLogs.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Shield className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No access logs recorded yet</p>
          </div>
        ) : (
          <ScrollArea className="h-[500px] pr-4">
            <div className="space-y-4">
              {accessLogs.map((log) => (
                <div
                  key={log.id}
                  className="border rounded-lg p-4 space-y-3 hover:bg-accent/50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">
                          {log.accessor_profile?.display_name || 'Unknown User'}
                        </span>
                        <Badge variant="outline" className="text-xs">
                          {log.accessor_profile?.role || 'Unknown'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(log.accessed_at), 'PPpp')}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {log.access_granted ? (
                        <Badge variant="default" className="gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Granted
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="gap-1">
                          <XCircle className="h-3 w-3" />
                          Denied
                        </Badge>
                      )}
                      {log.legitimate_interest_verified && (
                        <Badge variant="secondary" className="gap-1">
                          <Shield className="h-3 w-3" />
                          Verified
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Access Type:</span>
                      <p className="font-medium">{getAccessTypeLabel(log.access_type)}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Data Category:</span>
                      <p className="font-medium">{getDataCategoryLabel(log.data_category)}</p>
                    </div>
                  </div>

                  {log.data_accessed && (
                    <div className="text-sm">
                      <span className="text-muted-foreground">Data Accessed:</span>
                      <p className="font-medium">{log.data_accessed}</p>
                    </div>
                  )}

                  <div className="text-sm">
                    <span className="text-muted-foreground">Educational Justification:</span>
                    <p className="italic text-muted-foreground mt-1">
                      "{log.educational_justification}"
                    </p>
                  </div>

                  {log.denial_reason && (
                    <div className="text-sm bg-destructive/10 p-2 rounded">
                      <span className="text-destructive font-medium">Denial Reason:</span>
                      <p className="text-destructive">{log.denial_reason}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
};

export default DataAccessAuditLog;
