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
import SpeakButton from "@/components/ui/speak-button";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Flame } from "lucide-react";

/**
 * Authored content uses **markdown bold** for the target word. Render it as
 * real emphasis instead of leaking asterisks into the prompt.
 */
const renderInline = (text: string): React.ReactNode =>
  text.split(/(\*\*[^*]+\*\*)/g).map((part, i) =>
    part.startsWith("**") && part.endsWith("**") ? (
      <strong key={i} className="font-bold text-brand-sky">
        {part.slice(2, -2)}
      </strong>
    ) : (
      <React.Fragment key={i}>{part}</React.Fragment>
    ),
  );

/** Strip markdown markers for text handed to speech synthesis. */
const plainText = (text: string) => text.replace(/\*\*/g, "");

const OPTION_LETTERS = ["A", "B", "C", "D", "E", "F"];

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

  // Count the current item once it's been answered so the bar reaches 100%.
  const progressPct = useMemo(
    () => (total ? Math.round(((index + (result ? 1 : 0)) / total) * 100) : 0),
    [index, total, result],
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

      <div className="space-y-3">
        <h1 className="gradient-text text-3xl font-bold tracking-tight md:text-4xl">
          {lesson.title}
        </h1>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="border-brand-sky/30">
            {lesson.unit.title}
          </Badge>
          {lesson.unit.cefr_level && (
            <Badge className="border-0 bg-brand-gradient font-semibold text-[#06263A]">
              {lesson.unit.cefr_level}
            </Badge>
          )}
          <Badge variant="outline" className="capitalize">
            {lesson.skill.type}
          </Badge>
        </div>
        {lesson.unit.can_do_statement && (
          <p className="text-pretty text-sm text-muted-foreground">
            {lesson.unit.can_do_statement}
          </p>
        )}

        {/* Gradient progress */}
        <div className="space-y-1.5 pt-1">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-muted/60">
            <div
              className="h-full rounded-full bg-brand-gradient transition-all duration-500"
              style={{ width: `${Math.max(progressPct, 3)}%` }}
            />
          </div>
          <p className="text-xs font-medium text-muted-foreground">
            Question <span className="text-foreground">{index + 1}</span> of {total}
          </p>
        </div>
      </div>

      {passage && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center justify-between text-base">
              {passage.title ?? "Reading"}
              <SpeakButton text={passage.body} />
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line leading-relaxed">{passage.body}</p>
          </CardContent>
        </Card>
      )}

      <Card className="gradient-border overflow-hidden">
        <CardHeader className="relative">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-brand-sky/[0.07] to-transparent"
          />
          <CardTitle className="flex items-start justify-between gap-3 text-xl leading-snug">
            <span className="text-pretty">{renderInline(current.prompt)}</span>
            <SpeakButton text={plainText(current.prompt)} className="shrink-0" />
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2.5">
          {current.options.map((option, i) => {
            const isPicked = selected === option.id;
            const isKey = result?.correct_option_id === option.id;
            const showWrong = Boolean(result) && isPicked && !result?.correct;
            const locked = Boolean(result) || submitting;
            return (
              <button
                key={option.id}
                type="button"
                disabled={locked}
                onClick={() => setSelected(option.id)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-xl border p-3.5 text-left transition-all duration-200",
                  !locked && "hover:-translate-y-0.5",
                  result && isKey
                    ? "border-brand-mint/60 bg-brand-mint/15 shadow-[0_0_24px_-8px_hsl(var(--brand-mint)/0.6)]"
                    : showWrong
                      ? "border-destructive/60 bg-destructive/10"
                      : isPicked
                        ? "border-brand-sky/60 bg-brand-sky/10 shadow-[0_0_24px_-10px_hsl(var(--brand-sky)/0.7)]"
                        : "border-border/60 bg-background/40 hover:border-brand-sky/40 hover:bg-brand-sky/[0.07]",
                )}
              >
                {/* Letter badge */}
                <span
                  className={cn(
                    "flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold transition-colors",
                    result && isKey
                      ? "bg-brand-mint text-[#06263A]"
                      : showWrong
                        ? "bg-destructive text-destructive-foreground"
                        : isPicked
                          ? "bg-brand-gradient text-[#06263A]"
                          : "bg-muted text-muted-foreground group-hover:bg-brand-sky/20 group-hover:text-foreground",
                  )}
                >
                  {OPTION_LETTERS[i] ?? i + 1}
                </span>

                <span className="flex-1 text-pretty">{renderInline(option.label)}</span>

                {result && isKey && <CheckCircle2 className="h-5 w-5 shrink-0 text-brand-mint" />}
                {showWrong && <XCircle className="h-5 w-5 shrink-0 text-destructive" />}
              </button>
            );
          })}

          {result?.explanation && (
            <div className="rounded-xl border-l-2 border-brand-sky/50 bg-brand-sky/[0.06] px-4 py-3">
              <p className="text-sm text-muted-foreground">{renderInline(result.explanation)}</p>
            </div>
          )}

          <div className="pt-3">
            {result ? (
              <Button onClick={handleNext} size="lg" className="sheen w-full sm:w-auto">
                {index + 1 >= total ? "Finish lesson" : "Next question"}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!selected || submitting}
                size="lg"
                className="w-full sm:w-auto"
              >
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
