import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Clock, MessageSquare, Sparkles, Mic, Volume2 } from "lucide-react";
import { useUsageLimits } from "@/hooks/useUsageLimits";
import { motion } from "framer-motion";

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

  const limits = [
    {
      icon: <Volume2 className="w-5 h-5" />,
      title: "TTS Tokens",
      subtitle: "Text-to-speech across all features",
      used: usageLimits.ttsTokensUsed || 0,
      total: usageLimits.ttsTokensLimit || 1000000,
      type: "tokens" as const
    },
    {
      icon: <MessageSquare className="w-5 h-5" />,
      title: "Text Practice Tokens",
      subtitle: "Chat and text-based practice",
      used: usageLimits.textPracticeTokensUsed || 0,
      total: usageLimits.textPracticeTokensLimit || 2000000,
      type: "tokens" as const
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Custom Realtime",
      subtitle: "Premium voice conversations",
      used: usageLimits.premiumVoiceMinutesUsed || 0,
      total: 15,
      type: "minutes" as const
    },
    {
      icon: <Mic className="w-5 h-5" />,
      title: "Whisper STT",
      subtitle: "Speech-to-text transcription",
      used: usageLimits.voiceMinutesUsed || 0,
      total: 120,
      type: "minutes" as const
    }
  ];

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {limits.map((limit, index) => {
        const percentage = (limit.used / limit.total) * 100;
        const remaining = limit.total - limit.used;
        
        return (
          <motion.div
            key={limit.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="glass hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      {limit.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{limit.title}</CardTitle>
                      <CardDescription className="text-sm">{limit.subtitle}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={percentage >= 90 ? "destructive" : percentage >= 75 ? "secondary" : "default"}>
                    {percentage.toFixed(0)}%
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <Progress value={percentage} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Used: <span className={getLimitColor(percentage)}>
                      {limit.type === "tokens" ? formatNumber(limit.used) : limit.used}
                    </span>
                  </span>
                  <span className="text-muted-foreground">
                    Remaining: <span className="font-medium">
                      {limit.type === "tokens" ? formatNumber(remaining) : remaining}
                    </span>
                  </span>
                </div>
                <div className="text-xs text-muted-foreground text-center pt-1 border-t">
                  {limit.type === "tokens" 
                    ? `${formatNumber(limit.total)} tokens/month`
                    : `${limit.total} minutes/month`
                  }
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};