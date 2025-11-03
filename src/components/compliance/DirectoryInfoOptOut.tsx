import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Shield, AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useLocalization } from "@/context/LocalizationContext";

interface DirectoryPreferences {
  optedOut: boolean;
  parentName: string;
  parentEmail: string;
}

const DirectoryInfoOptOut = () => {
  const { toast } = useToast();
  const { t } = useLocalization();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [preferences, setPreferences] = useState<DirectoryPreferences>({
    optedOut: false,
    parentName: '',
    parentEmail: ''
  });

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}-${currentYear + 1}`;

      const { data, error } = await supabase
        .from('directory_information_preferences')
        .select('*')
        .eq('student_id', user.id)
        .eq('academic_year', academicYear)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setPreferences({
          optedOut: data.opted_out,
          parentName: data.parent_name || '',
          parentEmail: data.parent_email || ''
        });
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
      toast({
        title: "Error",
        description: "Failed to load directory preferences",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const currentYear = new Date().getFullYear();
      const academicYear = `${currentYear}-${currentYear + 1}`;

      const { error } = await supabase
        .from('directory_information_preferences')
        .upsert({
          student_id: user.id,
          academic_year: academicYear,
          opted_out: preferences.optedOut,
          parent_name: preferences.parentName || null,
          parent_email: preferences.parentEmail || null,
          opt_out_date: preferences.optedOut ? new Date().toISOString() : null,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'student_id,academic_year'
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Directory information preferences saved",
      });
    } catch (error) {
      console.error('Error saving preferences:', error);
      toast({
        title: "Error",
        description: "Failed to save preferences",
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Loading...
          </CardTitle>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Directory Information Opt-Out
        </CardTitle>
        <CardDescription>
          Control whether directory information (like grade level or learning language) can be shared for educational purposes
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>FERPA Rights:</strong> Under FERPA, you have the right to opt out of directory information disclosure. 
            Directory information includes non-sensitive details like grade level, courses, and activities. 
            Palavox does not share any student data externally.
          </AlertDescription>
        </Alert>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="opt-out" className="text-base font-medium">
                Opt Out of Directory Information Sharing
              </Label>
              <p className="text-sm text-muted-foreground">
                Prevent directory information from being shared within the school
              </p>
            </div>
            <Switch
              id="opt-out"
              checked={preferences.optedOut}
              onCheckedChange={(checked) =>
                setPreferences({ ...preferences, optedOut: checked })
              }
            />
          </div>

          {preferences.optedOut && (
            <Alert className="bg-amber-50 border-amber-200">
              <Check className="h-4 w-4 text-amber-600" />
              <AlertDescription className="text-amber-800">
                You have opted out of directory information sharing. Parent/guardian information is required for verification.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-4 pt-4 border-t">
            <div className="space-y-2">
              <Label htmlFor="parent-name">
                Parent/Guardian Name {preferences.optedOut && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="parent-name"
                value={preferences.parentName}
                onChange={(e) =>
                  setPreferences({ ...preferences, parentName: e.target.value })
                }
                placeholder="Enter parent/guardian name"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="parent-email">
                Parent/Guardian Email {preferences.optedOut && <span className="text-destructive">*</span>}
              </Label>
              <Input
                id="parent-email"
                type="email"
                value={preferences.parentEmail}
                onChange={(e) =>
                  setPreferences({ ...preferences, parentEmail: e.target.value })
                }
                placeholder="parent@example.com"
                disabled={saving}
              />
            </div>
          </div>

          <Button
            onClick={handleSave}
            disabled={
              saving ||
              (preferences.optedOut && (!preferences.parentName || !preferences.parentEmail))
            }
            className="w-full"
          >
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default DirectoryInfoOptOut;
