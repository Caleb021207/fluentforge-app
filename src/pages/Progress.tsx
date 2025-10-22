import { useState } from "react";
import { InteractiveCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, BarChart3, TrendingUp } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { motion } from "framer-motion";

const Progress = () => {
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { t } = useLocalization();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center">
        <GradientBlob className="top-20 left-10" />
        <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
        <GradientBlob className="top-20 left-10" />
        <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
        <AuthRequiredPrompt />
      </div>
    );
  }

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-4 relative z-10"
      >
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text">
            {t("aiProgressAnalysis")}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            {t("uploadLanguageTestTranscripts")}
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-6">
          <InteractiveCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("totalAnalyses")}</p>
                  <p className="text-xl font-bold">3</p>
                </div>
                <BarChart3 className="h-8 w-8 text-primary" />
              </div>
            </div>
          </InteractiveCard>
          
          <InteractiveCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("currentLevel")}</p>
                  <p className="text-xl font-bold">B2</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary" />
              </div>
            </div>
          </InteractiveCard>
          
          <InteractiveCard>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{t("latestScore")}</p>
                  <p className="text-xl font-bold">57%</p>
                </div>
                <FileText className="h-8 w-8 text-primary" />
              </div>
            </div>
          </InteractiveCard>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <InteractiveCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-2">{t("uploadTestTranscript")}</h3>
              <p className="text-sm text-muted-foreground mb-4">
                {t("uploadLanguageTestScoreReport")}
              </p>
              <div className="space-y-4">
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
              </div>
            </div>
          </InteractiveCard>

          <InteractiveCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t("whatOurAiCanAnalyze")}</h3>
              <ul className="space-y-2 text-sm">
                <li>{t("overallScoresAndCefrLevels")}</li>
                <li>{t("individualSkillBreakdowns")}</li>
                <li>{t("strengthsAndAreasForImprovement")}</li>
                <li>{t("progressTrackingOverTime")}</li>
              </ul>
            </div>
          </InteractiveCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <InteractiveCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t("analysisResults")}</h3>
              <p className="text-center text-muted-foreground py-8">
                No analysis results yet. Upload a test transcript to get started.
              </p>
            </div>
          </InteractiveCard>

          <InteractiveCard>
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4">{t("progressTimeline")}</h3>
              <p className="text-center text-muted-foreground py-8">
                Progress timeline will appear here after analysis.
              </p>
            </div>
          </InteractiveCard>
        </div>
      </motion.div>
    </div>
  );
};

export default Progress;
