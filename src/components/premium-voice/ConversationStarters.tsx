
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";

interface ConversationStartersProps {
  onPhraseClick?: (phrase: string) => void;
}

const ConversationStarters = ({ onPhraseClick }: ConversationStartersProps) => {
  const { t } = useLocalization();

  const phrases = [
    "Hello, how are you today?",
    "What's the weather like where you are?", 
    "Can you recommend a good restaurant?",
    "What are your hobbies and interests?",
    "Tell me about your favorite book or movie.",
    "What did you do last weekend?",
    "What are your plans for tomorrow?",
    "How do you say... in Spanish/English?"
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          {t("conversationStarters")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Try these phrases to start a conversation:
        </p>
        <div className="space-y-2">
          {phrases.map((phrase, index) => (
            <Button
              key={index}
              variant="outline"
              size="sm"
              className="w-full text-left justify-start h-auto py-2 px-3 text-wrap"
              onClick={() => onPhraseClick?.(phrase)}
            >
              {phrase}
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationStarters;
