
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpen } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

interface PracticeGuideProps {
  targetLanguage: string;
}

const PracticeGuide = ({ targetLanguage }: PracticeGuideProps) => {
  const { t } = useLocalization();
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BookOpen className="h-5 w-5" />
          {t("practiceGuide")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          Follow these tips to make your language learning journey easier:
        </p>
        <ul className="space-y-2 text-sm">
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Try to form complete sentences, even if they're simple.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Don't worry about mistakes — they're part of learning!</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Ask for explanations if there's something you don't understand.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Use words you've recently learned.</span>
          </li>
          <li className="flex items-start gap-2">
            <span>•</span>
            <span>Our AI will adapt to your skill level and gradually help you improve.</span>
          </li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default PracticeGuide;
