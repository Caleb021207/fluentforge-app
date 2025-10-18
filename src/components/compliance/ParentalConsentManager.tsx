import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Shield, FileCheck, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function ParentalConsentManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [studentId, setStudentId] = useState("");
  const [parentName, setParentName] = useState("");
  const [parentEmail, setParentEmail] = useState("");
  const [parentPhone, setParentPhone] = useState("");
  const [consentType, setConsentType] = useState<"ferpa_release" | "data_sharing" | "directory_info">("ferpa_release");
  const [consentGranted, setConsentGranted] = useState(false);
  const [paperFormReceived, setPaperFormReceived] = useState(false);
  const [notes, setNotes] = useState("");

  const { data: consents, isLoading } = useQuery({
    queryKey: ["parental-consents"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("parental_consent_records")
        .select("*, profiles!parental_consent_records_student_id_fkey(display_name, email)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data;
    },
  });

  const createConsent = useMutation({
    mutationFn: async (consentData: any) => {
      const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;
      const { data: { user } } = await supabase.auth.getUser();
      
      const { error } = await supabase
        .from("parental_consent_records")
        .insert({
          student_id: consentData.studentId,
          parent_name: consentData.parentName,
          parent_email: consentData.parentEmail,
          parent_phone: consentData.parentPhone,
          consent_type: consentData.consentType,
          consent_granted: consentData.consentGranted,
          consent_date: consentData.consentGranted ? new Date().toISOString() : null,
          paper_form_received: consentData.paperFormReceived,
          paper_form_date: consentData.paperFormReceived ? new Date().toISOString() : null,
          recorded_by: user?.id,
          notes: consentData.notes,
          academic_year: academicYear,
        });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["parental-consents"] });
      toast({
        title: "Consent Record Created",
        description: "Parental consent has been recorded successfully.",
      });
      // Reset form
      setStudentId("");
      setParentName("");
      setParentEmail("");
      setParentPhone("");
      setConsentGranted(false);
      setPaperFormReceived(false);
      setNotes("");
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
    createConsent.mutate({
      studentId,
      parentName,
      parentEmail,
      parentPhone,
      consentType,
      consentGranted,
      paperFormReceived,
      notes,
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <CardTitle>Parental Consent Management</CardTitle>
          </div>
          <CardDescription>
            Record and manage parental consent for FERPA compliance (paper forms)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="studentId">Student ID</Label>
                <Input
                  id="studentId"
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="Enter student user ID"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="consentType">Consent Type</Label>
                <Select value={consentType} onValueChange={(value: any) => setConsentType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ferpa_release">FERPA Release</SelectItem>
                    <SelectItem value="data_sharing">Data Sharing</SelectItem>
                    <SelectItem value="directory_info">Directory Information</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentName">Parent/Guardian Name</Label>
                <Input
                  id="parentName"
                  value={parentName}
                  onChange={(e) => setParentName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentEmail">Parent Email (Optional)</Label>
                <Input
                  id="parentEmail"
                  type="email"
                  value={parentEmail}
                  onChange={(e) => setParentEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="parentPhone">Parent Phone (Optional)</Label>
                <Input
                  id="parentPhone"
                  type="tel"
                  value={parentPhone}
                  onChange={(e) => setParentPhone(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="paperForm"
                  checked={paperFormReceived}
                  onCheckedChange={(checked) => setPaperFormReceived(checked as boolean)}
                />
                <Label htmlFor="paperForm" className="font-normal">
                  Paper consent form received
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="consentGranted"
                  checked={consentGranted}
                  onCheckedChange={(checked) => setConsentGranted(checked as boolean)}
                />
                <Label htmlFor="consentGranted" className="font-normal">
                  Consent granted (parent approved)
                </Label>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about the consent..."
                rows={3}
              />
            </div>

            <Button type="submit" disabled={createConsent.isPending}>
              {createConsent.isPending ? "Recording..." : "Record Consent"}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Consent Records</CardTitle>
          <CardDescription>View all recorded parental consent forms</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-muted-foreground">Loading consent records...</p>
          ) : consents && consents.length > 0 ? (
            <div className="space-y-4">
              {consents.map((consent: any) => (
                <div key={consent.id} className="border rounded-lg p-4 space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{consent.parent_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Student: {consent.profiles?.display_name || consent.profiles?.email}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      {consent.consent_granted ? (
                        <Badge className="bg-green-100 text-green-800">
                          <FileCheck className="h-3 w-3 mr-1" />
                          Granted
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <AlertCircle className="h-3 w-3 mr-1" />
                          Pending
                        </Badge>
                      )}
                      {consent.paper_form_received && (
                        <Badge variant="outline">Paper Form</Badge>
                      )}
                    </div>
                  </div>
                  <div className="text-sm">
                    <p><span className="font-medium">Type:</span> {consent.consent_type.replace(/_/g, " ")}</p>
                    <p><span className="font-medium">Academic Year:</span> {consent.academic_year}</p>
                    {consent.parent_email && (
                      <p><span className="font-medium">Email:</span> {consent.parent_email}</p>
                    )}
                    {consent.notes && (
                      <p className="mt-2 text-muted-foreground">{consent.notes}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-muted-foreground">No consent records found</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
