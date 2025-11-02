import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useUsageLimits } from '@/hooks/useUsageLimits';
import { Clock, MessageSquare, Award } from 'lucide-react';

export const UsageDashboard = () => {
  const { usageLimits, isLoading, premiumVoiceMinutesRemaining } = useUsageLimits();

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

  const whisperSTTUsagePercent = (usageLimits.whisperSTTMinutesUsed / usageLimits.whisperSTTMinutesLimit) * 100;
  const premiumVoiceUsagePercent = (usageLimits.premiumVoiceMinutesUsed / usageLimits.premiumVoiceMinutesLimit) * 100;
  const certUsagePercent = (usageLimits.certificationAttemptsUsed / usageLimits.certificationAttemptsLimit) * 100;

  const getUsageStatus = (percent: number) => {
    if (percent >= 90) return { variant: 'destructive' as const, label: 'Critical' };
    if (percent >= 75) return { variant: 'secondary' as const, label: 'High' };
    if (percent >= 50) return { variant: 'default' as const, label: 'Moderate' };
    return { variant: 'outline' as const, label: 'Low' };
  };

  const whisperSTTStatus = getUsageStatus(whisperSTTUsagePercent);
  const premiumVoiceStatus = getUsageStatus(premiumVoiceUsagePercent);
  const certStatus = getUsageStatus(certUsagePercent);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Whisper STT Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Whisper STT</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {usageLimits.whisperSTTMinutesRemaining} min
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {usageLimits.whisperSTTMinutesUsed} of {usageLimits.whisperSTTMinutesLimit} used this month
          </p>
          <Progress value={whisperSTTUsagePercent} className="h-2" />
          <div className="flex justify-between items-center mt-2">
            <Badge variant={whisperSTTStatus.variant}>{whisperSTTStatus.label}</Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round(whisperSTTUsagePercent)}% used
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Premium Voice Practice Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Premium Voice Practice</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {premiumVoiceMinutesRemaining} min
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {usageLimits.premiumVoiceMinutesUsed} of {usageLimits.premiumVoiceMinutesLimit} used this month
          </p>
          <Progress value={premiumVoiceUsagePercent} className="h-2" />
          <div className="flex justify-between items-center mt-2">
            <Badge variant={premiumVoiceStatus.variant}>{premiumVoiceStatus.label}</Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round(premiumVoiceUsagePercent)}% used
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Text Practice Tokens Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Text Practice</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {usageLimits.textPracticeTokensRemaining.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {usageLimits.textPracticeTokensUsed.toLocaleString()} of {usageLimits.textPracticeTokensLimit.toLocaleString()} tokens used this month
          </p>
          <Progress value={(usageLimits.textPracticeTokensUsed / usageLimits.textPracticeTokensLimit) * 100} className="h-2" />
          <div className="flex justify-between items-center mt-2">
            <Badge variant={getUsageStatus((usageLimits.textPracticeTokensUsed / usageLimits.textPracticeTokensLimit) * 100).variant}>
              {getUsageStatus((usageLimits.textPracticeTokensUsed / usageLimits.textPracticeTokensLimit) * 100).label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round((usageLimits.textPracticeTokensUsed / usageLimits.textPracticeTokensLimit) * 100)}% used
            </span>
          </div>
        </CardContent>
      </Card>

      {/* TTS Tokens Usage */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Text-to-Speech</CardTitle>
          <MessageSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {usageLimits.ttsTokensRemaining.toLocaleString()}
          </div>
          <p className="text-xs text-muted-foreground mb-2">
            {usageLimits.ttsTokensUsed.toLocaleString()} of {usageLimits.ttsTokensLimit.toLocaleString()} tokens used this month
          </p>
          <Progress value={(usageLimits.ttsTokensUsed / usageLimits.ttsTokensLimit) * 100} className="h-2" />
          <div className="flex justify-between items-center mt-2">
            <Badge variant={getUsageStatus((usageLimits.ttsTokensUsed / usageLimits.ttsTokensLimit) * 100).variant}>
              {getUsageStatus((usageLimits.ttsTokensUsed / usageLimits.ttsTokensLimit) * 100).label}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {Math.round((usageLimits.ttsTokensUsed / usageLimits.ttsTokensLimit) * 100)}% used
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};