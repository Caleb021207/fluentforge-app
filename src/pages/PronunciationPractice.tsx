
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocalization } from "@/context/LocalizationContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import PronunciationPracticeContainer from "@/components/pronunciation/PronunciationPracticeContainer";

const PronunciationPractice = () => {
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { t } = useLocalization();
  const [selectedLevel, setSelectedLevel] = useState<string>("");
  const [speechRate, setSpeechRate] = useState(1.5);
  const [showPractice, setShowPractice] = useState(false);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <AuthRequiredPrompt />;
  }

  if (showPractice) {
    return <PronunciationPracticeContainer />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("pronunciationPractice")}</h1>
        <p className="text-muted-foreground">
          {t("improvePronunciationSkillsWith")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("selectComplexityLevel")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("chooseDifficultyLevelBasedOn")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder={t("selectComplexityLevel")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="novice">{t("novice")}</SelectItem>
                <SelectItem value="intermediate">{t("intermediate")}</SelectItem>
                <SelectItem value="advanced">{t("advanced")}</SelectItem>
                <SelectItem value="superior">{t("superior")}</SelectItem>
              </SelectContent>
            </Select>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">{t("speechRate")}: {speechRate}x</label>
              <input
                type="range"
                min="0.5"
                max="2"
                step="0.1"
                value={speechRate}
                onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>

            {selectedLevel && (
              <Button 
                onClick={() => setShowPractice(true)}
                className="w-full"
              >
                {t("startExercise")}
              </Button>
            )}

            {!selectedLevel && (
              <p className="text-center text-muted-foreground py-8">
                {t("selectLevelToStart")}
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("pronunciationPracticeTips")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>• {t("listenCarefullyTip")}</li>
              <li>• {t("payAttentionToStressTip")}</li>
              <li>• {t("practiceDifficultSoundsTip")}</li>
              <li>• {t("recordYourselfTip")}</li>
              <li>• {t("bePatientTip")}</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PronunciationPractice;
