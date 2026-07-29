import { useMemo, useState } from "react";
import { Loader2, Sparkles, ChevronRight, BookOpen } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useCurriculum, useLessonExercises, CurriculumLesson } from "@/hooks/useCurriculum";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { GateResults, FunnelStats, statusVariant } from "@/components/author/GateResults";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useToast } from "@/hooks/use-toast";

const EXERCISE_TYPES = [
  "flashcard", "cloze", "matching", "ordering",
  "dictation", "listening_mc", "speaking", "translation", "dialogue",
];

function AuthorWorkspace() {
  const { toast } = useToast();
  const { courses, loading, error, reload } = useCurriculum();
  const [selected, setSelected] = useState<{ lesson: CurriculumLesson; unitTitle: string; skillTitle: string } | null>(null);
  const [type, setType] = useState("cloze");
  const [count, setCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [lastFunnel, setLastFunnel] = useState<{ generated: number; passed: number; failed: number } | null>(null);
  const [editing, setEditing] = useState<Record<string, string>>({});

  const { exercises, loading: loadingExercises, reload: reloadExercises, setStatus, updatePrompt } =
    useLessonExercises(selected?.lesson.id ?? null);

  const totals = useMemo(() => {
    const units = courses.flatMap((c) => c.units);
    const skills = units.flatMap((u) => u.skills);
    return {
      courses: courses.length,
      units: units.length,
      skills: skills.length,
      lessons: skills.flatMap((s) => s.lessons).length,
    };
  }, [courses]);

  const generate = async () => {
    if (!selected) return;
    setGenerating(true);
    setLastFunnel(null);
    try {
      const { data, error } = await supabase.functions.invoke("author-content", {
        body: { scope: { lesson_id: selected.lesson.id }, type, count },
      });
      if (error) throw new Error(error.message);
      if (data?.error) throw new Error(data.error);
      setLastFunnel(data.funnel);
      toast({
        title: "Authoring run complete",
        description: `${data.funnel.generated} generated · ${data.funnel.passed} passed all gates · ${data.funnel.failed} held as draft`,
      });
      reloadExercises();
    } catch (e) {
      toast({ title: "Authoring failed", description: (e as Error).message, variant: "destructive" });
    } finally {
      setGenerating(false);
    }
  };

  const changeStatus = async (id: string, status: "operational" | "retired") => {
    try {
      await setStatus(id, status);
      toast({ title: status === "operational" ? "Approved" : "Retired" });
    } catch (e) {
      toast({ title: "Update failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  const saveEdit = async (id: string) => {
    const prompt = editing[id];
    if (!prompt?.trim()) return;
    try {
      await updatePrompt(id, prompt.trim());
      setEditing((prev) => {
        const next = { ...prev };
        delete next[id];
        return next;
      });
      toast({ title: "Exercise updated" });
    } catch (e) {
      toast({ title: "Update failed", description: (e as Error).message, variant: "destructive" });
    }
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold">Curriculum Authoring</h1>
        <p className="text-sm text-muted-foreground">
          Generate content against the structure, review the quality gates, and publish approved items.
          {" "}
          {totals.courses} courses · {totals.units} units · {totals.skills} skills · {totals.lessons} lessons.
        </p>
      </header>

      {error && <p className="text-sm text-destructive">Failed to load curriculum: {error}</p>}

      <div className="grid gap-6 lg:grid-cols-[340px_1fr]">
        {/* ---------- curriculum tree ---------- */}
        <Card className="h-fit">
          <CardHeader>
            <CardTitle className="text-base">Curriculum tree</CardTitle>
            <CardDescription>Pick a lesson to author into.</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            ) : !courses.length ? (
              <p className="text-sm text-muted-foreground">
                No curriculum yet. Seed the starter course to get started.
              </p>
            ) : (
              <Accordion type="multiple" className="w-full">
                {courses.map((course) => (
                  <AccordionItem key={course.id} value={course.id}>
                    <AccordionTrigger className="text-sm">
                      {course.title}
                      <Badge variant="outline" className="ml-2">{course.level_band}</Badge>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-3">
                      {course.units.map((unit) => (
                        <div key={unit.id} className="space-y-1">
                          <p className="text-sm font-medium">
                            {unit.position + 1}. {unit.title}{" "}
                            <span className="text-xs text-muted-foreground">
                              {unit.cefr_level} · WIDA {unit.wida_level} · {unit.key_language_use}
                            </span>
                          </p>
                          {unit.can_do_statement && (
                            <p className="text-xs italic text-muted-foreground">“{unit.can_do_statement}”</p>
                          )}
                          {unit.skills.map((skill) => (
                            <div key={skill.id} className="ml-3 space-y-0.5">
                              <p className="text-xs font-medium text-muted-foreground">
                                {skill.title} ({skill.type})
                              </p>
                              {skill.lessons.map((lesson) => (
                                <button
                                  key={lesson.id}
                                  onClick={() => setSelected({ lesson, unitTitle: unit.title, skillTitle: skill.title })}
                                  className={`flex w-full items-center gap-1 rounded px-2 py-1 text-left text-xs hover:bg-muted ${
                                    selected?.lesson.id === lesson.id ? "bg-muted font-medium" : ""
                                  }`}
                                >
                                  <ChevronRight className="h-3 w-3" />
                                  {lesson.title}
                                </button>
                              ))}
                            </div>
                          ))}
                        </div>
                      ))}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            )}
            <Button variant="ghost" size="sm" className="mt-3" onClick={reload}>
              Refresh tree
            </Button>
          </CardContent>
        </Card>

        {/* ---------- authoring + review ---------- */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Generate content</CardTitle>
              <CardDescription>
                {selected
                  ? `Into ${selected.unitTitle} › ${selected.skillTitle} › ${selected.lesson.title}`
                  : "Select a lesson in the tree first."}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <div className="w-48">
                  <label className="mb-1 block text-xs text-muted-foreground">Exercise type</label>
                  <Select value={type} onValueChange={setType}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent position="popper">
                      {EXERCISE_TYPES.map((t) => (
                        <SelectItem key={t} value={t}>{t}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="w-24">
                  <label className="mb-1 block text-xs text-muted-foreground">Count</label>
                  <Input
                    type="number"
                    min={1}
                    max={8}
                    value={count}
                    onChange={(e) => setCount(Math.min(8, Math.max(1, Number(e.target.value) || 1)))}
                  />
                </div>
                <Button onClick={generate} disabled={!selected || generating}>
                  {generating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                  Run authoring gauntlet
                </Button>
              </div>
              {lastFunnel && (
                <p className="text-sm text-muted-foreground">
                  Last run: generated {lastFunnel.generated}, passed all gates {lastFunnel.passed}, held as draft {lastFunnel.failed}.
                </p>
              )}
            </CardContent>
          </Card>

          {selected && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Funnel for this lesson</CardTitle>
              </CardHeader>
              <CardContent>
                <FunnelStats exercises={exercises} />
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review items</CardTitle>
              <CardDescription>Answer keys and rationales are visible to administrators only.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {!selected ? (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" /> Select a lesson to review its items.
                </p>
              ) : loadingExercises ? (
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
              ) : !exercises.length ? (
                <p className="text-sm text-muted-foreground">No exercises yet for this lesson.</p>
              ) : (
                exercises.map((ex) => (
                  <div key={ex.id} className="space-y-3 rounded-lg border p-4">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant={statusVariant(ex.status)}>{ex.status}</Badge>
                      <Badge variant="outline">{ex.type}</Badge>
                      {ex.receptive_productive && <Badge variant="outline">{ex.receptive_productive}</Badge>}
                      {ex.source_model && (
                        <span className="text-xs text-muted-foreground">authored by {ex.source_model}</span>
                      )}
                    </div>

                    {editing[ex.id] !== undefined ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editing[ex.id]}
                          onChange={(e) => setEditing((p) => ({ ...p, [ex.id]: e.target.value }))}
                          rows={3}
                        />
                        <div className="flex gap-2">
                          <Button size="sm" onClick={() => saveEdit(ex.id)}>Save</Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditing((p) => {
                              const next = { ...p };
                              delete next[ex.id];
                              return next;
                            })}
                          >
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm font-medium">{ex.prompt}</p>
                    )}

                    {!!ex.exercise_options?.length && (
                      <ul className="space-y-1 text-sm">
                        {ex.exercise_options.map((o) => (
                          <li key={o.id} className={o.is_correct ? "text-emerald-700 dark:text-emerald-400" : ""}>
                            {o.is_correct ? "✓" : "•"} {o.label}
                            {o.rationale && (
                              <span className="text-muted-foreground"> — {o.rationale}</span>
                            )}
                          </li>
                        ))}
                      </ul>
                    )}

                    <GateResults gateResults={ex.gate_results} />

                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => changeStatus(ex.id, "operational")} disabled={ex.status === "operational"}>
                        Approve
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => changeStatus(ex.id, "retired")} disabled={ex.status === "retired"}>
                        Reject
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => setEditing((p) => ({ ...p, [ex.id]: ex.prompt }))}>
                        Edit
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function Author() {
  return (
    <ProtectedRoute requireRole="admin">
      <AuthorWorkspace />
    </ProtectedRoute>
  );
}
