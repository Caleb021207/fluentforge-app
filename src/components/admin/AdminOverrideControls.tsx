import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, Clock, RotateCcw, Shield } from 'lucide-react';

interface AdminOverrideControlsProps {
  studentId: string;
  currentLimits?: {
    voiceMinutesUsed: number;
    voiceMinutesLimit: number;
    certificationAttemptsUsed: number;
    certificationAttemptsLimit: number;
  };
  onOverrideApplied?: () => void;
}

export const AdminOverrideControls = ({ 
  studentId, 
  currentLimits, 
  onOverrideApplied 
}: AdminOverrideControlsProps) => {
  const [overrideType, setOverrideType] = useState<string>('');
  const [extraMinutes, setExtraMinutes] = useState<string>('');
  const [reason, setReason] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleOverride = async () => {
    if (!overrideType || !reason.trim()) {
      toast({
        title: "Missing Information",
        description: "Please select an override type and provide a reason.",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('Not authenticated');
      }

      let updateData: any = {};
      let previousValue = 0;
      let newValue = 0;

      switch (overrideType) {
        case 'extra_minutes':
          const additionalMinutes = parseInt(extraMinutes);
          if (!additionalMinutes || additionalMinutes <= 0) {
            throw new Error('Please enter a valid number of minutes');
          }
          previousValue = currentLimits?.voiceMinutesLimit || 400;
          newValue = previousValue + additionalMinutes;
          updateData = { voice_minutes_monthly_limit: newValue };
          break;

        case 'cert_reset':
          previousValue = currentLimits?.certificationAttemptsUsed || 0;
          newValue = 0;
          updateData = { certification_attempts_used_current_semester: 0 };
          break;

        case 'emergency_unlock':
          // Reset all limits for emergency access
          previousValue = currentLimits?.voiceMinutesUsed || 0;
          newValue = 0;
          updateData = { 
            voice_minutes_used_current_month: 0,
            certification_attempts_used_current_semester: 0
          };
          break;

        default:
          throw new Error('Invalid override type');
      }

      // Update student limits
      const { error: updateError } = await supabase
        .from('student_usage_limits')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('student_id', studentId);

      if (updateError) {
        throw updateError;
      }

      // Log the override
      const { error: logError } = await supabase
        .from('admin_override_logs')
        .insert({
          admin_id: user.id,
          student_id: studentId,
          override_type: overrideType,
          previous_value: previousValue,
          new_value: newValue,
          reason
        });

      if (logError) {
        console.error('Error logging override:', logError);
        // Don't fail the operation for logging errors
      }

      toast({
        title: "Override Applied",
        description: `Successfully applied ${overrideType.replace('_', ' ')} override.`,
        variant: "default"
      });

      // Reset form
      setOverrideType('');
      setExtraMinutes('');
      setReason('');

      // Callback to refresh data
      if (onOverrideApplied) {
        onOverrideApplied();
      }

    } catch (error: any) {
      console.error('Error applying override:', error);
      toast({
        title: "Override Failed",
        description: error.message || "Failed to apply override.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Admin Override Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="override-type">Override Type</Label>
          <Select value={overrideType} onValueChange={setOverrideType}>
            <SelectTrigger>
              <SelectValue placeholder="Select override type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="extra_minutes">
                <div className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Add Extra Voice Minutes
                </div>
              </SelectItem>
              <SelectItem value="cert_reset">
                <div className="flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset Certification Attempts
                </div>
              </SelectItem>
              <SelectItem value="emergency_unlock">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Emergency Unlock (Reset All)
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {overrideType === 'extra_minutes' && (
          <div className="space-y-2">
            <Label htmlFor="extra-minutes">Additional Minutes</Label>
            <Input
              id="extra-minutes"
              type="number"
              min="1"
              max="1000"
              value={extraMinutes}
              onChange={(e) => setExtraMinutes(e.target.value)}
              placeholder="Enter number of minutes to add"
            />
          </div>
        )}

        <div className="space-y-2">
          <Label htmlFor="reason">Reason for Override</Label>
          <Textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this override is necessary..."
            rows={3}
          />
        </div>

        <Button 
          onClick={handleOverride} 
          disabled={!overrideType || !reason.trim() || isLoading}
          className="w-full"
        >
          {isLoading ? "Applying Override..." : "Apply Override"}
        </Button>

        {currentLimits && (
          <div className="mt-4 p-3 bg-muted rounded-lg text-sm">
            <div className="font-medium mb-2">Current Student Limits:</div>
            <div className="space-y-1 text-muted-foreground">
              <div>Voice: {currentLimits.voiceMinutesUsed}/{currentLimits.voiceMinutesLimit} minutes</div>
              <div>Certifications: {currentLimits.certificationAttemptsUsed}/{currentLimits.certificationAttemptsLimit} attempts</div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};