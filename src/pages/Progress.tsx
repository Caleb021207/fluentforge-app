import { useNavigate } from "react-router-dom";
import { InteractiveCard } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress as ProgressBar } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  BarChart3,
  TrendingUp,
  Loader2,
  Flame,
  Trophy,
  Layers,
  BookOpen,
  ArrowRight,
} from "lucide-react";
import { useLocalization } from "@/contexts/LocalizationContext";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { useProgressData } from "@/hooks/useProgressData";
import { useLearningPath } from "@/hooks/useLearningPath";
import { useGamification } from "@/hooks/useGamification";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { motion } from "framer-motion";

/**
 * The learner's real progress: curriculum mastery, XP/streak, review load, and
 * transcript-analysis results (uploads live at /analysis).
 */
const Progress = () => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { t } = useLocalization();
  const { totalAnalyses, currentLevel, latestScore, isLoading: progressLoading } = useProgressData();
  const { units, loading: pathLoading, dueReviews } = useLearningPath();
  const { progression } = useGamification();

  if (isLoading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="relative min-h-screen">
        <AuthRequiredPrompt />
      </div>
    );
  }

  const kpis = [
    {
      label: t("currentLevel"),
      value: currentLevel || (progression ? `Level ${progression.current_level}` : "—"),
      icon: TrendingUp,
    },
    {
      label: "Total XP",
      value: progression ? progression.total_xp.toLocaleString() : "—",
      icon: Trophy,
    },
    {
      label: "Day streak",
      value: progression ? String(progression.current_streak_days ?? 0) : "—",
      icon: Flame,
    },
    {
      label: "Words to review",
      value: String(dueReviews),
      icon: Layers,
    },
  ];

  return (
    <div className="relative min-h-screen">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-4 relative z-10 space-y-6"
      >
        <div className="text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">Your Progress</h1>
          <p className="text-lg text-muted-foreground">
            Everything you have learned, in one place.
          </p>
        </div>

        {/* KPI row */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
          {kpis.map(({ label, value, icon: Icon }) => (
            <InteractiveCard key={label}>
              <div className="p-5">
                <div className="flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs text-muted-foreground truncate">{label}</p>
                    <p className="text-xl font-bold truncate">{value}</p>
                  </div>
                  <Icon className="h-7 w-7 shrink-0 text-primary" />
                </div>
              </div>
            </InteractiveCard>
          ))}
        </div>

        {/* Curriculum mastery */}
        <InteractiveCard>
          <div className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-primary" /> Course progress
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigate("/learn")}>
                Go to lessons <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>

            {pathLoading ? (
              <div className="flex justify-center py-6">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : units.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">
                Your course will appear here once you start learning.
              </p>
            ) : (
              <div className="space-y-3">
                {units.map((unit) => (
                  <div key={unit.id} className="space-y-1">
                    <div className="flex items-center justify-between gap-2 text-sm">
                      <span className="font-medium truncate">
                        Unit {unit.position + 1}: {unit.title}
                      </span>
                      <span className="flex items-center gap-2 shrink-0">
                        {unit.cefr_level && (
                          <Badge variant="outline" className="text-[10px]">
                            {unit.cefr_level}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">{unit.progressPct}%</span>
                      </span>
                    </div>
                    <ProgressBar value={unit.progressPct} className="h-2" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </InteractiveCard>

        {/* Transcript analyses */}
        <InteractiveCard>
          <div className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" /> {t("aiProgressAnalysis")}
              </h3>
              <Button variant="outline" size="sm" onClick={() => navigate("/analysis")}>
                Upload a transcript <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-6 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                {progressLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                ) : (
                  <span>
                    {totalAnalyses} {t("totalAnalyses")}
                  </span>
                )}
              </div>
              {latestScore !== null && (
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {t("latestScore")}: {latestScore}%
                  </span>
                </div>
              )}
            </div>
          </div>
        </InteractiveCard>
      </motion.div>
    </div>
  );
};

export default Progress;
