import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Download, Clock, CheckCircle, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function DataExportManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [requestType, setRequestType] = useState<"full_export" | "ferpa_records" | "usage_data" | "grades_only">("full_export");
  const [fileFormat, setFileFormat] = useState<"json" | "csv" | "pdf">("json");

  const { data: exports, isLoading } = useQuery({
    queryKey: ["data-exports"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("data_export_requests")
        .select("*")
        .order("requested_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createExport = useMutation({
    mutationFn: async ({ type, format }: { type: string; format: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { error } = await supabase
        .from("data_export_requests")
        .insert({
          user_id: user.id,
          request_type: type,
          file_format: format,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-exports"] });
      toast({
        title: "Export Requested",
        description: "Your data export request has been submitted. You'll be notified when it's ready.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleCreateExport = () => {
    createExport.mutate({
      type: requestType,
      format: fileFormat,
    });
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "failed":
        return <XCircle className="h-4 w-4 text-destructive" />;
      case "processing":
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      processing: "bg-blue-100 text-blue-800",
      completed: "bg-green-100 text-green-800",
      failed: "bg-red-100 text-red-800",
    };
    return colors[status as keyof typeof colors] || colors.pending;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Download className="h-5 w-5 text-primary" />
            <CardTitle>Data Export Requests</CardTitle>
          </div>
          <CardDescription>
            Export your data for FERPA compliance and data portability
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="exportType">Export Type</Label>
              <Select value={requestType} onValueChange={(value: any) => setRequestType(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full_export">Full Data Export</SelectItem>
                  <SelectItem value="ferpa_records">FERPA Records Only</SelectItem>
                  <SelectItem value="usage_data">Usage Data Only</SelectItem>
                  <SelectItem value="grades_only">Grades Only</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fileFormat">File Format</Label>
              <Select value={fileFormat} onValueChange={(value: any) => setFileFormat(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Button onClick={handleCreateExport} disabled={createExport.isPending}>
            <Download className="h-4 w-4 mr-2" />
            {createExport.isPending ? "Requesting..." : "Request Export"}
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Export History</CardTitle>
          <CardDescription>View and download your previous export requests</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading export history...</p>
          ) : exports && exports.length > 0 ? (
            <div className="space-y-3">
              {exports.map((exp: any) => (
                <div key={exp.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(exp.status)}
                        <p className="font-medium">
                          {exp.request_type.replace(/_/g, " ")} ({exp.file_format.toUpperCase()})
                        </p>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Requested: {new Date(exp.requested_at).toLocaleString()}
                      </p>
                      {exp.completed_at && (
                        <p className="text-sm text-muted-foreground">
                          Completed: {new Date(exp.completed_at).toLocaleString()}
                        </p>
                      )}
                    </div>
                    <Badge className={getStatusBadge(exp.status)}>
                      {exp.status}
                    </Badge>
                  </div>
                  {exp.export_file_url && exp.status === "completed" && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => window.open(exp.export_file_url, "_blank")}
                    >
                      <Download className="h-3 w-3 mr-2" />
                      Download
                    </Button>
                  )}
                  {exp.error_message && (
                    <p className="text-sm text-destructive mt-2">{exp.error_message}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No export requests yet</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
