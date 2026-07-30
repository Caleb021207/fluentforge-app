import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { useLearningPath } from "@/hooks/useLearningPath";
import StudentHomePanel from "@/components/learner/StudentHomePanel";
import { BookOpen, CheckCircle2, Lock, Layers, Sparkles, Play } from "lucide-react";
import { cn } from "@/lib/utils";

/** Thin gradient meter used for unit mastery. */
const BrandBar: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
  <div className={cn("h-2 w-full overflow-hidden rounded-full bg-muted/60", className)}>
    <div
      className="h-full rounded-full bg-brand-gradient transition-all duration-700"
      style={{ width: `${Math.max(value, value > 0 ? 4 : 0)}%` }}
    />
  </div>
);

/** The learner's path through the persistent curriculum. */
const Learn: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { units, courseTitle, dueReviews, loading, error } = useLearningPath();

  if (isLoading || loading) {
    return (
      <div className="container mx-auto space-y-4 px-4 py-8">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!isAuthenticated) return <AuthRequiredPrompt />;

  return (
    <div className="container mx-auto space-y-8 px-4 py-8">
      {/* ---------- Header ---------- */}
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1">
          <h1 className="gradient-text text-balance text-4xl font-bold tracking-tight md:text-5xl">
            {courseTitle || "Learning Path"}
          </h1>
          <p className="text-muted-foreground">
            Structured units aligned to CEFR and WIDA can-do statements.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="outlineGradient" onClick={() => navigate("/placement-quiz")}>
            <Sparkles className="mr-2 h-4 w-4" />
            Placement quiz
          </Button>
          <Button
            variant={dueReviews > 0 ? "default" : "outlineGradient"}
            onClick={() => navigate("/review")}
            className={dueReviews > 0 ? "sheen" : undefined}
          >
            <Layers className="mr-2 h-4 w-4" />
            Vocabulary review{dueReviews > 0 ? ` (${dueReviews} due)` : ""}
          </Button>
        </div>
      </header>

      <StudentHomePanel units={units} dueReviews={dueReviews} />

      {error && (
        <Card className="border-destructive/40">
          <CardContent className="pt-6 text-sm text-destructive">{error}</CardContent>
        </Card>
      )}

      {!units.length && !error && (
        <Card>
          <CardContent className="pt-6 text-muted-foreground">
            No published units yet. Approved curriculum content will appear here.
          </CardContent>
        </Card>
      )}

      {/* ---------- Units ---------- */}
      <div className="space-y-6">
        {units.map((unit) => {
          const locked = !unit.unlocked;
          return (
            <Card
              key={unit.id}
              className={cn(
                "overflow-hidden transition-all duration-300",
                locked ? "opacity-60" : "gradient-border hover:shadow-brand",
              )}
            >
              {/* Unit header */}
              <div className="relative p-6">
                {/* Soft brand wash behind the header of unlocked units */}
                {!locked && (
                  <div
                    aria-hidden
                    className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-sky/[0.07] via-transparent to-brand-mint/[0.07]"
                  />
                )}

                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex min-w-0 items-start gap-4">
                    {/* Unit number medallion */}
                    <div
                      className={cn(
                        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold",
                        locked
                          ? "bg-muted text-muted-foreground"
                          : "bg-brand-gradient text-[#06263A] shadow-brand",
                      )}
                    >
                      {locked ? <Lock className="h-5 w-5" /> : unit.position + 1}
                    </div>

                    <div className="min-w-0 space-y-1.5">
                      <h2 className="flex items-center gap-2 text-xl font-bold tracking-tight">
                        {unit.title}
                      </h2>
                      {unit.can_do_statement && (
                        <p className="max-w-2xl text-pretty text-sm text-muted-foreground">
                          {unit.can_do_statement}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {unit.cefr_level && (
                      <Badge className="border-0 bg-brand-gradient font-semibold text-[#06263A]">
                        {unit.cefr_level}
                      </Badge>
                    )}
                    {unit.theme && (
                      <Badge variant="outline" className="border-brand-sky/30">
                        {unit.theme}
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Mastery meter */}
                <div className="mt-5 space-y-1.5">
                  <BrandBar value={unit.progressPct} />
                  <p className="text-xs font-medium text-muted-foreground">
                    Skill mastery: <span className="text-foreground">{unit.progressPct}%</span>
                  </p>
                </div>
              </div>

              <CardContent className="space-y-3 pt-0">
                {locked && (
                  <p className="rounded-xl border border-border/60 bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
                    Finish the previous unit's lessons (or master its skills) to unlock this one —
                    or take the placement quiz to skip ahead.
                  </p>
                )}

                {unit.skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="rounded-xl border border-border/50 bg-background/30 p-4 transition-colors hover:border-brand-sky/30"
                  >
                    <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        {skill.mastered ? (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-mint/20">
                            <CheckCircle2 className="h-4 w-4 text-brand-mint" />
                          </span>
                        ) : (
                          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted">
                            <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
                          </span>
                        )}
                        <span className="font-semibold">{skill.title}</span>
                        <Badge variant="outline" className="text-[10px] capitalize">
                          {skill.type}
                        </Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        mastery {Math.round(skill.mastery * 100)}% · {skill.attempts} attempts
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {skill.lessons.map((lesson) => {
                        const done = Boolean(lesson.progress?.completed_at);
                        return (
                          <button
                            key={lesson.id}
                            disabled={locked}
                            onClick={() => navigate(`/lessons/${lesson.id}`)}
                            className={cn(
                              "group inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-all duration-300",
                              locked && "cursor-not-allowed opacity-50",
                              done
                                ? "bg-brand-mint/15 text-brand-mint ring-1 ring-brand-mint/30 hover:bg-brand-mint/25"
                                : "bg-background/60 ring-1 ring-border hover:-translate-y-0.5 hover:bg-brand-sky/10 hover:ring-brand-sky/40",
                            )}
                          >
                            {done ? (
                              <CheckCircle2 className="h-3.5 w-3.5" />
                            ) : (
                              <Play className="h-3.5 w-3.5 transition-transform group-hover:scale-110" />
                            )}
                            {lesson.title}
                          </button>
                        );
                      })}
                      {!skill.lessons.length && (
                        <span className="text-xs text-muted-foreground">
                          No published lessons yet.
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default Learn;
