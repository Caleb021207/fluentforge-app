import React, { useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Trash2 } from "lucide-react";
import { useCurriculum } from "@/hooks/useCurriculum";
import { useCurriculumAssignments } from "@/hooks/useCurriculumAssignments";

interface Props {
  classId?: string;
}

const CEFR_LEVELS = ["A1", "A2", "B1"];

const CurriculumAssignmentsPanel: React.FC<Props> = ({ classId }) => {
  const { courses, isLoading: curriculumLoading } = useCurriculum();
  const { assignments, isLoading, create, remove } = useCurriculumAssignments(classId);

  const [target, setTarget] = useState<string>("");
  const [title, setTitle] = useState("");
  const [instructions, setInstructions] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [groupLabel, setGroupLabel] = useState("");
  const [levels, setLevels] = useState<string[]>([]);
  const [widaMin, setWidaMin] = useState("");
  const [widaMax, setWidaMax] = useState("");
  const [error, setError] = useState<string | null>(null);

  const options = useMemo(() => {
    const out: { value: string; label: string; cefr?: string | null }[] = [];
    for (const course of courses ?? []) {
      for (const unit of course.units ?? []) {
        out.push({
          value: `unit:${unit.id}`,
          label: `Unit · ${unit.title}${unit.cefr_level ? ` (${unit.cefr_level})` : ""}`,
          cefr: unit.cefr_level,
        });
        for (const skill of unit.skills ?? []) {
          for (const lesson of skill.lessons ?? []) {
            out.push({
              value: `lesson:${lesson.id}`,
              label: `   Lesson · ${skill.title} → ${lesson.title}`,
              cefr: unit.cefr_level,
            });
          }
        }
      }
    }
    return out;
  }, [courses]);

  const toggleLevel = (level: string) =>
    setLevels((prev) => (prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]));

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const [kind, id] = target.split(":");
    if (!id) {
      setError("Choose a unit or lesson to assign.");
      return;
    }
    create.mutate(
      {
        unit_id: kind === "unit" ? id : null,
        lesson_id: kind === "lesson" ? id : null,
        title: title.trim() || options.find((o) => o.value === target)?.label || "Assignment",
        instructions: instructions.trim() || null,
        due_date: dueDate ? new Date(dueDate).toISOString() : null,
        target_cefr_levels: levels,
        target_wida_min: widaMin ? Number(widaMin) : null,
        target_wida_max: widaMax ? Number(widaMax) : null,
        group_label: groupLabel.trim() || null,
      },
      {
        onSuccess: () => {
          setTitle("");
          setInstructions("");
          setDueDate("");
          setGroupLabel("");
          setLevels([]);
          setWidaMin("");
          setWidaMax("");
        },
        onError: (err: Error) => setError(err.message),
      },
    );
  };

  if (!classId) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Select a class to assign curriculum.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Assign curriculum</CardTitle>
          <CardDescription>
            Assign a can-do unit or a single lesson to this class. Level targets differentiate the
            assignment so it only lands for the students in that band.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="target">Unit or lesson</Label>
                <Select value={target} onValueChange={setTarget}>
                  <SelectTrigger id="target">
                    <SelectValue
                      placeholder={curriculumLoading ? "Loading curriculum…" : "Choose content"}
                    />
                  </SelectTrigger>
                  <SelectContent position="popper" className="max-h-72">
                    {options.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="title">Title shown to students</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Unit 2 — Describing my school day"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="due">Due date</Label>
                <Input
                  id="due"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="group">Group (optional)</Label>
                <Input
                  id="group"
                  value={groupLabel}
                  onChange={(e) => setGroupLabel(e.target.value)}
                  placeholder="Newcomers / Group B"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="wida-min">WIDA range</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="wida-min"
                    type="number"
                    min={1}
                    max={5}
                    value={widaMin}
                    onChange={(e) => setWidaMin(e.target.value)}
                    placeholder="1"
                  />
                  <span className="text-muted-foreground">to</span>
                  <Input
                    type="number"
                    min={1}
                    max={5}
                    value={widaMax}
                    onChange={(e) => setWidaMax(e.target.value)}
                    placeholder="5"
                    aria-label="WIDA maximum"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Target CEFR levels</Label>
                <div className="flex gap-2">
                  {CEFR_LEVELS.map((level) => (
                    <Button
                      key={level}
                      type="button"
                      size="sm"
                      variant={levels.includes(level) ? "default" : "outline"}
                      onClick={() => toggleLevel(level)}
                    >
                      {level}
                    </Button>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="instructions">Instructions</Label>
              <Textarea
                id="instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Complete the lesson, then finish your due vocabulary reviews."
                rows={3}
              />
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" disabled={create.isPending}>
              {create.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Assign to class
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Assigned curriculum</CardTitle>
          <CardDescription>{assignments.length} active assignment(s)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
          {!isLoading && !assignments.length && (
            <p className="text-sm text-muted-foreground">Nothing assigned yet.</p>
          )}
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4"
            >
              <div className="space-y-2">
                <p className="font-medium text-sm">{assignment.title}</p>
                {assignment.instructions && (
                  <p className="text-xs text-muted-foreground">{assignment.instructions}</p>
                )}
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{assignment.unit_id ? "Unit" : "Lesson"}</Badge>
                  {assignment.due_date && (
                    <Badge variant="secondary">
                      Due {new Date(assignment.due_date).toLocaleDateString()}
                    </Badge>
                  )}
                  {assignment.group_label && (
                    <Badge variant="outline">{assignment.group_label}</Badge>
                  )}
                  {(assignment.target_cefr_levels ?? []).map((level) => (
                    <Badge key={level}>{level}</Badge>
                  ))}
                  {assignment.target_wida_min && (
                    <Badge variant="outline">
                      WIDA {assignment.target_wida_min}–{assignment.target_wida_max ?? 5}
                    </Badge>
                  )}
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                aria-label="Delete assignment"
                onClick={() => remove.mutate(assignment.id)}
                disabled={remove.isPending}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default CurriculumAssignmentsPanel;
