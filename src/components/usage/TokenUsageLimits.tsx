import { useUsageLimits } from "@/hooks/useUsageLimits";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { MessageSquare, Mic, Volume2, Clock, Crown, Shield } from "lucide-react";

export const TokenUsageLimits = () => {
  const { usageLimits, isLoading } = useUsageLimits();

  if (isLoading) {
    return (
      <Card className="glass">
        <CardHeader>
          <CardTitle>Loading...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (!usageLimits) {
    return null;
  }

  const formatNumber = (num: number) => {
    if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
    if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
    return num.toString();
  };

  const getLimitColor = (percentage: number) => {
    if (percentage >= 90) return "text-destructive";
    if (percentage >= 75) return "text-yellow-500";
    return "text-primary";
  };

  const accountTier = usageLimits.accountTier || 'premium';
  const tierConfig = {
    standard: {
      icon: Shield,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      label: 'Standard',
      monthlyCost: '$2.57'
    },
    premium: {
      icon: Crown,
      color: 'text-amber-500',
      bgColor: 'bg-amber-50 dark:bg-amber-950',
      label: 'Premium',
      monthlyCost: '$4.02'
    }
  };
  
  const currentTier = tierConfig[accountTier];
  const TierIcon = currentTier.icon;

  const limits = [
    {
      icon: Volume2,
      title: "TTS Tokens",
      subtitle: "Text-to-speech across all features",
      used: usageLimits?.ttsTokensUsed || 0,
      limit: usageLimits?.ttsTokensLimit || 0,
      type: "tokens",
      isPremiumOnly: false
    },
    {
      icon: MessageSquare,
      title: "Text Practice Tokens",
      subtitle: "Chat and text-based practice",
      used: usageLimits?.textPracticeTokensUsed || 0,
      limit: usageLimits?.textPracticeTokensLimit || 0,
      type: "tokens",
      isPremiumOnly: false
    },
    {
      icon: Mic,
      title: "Custom Realtime",
      subtitle: accountTier === 'standard' ? "Premium Feature" : "Advanced AI Conversation",
      used: usageLimits?.premiumVoiceMinutesUsed || 0,
      limit: usageLimits?.premiumVoiceMinutesLimit || 0,
      type: "minutes",
      isPremiumOnly: accountTier === 'standard'
    },
    {
      icon: Clock,
      title: "Whisper STT",
      subtitle: "Speech-to-text transcription",
      used: usageLimits?.voiceMinutesUsed || 0,
      limit: usageLimits?.voiceMinutesLimit || 0,
      type: "minutes",
      isPremiumOnly: false
    }
  ];

  return (
    <div className="space-y-6">
      {/* Account Tier Badge */}
      <Card className={currentTier.bgColor}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <TierIcon className={`h-6 w-6 ${currentTier.color}`} />
              <div>
                <CardTitle className="text-lg">
                  {currentTier.label} Account
                </CardTitle>
                <CardDescription>
                  {accountTier === 'standard' 
                    ? 'Essential features for language learning' 
                    : 'Full access to all premium features'}
                </CardDescription>
              </div>
            </div>
            <Badge variant={accountTier === 'premium' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
              {currentTier.monthlyCost}/month
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {limits.map((limit, index) => {
          const percentage = limit.limit > 0 ? (limit.used / limit.limit) * 100 : 0;
          const remaining = limit.limit - limit.used;
          const LimitIcon = limit.icon;
          
          return (
            <motion.div
              key={limit.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <LimitIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{limit.title}</CardTitle>
                      <CardDescription className="text-sm">{limit.subtitle}</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-4">
                  {limit.isPremiumOnly ? (
                    <div className="space-y-3">
                      <div className="p-4 bg-muted rounded-lg text-center">
                        <Crown className="h-8 w-8 text-amber-500 mx-auto mb-2" />
                        <p className="text-sm font-medium">Premium Feature</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Upgrade to Premium to access Custom Realtime
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Used</span>
                        <span className={`font-medium ${getLimitColor(percentage)}`}>
                          {formatNumber(limit.used)} / {formatNumber(limit.limit)} {limit.type}
                        </span>
                      </div>
                      <Progress value={percentage} className="h-2" />
                      <div className="text-xs text-muted-foreground text-right">
                        {formatNumber(remaining)} {limit.type} remaining
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
