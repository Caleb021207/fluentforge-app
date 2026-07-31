import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import AuthRequiredPrompt from "@/components/auth/AuthRequiredPrompt";
import {
  useLessonRunner,
  renderKind,
  type AttemptResponse,
  type GradeResult,
  type LearnExercise,
  type RenderKind,
} from "@/hooks/useLessonRunner";
import { applyGrade, endOfPassOutcome } from "@/utils/lessonQueue";
import SpeakButton from "@/components/ui/speak-button";
import { cn } from "@/lib/utils";
import { ArrowLeft, CheckCircle2, XCircle, Trophy, Flame, RotateCcw } from "lucide-react";

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

const asExpectedText = (expected: GradeResult["expected"]): string | null => {
  if (expected == null) return null;
  return Array.isArray(expected) ? expected.filter(Boolean).join(" · ") : String(expected);
};

/** Tokens for the tap-to-order renderer: served tokens, else the options. */
const orderTokensOf = (ex: LearnExercise): { id: string; label: string }[] => {
  if (ex.content?.tokens?.length) return ex.content.tokens.map((t) => ({ id: t.id, label: t.text }));
  return (ex.options ?? []).map((o) => ({ id: o.id, label: o.label }));
};

/** Word tokens for error-spot: served sentence tokens, else split the prompt. */
const errorTokensOf = (ex: LearnExercise): { id: string; text: string }[] => {
  if (ex.content?.sentence_tl?.length) return ex.content.sentence_tl.map((t) => ({ id: t.id, text: t.text }));
  return plainText(ex.prompt)
    .split(/\s+/)
    .filter(Boolean)
    .map((w, i) => ({ id: `w${i + 1}`, text: w }));
};

/**
 * Plays a lesson from the persistent curriculum.
 *
 * Every item is served without its answer key and graded by `submit-exercise`,
 * so nothing here can reveal or decide correctness on its own. Completion is
 * the server's verdict too: after each pass, exercises without a correct
 * answer this session are re-queued until `submit-exercise` reports the
 * lesson complete or the learner exits (plan 02 F2-2).
 */
