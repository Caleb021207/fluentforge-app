import { motion, useReducedMotion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MoveRight, Sparkles, Trophy } from "lucide-react";
import type { DebriefFeedback } from "./hooks/useChatMessages";

interface ConversationFeedbackCardProps {
  feedback: DebriefFeedback | null;
  isLoading: boolean;
  error: string | null;
  /** Clears the chat so the learner can try the conversation again. */
  onTalkAgain: () => void;
  /** Dismisses the card and keeps the current conversation. */
  onKeepTalking: () => void;
}

/**
 * End-of-conversation feedback: corrections (you said -> better -> why),
 * one strength, and whether the scenario goal was met.
 * Copy stays in short, simple English.
 */
const ConversationFeedbackCard = ({
  feedback,
  isLoading,
  error,
  onTalkAgain,
  onKeepTalking,
}: ConversationFeedbackCardProps) => {
  const reduceMotion = useReducedMotion();

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Reading your conversation...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="space-y-3 pt-6">
          <p className="text-sm text-destructive">
            Sorry, we could not make your feedback. Please try again.
          </p>
          <Button variant="outline" size="sm" onClick={onKeepTalking}>
            Close
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!feedback) return null;

  return (
    <motion.div
      initial={
        reduceMotion ? { opacity: 0 } : { opacity: 0, y: 12, scale: 0.98 }
      }
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <Card className="gradient-border overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <CardTitle className="text-lg">How you did</CardTitle>
            {feedback.goal_met !== null &&
              (feedback.goal_met ? (
                <Badge className="gap-1.5 border-0 bg-brand-gradient font-semibold text-[#06263A]">
                  <Trophy aria-hidden className="h-3 w-3" />
                  Goal met
                </Badge>
              ) : (
                <Badge variant="outline">Goal not met yet</Badge>
              ))}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback.strength && (
            <div className="flex items-start gap-2.5 rounded-xl border border-brand-mint/25 bg-brand-soft p-3.5">
              <Sparkles
                aria-hidden
                className="mt-0.5 h-4 w-4 shrink-0 text-accent"
              />
              <p className="text-sm leading-relaxed">
                <span className="font-semibold">Nice work: </span>
                {feedback.strength}
              </p>
            </div>
          )}

          {feedback.corrections.length > 0 ? (
            <div className="space-y-2.5">
              {feedback.corrections.map((correction, index) => (
                <div
                  key={index}
                  className="space-y-1.5 rounded-xl border border-border/50 bg-background/40 p-3.5"
                >
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    You said: {correction.you_said}
                  </p>
                  <p className="flex items-start gap-1.5 text-sm font-medium leading-relaxed">
                    <MoveRight
                      aria-hidden
                      className="mt-1 h-3.5 w-3.5 shrink-0 text-accent"
                    />
                    <span>Better: {correction.better}</span>
                  </p>
                  {correction.why && (
                    <p className="text-xs leading-relaxed text-muted-foreground">
                      {correction.why}
                    </p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">No big mistakes. Great job.</p>
          )}

          <div className="flex flex-wrap gap-2 pt-1">
            <Button onClick={onTalkAgain} className="gap-2">
              <Sparkles aria-hidden className="h-4 w-4" />
              Talk again
            </Button>
            <Button variant="outline" onClick={onKeepTalking}>
              Keep talking
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default ConversationFeedbackCard;
