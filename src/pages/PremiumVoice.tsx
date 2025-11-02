
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Volume2, Crown, Shield, Lock } from "lucide-react";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { useNavigate } from "react-router-dom";

const PremiumVoice = () => {
  const { usageLimits, isLoading } = useUsageLimits();
  const navigate = useNavigate();
  const accountTier = usageLimits?.accountTier || 'premium';
  const isStandard = accountTier === 'standard';

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="h-4 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <div className="flex items-center gap-3 mb-2">
          <Volume2 className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Premium Voice Chat</h1>
          {isStandard && (
            <Badge variant="secondary" className="flex items-center gap-1">
              <Lock className="h-3 w-3" />
              Premium Only
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground">
          Practice speaking with advanced AI voice conversation partners.
        </p>
      </div>

      {isStandard ? (
        <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
          <CardHeader>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-5 w-5 text-amber-500" />
              <CardTitle>Premium Feature Required</CardTitle>
            </div>
            <CardDescription>
              Custom Realtime voice conversation is available exclusively for Premium accounts
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-start gap-3 p-4 bg-background rounded-lg">
                <div className="p-2 rounded-full bg-amber-100 dark:bg-amber-900">
                  <Volume2 className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h3 className="font-medium mb-1">Advanced AI Conversation</h3>
                  <p className="text-sm text-muted-foreground">
                    Engage in natural, real-time conversations with AI tutors
                  </p>
                </div>
              </div>

              <div className="p-4 bg-background rounded-lg border border-border">
                <h3 className="font-medium mb-3">What's Included with Premium:</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span>15 minutes/month of Custom Realtime conversations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span>540K TTS tokens (vs. 360K on Standard)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span>300K Text Practice tokens (vs. 150K on Standard)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Crown className="h-4 w-4 text-amber-500" />
                    <span>180 minutes Whisper STT (vs. 120 on Standard)</span>
                  </li>
                </ul>
              </div>

              <div className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                <div>
                  <p className="font-medium">Premium Account</p>
                  <p className="text-sm text-muted-foreground">$4.02/month per student</p>
                </div>
                <Button disabled className="cursor-not-allowed">
                  Contact Administrator
                </Button>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Account tier upgrades must be managed by your school administrator
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Premium Voice Features</CardTitle>
                <CardDescription>
                  Advanced AI-powered voice conversation practice
                </CardDescription>
              </div>
              <Badge variant="default" className="flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <p className="text-sm font-medium mb-1">Monthly Usage</p>
              <p className="text-2xl font-bold text-primary">
                {usageLimits?.premiumVoiceMinutesUsed || 0} / {usageLimits?.premiumVoiceMinutesLimit || 15} minutes
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {(usageLimits?.premiumVoiceMinutesLimit || 15) - (usageLimits?.premiumVoiceMinutesUsed || 0)} minutes remaining
              </p>
            </div>
            <p className="text-muted-foreground">Premium voice chat features coming soon...</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default PremiumVoice;
