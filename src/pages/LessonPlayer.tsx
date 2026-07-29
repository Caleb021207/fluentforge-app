import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import { useLessonRunner, GradeResult } from "@/hooks/useLessonRunner";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Flame } from "lucide-react";

/**
 * Plays a lesson from the persistent curriculum.
 *
 * Every item is served without its answer key and graded by `submit-exercise`,
 * so nothing here can reveal or decide correctness on its own.
 */
const LessonPlayer: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { lesson, exercises, passage, mastery, loading, error, submit } = useLessonRunner(lessonId);

  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);

  const current = exercises[index];
  const total = exercises.length;

  useEffect(() => {
    setStartedAt(Date.now());
  }, [index]);

  const progressPct = useMemo(
    () => (total ? Math.round((index / total) * 100) : 0),
    [index, total],
  );

  const handleSubmit = async () => {
    if (!current || !selected || submitting) return;
    setSubmitting(true);
    const graded = await submit(current.id, selected, Date.now() - startedAt);
    setSubmitting(false);
    if (!graded) {
      toast.error("Could not submit your answer. Please try again.");
      return;
    }
    setResult(graded);
    if (graded.correct) setCorrectCount((c) => c + 1);
    if (graded.xp_awarded > 0) {
      toast.success(`+${graded.xp_awarded} XP`, {
        description: graded.xp_reasons.join(" · ") || undefined,
      });
    }
    if (graded.mastery?.newly_mastered) {
      toast.success("Skill mastered!", { description: lesson?.skill.title });
    }
  };

  const handleNext = () => {
    setResult(null);
    setSelected(null);
    if (index + 1 >= total) setFinished(true);
    else setIndex((i) => i + 1);
  };

  if (isLoading || loading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!isAuthenticated) return <AuthRequiredPrompt />;

  if (error || !lesson) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <p className="text-destructive">{error ?? "This lesson is not available."}</p>
            <Button variant="outline" onClick={() => navigate("/learn")}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to path
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (finished || !total) {
    const accuracy = total ? Math.round((correctCount / total) * 100) : 0;
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-primary" />
              {total ? "Lesson complete" : "Nothing to practice yet"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {total > 0 && (
              <p className="text-muted-foreground">
                You answered {correctCount} of {total} correctly ({accuracy}%). Skill mastery is now{" "}
                {Math.round(mastery * 100)}%.
              </p>
            )}
            {!total && (
              <p className="text-muted-foreground">
                This lesson has no published exercises yet. Check back once new content is approved.
              </p>
            )}
            <div className="flex gap-2">
              <Button onClick={() => navigate("/learn")}>Back to path</Button>
              <Button variant="outline" onClick={() => navigate("/review")}>
                Vocabulary review
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-3xl space-y-6">
      <div className="flex items-center justify-between gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/learn")}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Path
        </Button>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Flame className="h-4 w-4" />
          Mastery {Math.round(mastery * 100)}%
        </div>
      </div>

      <div className="space-y-2">
        <h1 className="text-2xl font-bold">{lesson.title}</h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline">{lesson.unit.title}</Badge>
          {lesson.unit.cefr_level && <Badge variant="secondary">{lesson.unit.cefr_level}</Badge>}
          <Badge variant="outline" className="capitalize">
            {lesson.skill.type}
          </Badge>
        </div>
        {lesson.unit.can_do_statement && (
          <p className="text-sm text-muted-foreground">{lesson.unit.can_do_statement}</p>
        )}
        <Progress value={progressPct} className="h-2" />
        <p className="text-xs text-muted-foreground">
          Item {index + 1} of {total}
        </p>
      </div>

      {passage && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{passage.title ?? "Reading"}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line leading-relaxed">{passage.body}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{current.prompt}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {current.options.map((option) => {
            const isPicked = selected === option.id;
            const isKey = result?.correct_option_id === option.id;
            const showWrong = Boolean(result) && isPicked && !result?.correct;
            return (
              <button
                key={option.id}
                type="button"
                disabled={Boolean(result) || submitting}
                onClick={() => setSelected(option.id)}
                className={`w-full rounded-lg border p-3 text-left transition-colors ${
                  result && isKey
                    ? "border-green-500 bg-green-500/10"
                    : showWrong
                      ? "border-destructive bg-destructive/10"
                      : isPicked
                        ? "border-primary bg-primary/5"
                        : "hover:bg-muted"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  {option.label}
                  {result && isKey && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  {showWrong && <XCircle className="h-4 w-4 text-destructive" />}
                </span>
              </button>
            );
          })}

          {result?.explanation && (
            <p className="text-sm text-muted-foreground border-l-2 border-primary/30 pl-3">
              {result.explanation}
            </p>
          )}

          <div className="pt-2">
            {result ? (
              <Button onClick={handleNext}>{index + 1 >= total ? "Finish" : "Next"}</Button>
            ) : (
              <Button onClick={handleSubmit} disabled={!selected || submitting}>
                {submitting ? "Checking…" : "Check answer"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LessonPlayer;
