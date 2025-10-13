
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, BarChart3, TrendingUp } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";

const Progress = () => {
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { t } = useLocalization();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
    </div>;
  }

  if (!isAuthenticated) {
    return <AuthRequiredPrompt />;
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">{t("aiProgressAnalysis")}</h1>
        <p className="text-muted-foreground">
          {t("uploadLanguageTestTranscripts")}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3 mb-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("totalAnalyses")}</p>
                <p className="text-2xl font-bold">3</p>
              </div>
              <BarChart3 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("currentLevel")}</p>
                <p className="text-2xl font-bold">B2</p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{t("latestScore")}</p>
                <p className="text-2xl font-bold">57%</p>
              </div>
              <FileText className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("uploadTestTranscript")}</CardTitle>
            <p className="text-sm text-muted-foreground">
              {t("uploadLanguageTestScoreReport")}
            </p>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-2">
                {selectedFile ? selectedFile.name : t("noFileChosen")}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                {t("dragDropOrClickToUpload")}
              </p>
              <p className="text-xs text-muted-foreground mb-4">
                {t("supportsFileFormats")}
              </p>
              <input
                type="file"
                accept=".jpg,.jpeg,.png,.webp,.pdf"
                onChange={handleFileSelect}
                className="hidden"
                id="file-upload"
              />
              <Button asChild>
                <label htmlFor="file-upload" className="cursor-pointer">
                  {t("selectFile")}
                </label>
              </Button>
            </div>
            
            <Button className="w-full" disabled={!selectedFile}>
              {t("uploadAndAnalyze")}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("whatOurAiCanAnalyze")}</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li>{t("overallScoresAndCefrLevels")}</li>
              <li>{t("individualSkillBreakdowns")}</li>
              <li>{t("strengthsAndAreasForImprovement")}</li>
              <li>{t("progressTrackingOverTime")}</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>{t("analysisResults")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              No analysis results yet. Upload a test transcript to get started.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t("progressTimeline")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-muted-foreground py-8">
              Progress timeline will appear here after analysis.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Progress;
