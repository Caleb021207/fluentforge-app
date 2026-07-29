import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { useLearningPath } from "@/hooks/useLearningPath";
import { BookOpen, CheckCircle2, Lock, Layers, Sparkles } from "lucide-react";

/** The learner's path through the persistent curriculum. */
const Learn: React.FC = () => {
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { units, courseTitle, dueReviews, loading, error } = useLearningPath();

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!isAuthenticated) return <AuthRequiredPrompt />;

  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">{courseTitle || "Learning Path"}</h1>
          <p className="text-muted-foreground mt-1">
            Structured units aligned to CEFR and WIDA can-do statements.
          </p>
        </div>
        <Button onClick={() => navigate("/review")} variant={dueReviews > 0 ? "default" : "outline"}>
          <Layers className="mr-2 h-4 w-4" />
          Vocabulary review{dueReviews > 0 ? ` (${dueReviews} due)` : ""}
        </Button>
      </header>

      {error && (
        <Card>
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

      <div className="space-y-6">
        {units.map((unit) => (
          <Card key={unit.id} className={unit.unlocked ? "" : "opacity-70"}>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="space-y-1">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    {unit.unlocked ? (
                      <BookOpen className="h-5 w-5 text-primary" />
                    ) : (
                      <Lock className="h-5 w-5 text-muted-foreground" />
                    )}
                    Unit {unit.position + 1}: {unit.title}
                  </CardTitle>
                  {unit.can_do_statement && (
                    <p className="text-sm text-muted-foreground max-w-2xl">{unit.can_do_statement}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {unit.cefr_level && <Badge variant="outline">{unit.cefr_level}</Badge>}
                  {unit.theme && <Badge variant="secondary">{unit.theme}</Badge>}
                </div>
              </div>
              <div className="pt-3">
                <Progress value={unit.progressPct} className="h-2" />
                <p className="text-xs text-muted-foreground mt-1">{unit.progressPct}% mastered</p>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {!unit.unlocked && (
                <p className="text-sm text-muted-foreground">
                  Master every skill in the previous unit to unlock this one.
                </p>
              )}

              {unit.skills.map((skill) => (
                <div key={skill.id} className="rounded-lg border p-4 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {skill.mastered ? (
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      ) : (
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                      )}
                      <span className="font-medium">{skill.title}</span>
                      <Badge variant="outline" className="text-xs capitalize">
                        {skill.type}
                      </Badge>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      mastery {Math.round(skill.mastery * 100)}% · {skill.attempts} attempts
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skill.lessons.map((lesson) => (
                      <Button
                        key={lesson.id}
                        size="sm"
                        variant={lesson.progress?.completed_at ? "secondary" : "outline"}
                        disabled={!unit.unlocked}
                        onClick={() => navigate(`/lessons/${lesson.id}`)}
                      >
                        {lesson.progress?.completed_at && <CheckCircle2 className="mr-2 h-3 w-3" />}
                        {lesson.title}
                      </Button>
                    ))}
                    {!skill.lessons.length && (
                      <span className="text-xs text-muted-foreground">No published lessons yet.</span>
                    )}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Learn;