const LessonPlayer: React.FC = () => {
  const { lessonId } = useParams<{ lessonId: string }>();
  const navigate = useNavigate();
  const { isLoading, isAuthenticated } = useAuthGuard();
  const { lesson, exercises, passage, mastery, loading, error, submit } = useLessonRunner(lessonId);

  const [index, setIndex] = useState(0);
  // Per-primitive draft state; only one is active per item, all reset on Next.
  const [selected, setSelected] = useState<string | null>(null);
  const [textDraft, setTextDraft] = useState("");
  const [blankDraft, setBlankDraft] = useState<Record<string, string>>({});
  const [orderDraft, setOrderDraft] = useState<string[]>([]);
  const [markDraft, setMarkDraft] = useState<string[]>([]);
  const [result, setResult] = useState<GradeResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [startedAt, setStartedAt] = useState(() => Date.now());
  const [finished, setFinished] = useState(false);
  // Re-queue bookkeeping. `queue` is null on the first full pass; after that
  // it holds the ids being retried. `wrongIds` = no correct answer yet this
  // session. `lessonState` is the server's own solved/total verdict.
  const [queue, setQueue] = useState<string[] | null>(null);
  const [wrongIds, setWrongIds] = useState<string[]>([]);
  const [round, setRound] = useState(1);
  const [lessonState, setLessonState] = useState<GradeResult["lesson"] | null>(null);
  const [pendingQueue, setPendingQueue] = useState<string[] | null>(null);

  const byId = useMemo(() => new Map(exercises.map((ex) => [ex.id, ex])), [exercises]);
  const passIds = useMemo(() => queue ?? exercises.map((ex) => ex.id), [queue, exercises]);
  const current = byId.get(passIds[index] ?? "");
  const total = passIds.length;

  const kind: RenderKind = current ? renderKind(current) : "unsupported";
  const orderTokens = useMemo(() => (current ? orderTokensOf(current) : []), [current]);
  const errorTokens = useMemo(() => (current ? errorTokensOf(current) : []), [current]);
  const blanks = current?.content?.blanks ?? [];

  const resetDrafts = () => {
    setSelected(null);
    setTextDraft("");
    setBlankDraft({});
    setOrderDraft([]);
    setMarkDraft([]);
  };

  useEffect(() => {
    setStartedAt(Date.now());
  }, [index, round]);

  // A fresh exercise set (reload / different lesson) resets the session.
  useEffect(() => {
    setQueue(null);
    setWrongIds([]);
    setRound(1);
    setLessonState(null);
    setPendingQueue(null);
    setIndex(0);
    setResult(null);
    setFinished(false);
    resetDrafts();
  }, [exercises]);

  // Count the current item once it's been answered so the bar reaches 100%.
  const progressPct = useMemo(
    () => (total ? Math.round(((index + (result ? 1 : 0)) / total) * 100) : 0),
    [index, total, result],
  );

  const canSubmit = useMemo(() => {
    switch (kind) {
      case "mcq":
        return !!selected;
      case "text":
        return textDraft.trim().length > 0;
      case "cloze":
        return blanks.length > 0 && blanks.every((b) => (blankDraft[b.id] ?? "").trim().length > 0);
      case "order":
        return orderTokens.length > 0 && orderDraft.length === orderTokens.length;
      case "error_spot":
        return markDraft.length > 0;
      default:
        return false;
    }
  }, [kind, selected, textDraft, blanks, blankDraft, orderTokens, orderDraft, markDraft]);

  const buildResponse = (): AttemptResponse => {
    switch (kind) {
      case "mcq":
        return { selected_option: selected };
      case "text":
        return { text: textDraft };
      case "cloze":
        return { blanks: blankDraft };
      case "order":
        return {
          ordered_tokens: orderDraft,
          ordered_texts: orderDraft.map((id) => orderTokens.find((t) => t.id === id)?.label ?? ""),
        };
      case "error_spot":
        return { selected_tokens: markDraft };
      default:
        return {};
    }
  };

  const handleSubmit = async () => {
    if (!current || !canSubmit || submitting) return;
    setSubmitting(true);
    const graded = await submit(current.id, buildResponse(), Date.now() - startedAt);
    setSubmitting(false);
    if (!graded) {
      toast.error("Could not submit your answer. Please try again.");
      return;
    }
    setResult(graded);
    setWrongIds((ids) => applyGrade(ids, current.id, graded.correct));
    setLessonState(graded.lesson ?? null);
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
    resetDrafts();
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      return;
    }
    // End of pass: the server decides completion; missed items get another go.
    const outcome = endOfPassOutcome({
      serverComplete: lessonState?.complete ?? false,
      passOrder: passIds,
      wrongIds,
    });
    if (outcome.kind === "requeue") setPendingQueue(outcome.queue);
    else setFinished(true);
  };

  const startRetryPass = () => {
    if (!pendingQueue) return;
    setQueue(pendingQueue);
    setPendingQueue(null);
    setIndex(0);
    setResult(null);
    resetDrafts();
    setRound((r) => r + 1);
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

  // Between passes: the server says the lesson is not complete yet, and some
  // questions from this pass can be practiced again.
  if (pendingQueue && !finished) {
    const solved = lessonState?.solved ?? 0;
    const lessonTotal = lessonState?.total ?? total;
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <RotateCcw className="h-5 w-5 text-primary" />
              Almost there
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              You solved {solved} of {lessonTotal}. Practice the ones you missed.
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={startRetryPass} className="sheen">
                Practice {pendingQueue.length} missed{" "}
                {pendingQueue.length === 1 ? "question" : "questions"}
              </Button>
              <Button variant="outline" onClick={() => navigate("/learn")}>
                Stop for now
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (finished || !total) {
    // Honest end screen: "Lesson complete" only when the server says so.
    const complete = lessonState?.complete ?? false;
    const solved = lessonState?.solved ?? 0;
    const lessonTotal = lessonState?.total ?? total;
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {complete ? (
                <Trophy className="h-5 w-5 text-primary" />
              ) : (
                <Flame className="h-5 w-5 text-primary" />
              )}
              {!total ? "Nothing to practice yet" : complete ? "Lesson complete" : "Almost there"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {total > 0 && complete && (
              <p className="text-muted-foreground">
                You solved all {lessonTotal} questions. Skill mastery is now{" "}
                {Math.round(mastery * 100)}%.
              </p>
            )}
            {total > 0 && !complete && (
              <p className="text-muted-foreground">
                You solved {solved} of {lessonTotal} questions. Come back later to finish this
                lesson.
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

  // Defensive: index always points into passIds, whose ids come from
  // `exercises`, so `current` is only missing during an impossible state.
  if (!current) return null;

  const locked = Boolean(result) || submitting;
  const expectedText = result ? asExpectedText(result.expected) : null;
  const partialFor = (part: string) => result?.partials?.find((p) => p.part === part)?.score ?? null;

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
            {round > 1 ? " · practice round" : ""}
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
          {/* ---- multiple choice / meaning recognition ---- */}
          {kind === "mcq" &&
            current.options.map((option, i) => {
              const isPicked = selected === option.id;
              const isKey = result?.correct_option_id === option.id;
              const showWrong = Boolean(result) && isPicked && !result?.correct;
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

          {/* ---- text input: cloze (single) / word + chunk retrieval ---- */}
          {kind === "text" && (
            <div className="space-y-2">
              <label htmlFor="answer-input" className="text-sm font-medium text-muted-foreground">
                Type your answer
              </label>
              <Input
                id="answer-input"
                autoComplete="off"
                autoCapitalize="off"
                spellCheck={false}
                value={textDraft}
                disabled={locked}
                onChange={(e) => setTextDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && canSubmit && !locked) handleSubmit();
                }}
                className={cn(
                  "text-lg",
                  result && (result.correct ? "border-brand-mint/60" : "border-destructive/60"),
                )}
              />
            </div>
          )}

          {/* ---- cloze: one labeled input per blank ---- */}
          {kind === "cloze" && (
            <div className="space-y-3">
              {blanks.map((b, i) => {
                const blankScore = result ? partialFor(b.id) : null;
                return (
                  <div key={b.id} className="space-y-1">
                    <label
                      htmlFor={`blank-${b.id}`}
                      className="text-sm font-medium text-muted-foreground"
                    >
                      Blank {i + 1}
                    </label>
                    {b.mode === "choice" && Array.isArray(b.options) ? (
                      <div className="flex flex-wrap gap-2">
                        {b.options.map((opt) => (
                          <button
                            key={opt.id}
                            type="button"
                            disabled={locked}
                            aria-pressed={blankDraft[b.id] === opt.id}
                            onClick={() => setBlankDraft((d) => ({ ...d, [b.id]: opt.id }))}
                            className={cn(
                              "rounded-lg border px-3 py-2 text-sm transition-colors",
                              blankDraft[b.id] === opt.id
                                ? "border-brand-sky/60 bg-brand-sky/10"
                                : "border-border/60 bg-background/40 hover:border-brand-sky/40",
                            )}
                          >
                            {opt.text}
                          </button>
                        ))}
                      </div>
                    ) : (
                      <Input
                        id={`blank-${b.id}`}
                        autoComplete="off"
                        spellCheck={false}
                        value={blankDraft[b.id] ?? ""}
                        disabled={locked}
                        onChange={(e) => setBlankDraft((d) => ({ ...d, [b.id]: e.target.value }))}
                        className={cn(
                          blankScore != null &&
                            (blankScore >= 1 ? "border-brand-mint/60" : "border-destructive/60"),
                        )}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* ---- tap-to-order: sentence construction ---- */}
          {kind === "order" && (
            <div className="space-y-3">
              <div
                className="flex min-h-[3rem] flex-wrap gap-2 rounded-xl border border-dashed border-border/60 p-2"
                aria-label="Your sentence"
              >
                {orderDraft.length === 0 && (
                  <span className="px-1 py-1.5 text-sm text-muted-foreground">
                    Tap the words in order
                  </span>
                )}
                {orderDraft.map((id, pos) => {
                  const tok = orderTokens.find((t) => t.id === id);
                  return (
                    <button
                      key={`${id}-${pos}`}
                      type="button"
                      disabled={locked}
                      aria-label={`Remove ${tok?.label ?? ""} from position ${pos + 1}`}
                      onClick={() => setOrderDraft((o) => o.filter((_, k) => k !== pos))}
                      className="rounded-lg border border-brand-sky/50 bg-brand-sky/10 px-3 py-2 text-sm"
                    >
                      {tok?.label}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap gap-2">
                {orderTokens
                  .filter((t) => !orderDraft.includes(t.id))
                  .map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      disabled={locked}
                      aria-label={`Add ${t.label}`}
                      onClick={() => setOrderDraft((o) => [...o, t.id])}
                      className="rounded-lg border border-border/60 bg-background/40 px-3 py-2 text-sm transition-colors hover:border-brand-sky/40 hover:bg-brand-sky/[0.07]"
                    >
                      {t.label}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* ---- tap-to-mark: error spot ---- */}
          {kind === "error_spot" && (
            <div className="flex flex-wrap gap-2" role="group" aria-label="Tap the word that is wrong">
              {errorTokens.map((tok) => {
                const marked = markDraft.includes(tok.id);
                const isError = Array.isArray(result?.expected) && result?.expected.includes(tok.id);
                return (
                  <button
                    key={tok.id}
                    type="button"
                    disabled={locked}
                    aria-pressed={marked}
                    onClick={() =>
                      setMarkDraft((m) => (m.includes(tok.id) ? m.filter((x) => x !== tok.id) : [...m, tok.id]))
                    }
                    className={cn(
                      "rounded-lg border px-3 py-2 text-base transition-colors",
                      result && isError
                        ? "border-brand-mint/60 bg-brand-mint/15"
                        : marked
                          ? "border-brand-sky/60 bg-brand-sky/10"
                          : "border-border/60 bg-background/40 hover:border-brand-sky/40",
                    )}
                  >
                    {tok.text}
                  </button>
                );
              })}
            </div>
          )}

          {/* ---- graded feedback (non-MCQ answer reveal) ---- */}
          {result && kind !== "mcq" && (
            <div
              className={cn(
                "flex items-start gap-2 rounded-xl border-l-2 px-4 py-3",
                result.correct
                  ? "border-brand-mint/60 bg-brand-mint/[0.08]"
                  : "border-destructive/60 bg-destructive/[0.08]",
              )}
            >
              {result.correct ? (
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-brand-mint" />
              ) : (
                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-destructive" />
              )}
              <div className="space-y-0.5 text-sm">
                <p className="font-medium">{result.correct ? "Correct" : "Not quite"}</p>
                {!result.correct && expectedText && kind !== "error_spot" && (
                  <p className="text-muted-foreground">
                    Answer: <span className="text-foreground">{expectedText}</span>
                  </p>
                )}
              </div>
            </div>
          )}

          {result?.explanation && (
            <div className="rounded-xl border-l-2 border-brand-sky/50 bg-brand-sky/[0.06] px-4 py-3">
              <p className="text-sm text-muted-foreground">{renderInline(result.explanation)}</p>
            </div>
          )}

          <div className="pt-3">
            {result ? (
              <Button onClick={handleNext} size="lg" className="sheen w-full sm:w-auto">
                {index + 1 < total
                  ? "Next question"
                  : lessonState?.complete
                    ? "Finish lesson"
                    : "Continue"}
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                disabled={!canSubmit || submitting}
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
