import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { AlertTriangle } from "lucide-react";

export default function DataBreachForm() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [breachDate, setBreachDate] = useState("");
  const [breachType, setBreachType] = useState("");
  const [breachDescription, setBreachDescription] = useState("");
  const [mitigationSteps, setMitigationSteps] = useState("");
  const [severity, setSeverity] = useState<"low" | "medium" | "high" | "critical">("medium");
  const [affectedUserCount, setAffectedUserCount] = useState("");
  const [affectedDataTypes, setAffectedDataTypes] = useState<string[]>([]);

  const dataTypeOptions = [
    "student_names",
    "email_addresses",
    "grades",
    "usage_data",
    "contact_information",
    "ip_addresses",
    "authentication_data",
  ];

  const createBreach = useMutation({
    mutationFn: async (breachData: any) => {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("data_breach_notifications")
        .insert({
          breach_date: breachData.breachDate,
          breach_type: breachData.breachType,
          breach_description: breachData.breachDescription,
          mitigation_steps: breachData.mitigationSteps,
          severity: breachData.severity,
          affected_user_count: breachData.affectedUserCount,
          affected_data_types: breachData.affectedDataTypes,
          created_by: user?.id,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["data-breaches"] });
      toast({
        title: "Breach Notification Created",
        description: "Data breach has been logged. Please proceed with notification process.",
      });
      // Reset form
      setBreachDate("");
      setBreachType("");
      setBreachDescription("");
      setMitigationSteps("");
      setSeverity("medium");
      setAffectedUserCount("");
      setAffectedDataTypes([]);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createBreach.mutate({
      breachDate: new Date(breachDate).toISOString(),
      breachType,
      breachDescription,
      mitigationSteps,
      severity,
      affectedUserCount: parseInt(affectedUserCount),
      affectedDataTypes,
    });
  };

  const toggleDataType = (type: string) => {
    setAffectedDataTypes(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  return (
    <Card className="border-destructive">
      <CardHeader>
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          <CardTitle className="text-destructive">Report Data Breach</CardTitle>
        </div>
        <CardDescription>
          Document security incidents and data breaches for FERPA compliance
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="breachDate">Breach Date</Label>
              <Input
                id="breachDate"
                type="date"
                value={breachDate}
                onChange={(e) => setBreachDate(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="severity">Severity Level</Label>
              <Select value={severity} onValueChange={(value: any) => setSeverity(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="breachType">Breach Type</Label>
              <Input
                id="breachType"
                value={breachType}
                onChange={(e) => setBreachType(e.target.value)}
                placeholder="e.g., Unauthorized access, data leak"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="affectedCount">Affected User Count</Label>
              <Input
                id="affectedCount"
                type="number"
                value={affectedUserCount}
                onChange={(e) => setAffectedUserCount(e.target.value)}
                placeholder="Number of affected users"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Affected Data Types</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {dataTypeOptions.map(type => (
                <div key={type} className="flex items-center space-x-2">
                  <Checkbox
                    id={type}
                    checked={affectedDataTypes.includes(type)}
                    onCheckedChange={() => toggleDataType(type)}
                  />
                  <Label htmlFor={type} className="font-normal text-sm">
                    {type.replace(/_/g, " ")}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Breach Description</Label>
            <Textarea
              id="description"
              value={breachDescription}
              onChange={(e) => setBreachDescription(e.target.value)}
              placeholder="Detailed description of what happened..."
              rows={4}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="mitigation">Mitigation Steps Taken</Label>
            <Textarea
              id="mitigation"
              value={mitigationSteps}
              onChange={(e) => setMitigationSteps(e.target.value)}
              placeholder="Actions taken to contain and remediate..."
              rows={4}
              required
            />
          </div>

          <Button type="submit" variant="destructive" disabled={createBreach.isPending}>
            {createBreach.isPending ? "Logging..." : "Log Data Breach"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
