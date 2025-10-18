import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Shield, CheckCircle, AlertTriangle, Clock } from "lucide-react";

export default function ComplianceDashboard() {
  const { data: complianceStatus, isLoading } = useQuery({
    queryKey: ["compliance-status"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("compliance_status")
        .select("*")
        .order("compliance_type");
      
      if (error) throw error;
      return data;
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "compliant":
        return "bg-green-100 text-green-800";
      case "in_progress":
        return "bg-blue-100 text-blue-800";
      case "needs_attention":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "in_progress":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "needs_attention":
        return <AlertTriangle className="h-5 w-5 text-yellow-600" />;
      default:
        return <Shield className="h-5 w-5 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground">Loading compliance status...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-primary" />
            <CardTitle>Compliance Dashboard</CardTitle>
          </div>
          <CardDescription>
            Track K-12 compliance status across FERPA, COPPA, and CIPA requirements
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {complianceStatus?.map((status: any) => (
              <div key={status.compliance_type} className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(status.status)}
                      <h3 className="font-semibold text-lg uppercase">
                        {status.compliance_type}
                      </h3>
                      <Badge className={getStatusColor(status.status)}>
                        {status.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{status.notes}</p>
                  </div>
                  {status.compliance_score !== null && (
                    <div className="text-right">
                      <div className="text-2xl font-bold">{status.compliance_score}%</div>
                      <div className="text-xs text-muted-foreground">Score</div>
                    </div>
                  )}
                </div>

                {status.compliance_score !== null && (
                  <Progress value={status.compliance_score} className="h-2" />
                )}

                {status.last_audit_date && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>Last audit: {new Date(status.last_audit_date).toLocaleDateString()}</span>
                    {status.next_audit_date && (
                      <span>Next audit: {new Date(status.next_audit_date).toLocaleDateString()}</span>
                    )}
                  </div>
                )}

                {status.action_items && Array.isArray(status.action_items) && status.action_items.length > 0 && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-md">
                    <p className="font-medium text-sm mb-2">Action Items:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {status.action_items.map((item: string, idx: number) => (
                        <li key={idx}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {status.findings && Array.isArray(status.findings) && status.findings.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="font-medium text-sm mb-2">Recent Findings:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {status.findings.map((finding: string, idx: number) => (
                        <li key={idx}>{finding}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
