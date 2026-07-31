import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
    <Card>
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle className="text-lg">How you did</CardTitle>
          {feedback.goal_met !== null && (
            <Badge variant="outline" className="text-[10px]">
              {feedback.goal_met ? "Goal met" : "Goal not met yet"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {feedback.strength && (
          <p className="text-sm">
            <span className="font-semibold">Nice work: </span>
            {feedback.strength}
          </p>
        )}

        {feedback.corrections.length > 0 ? (
          <div className="space-y-3">
            {feedback.corrections.map((correction, index) => (
              <div key={index}>
                {index > 0 && <Separator className="mb-3" />}
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">
                    You said: {correction.you_said}
                  </p>
                  <p className="text-sm font-medium">Better: {correction.better}</p>
                  {correction.why && (
                    <p className="text-xs text-muted-foreground">{correction.why}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No big mistakes. Great job.</p>
        )}

        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" onClick={onTalkAgain}>
            Talk again
          </Button>
          <Button variant="outline" size="sm" onClick={onKeepTalking}>
            Keep talking
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationFeedbackCard;
