import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { Clock, MessageSquare, Award } from 'lucide-react';

export const UsageDashboard = () => {
  const { usageLimits, isLoading } = useUsageLimits();

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-2">
              <div className="h-4 bg-muted rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-1/2 mb-2"></div>
              <div className="h-2 bg-muted rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (!usageLimits) {
    return (
      <Card>
        <CardContent className="pt-6">
          <p className="text-muted-foreground text-center">
            No usage data available. Start using the platform to see your usage statistics.
          </p>
        </CardContent>
      </Card>
    );
  }

  const voiceUsagePercent = (usageLimits.voiceMinutesUsed / usageLimits.voiceMinutesLimit) * 100;
  const certUsagePercent = (usageLimits.certificationAttemptsUsed / usageLimits.certificationAttemptsLimit) * 100;

  const getUsageStatus = (percent: number) => {
    if (percent >= 90) return { variant: 'destructive' as const, label: 'Critical' };
    if (percent >= 75) return { variant: 'secondary' as const, label: 'High' };
    if (percent >= 50) return { variant: 'default' as const, label: 'Moderate' };
    return { variant: 'outline' as const, label: 'Low' };
  };

  const voiceStatus = getUsageStatus(voiceUsagePercent);
  const certStatus = getUsageStatus(certUsagePercent);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {/* Voice Practice Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Voice Practice</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {usageLimits.voiceMinutesRemaining} min
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {usageLimits.voiceMinutesUsed} of {usageLimits.voiceMinutesLimit} used this month
          </p>
          <Progress value={voiceUsagePercent} className="h-2" />
          <div className="flex justify-between items-center mt-2">
            <Badge variant={voiceStatus.variant}>{voiceStatus.label}</Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round(voiceUsagePercent)}% used
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Text Messages */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Text Messages</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">Unlimited</div>
          <p className="text-xs text-muted-foreground mb-2">
            {usageLimits.textMessagesUsed.toLocaleString()} sent this month
          </p>
          <div className="h-2 bg-muted rounded-full">
            <div className="h-2 bg-primary rounded-full w-1/4"></div>
          </div>
          <div className="flex justify-between items-center mt-2">
            <Badge variant="outline">Active</Badge>
            {usageLimits.textMessagesUsed >= 5000 && (
              <Badge variant="secondary">High Usage</Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Certification Attempts */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Certification Tests</CardTitle>
          <Award className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {usageLimits.certificationAttemptsLimit - usageLimits.certificationAttemptsUsed}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {usageLimits.certificationAttemptsUsed} of {usageLimits.certificationAttemptsLimit} used this semester
          </p>
          <Progress value={certUsagePercent} className="h-2" />
          <div className="flex justify-between items-center mt-2">
            <Badge variant={certStatus.variant}>{certStatus.label}</Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round(certUsagePercent)}% used
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};