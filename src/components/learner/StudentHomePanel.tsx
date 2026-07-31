import React from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Layers, Star, Target, CalendarClock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useStudentCurriculumAssignments } from "@/hooks/useCurriculumAssignments";
import { useMyCanDoReadiness } from "@/hooks/useClassCanDoMastery";
import { findNextLesson, unitAnchorId } from "@/utils/learnNavigation";
import type { PathUnit } from "@/hooks/useLearningPath";

/**
 * Student home: current unit, due reviews, streak/XP and the next can-do
 * targets, plus curriculum their teacher assigned.
 */

interface Props {
  units: PathUnit[];
  dueReviews: number;
}

function useProgression() {
  return useQuery({
    queryKey: ["student-home-progression"],
    queryFn: async () => {
      const { data: auth } = await supabase.auth.getUser();
      if (!auth.user) return null;
      const [prog, streak] = await Promise.all([
        supabase
          .from("user_progression")
          .select("total_xp, current_level, current_streak_days")
          .eq("user_id", auth.user.id)
          .maybeSingle(),
        supabase
          .from("learner_streaks")
          .select("current_streak, longest_streak, freezes_available")
          .eq("user_id", auth.user.id)
          .maybeSingle(),
      ]);
      return { progression: prog.data, streak: streak.data };
    },
  });
}

const StudentHomePanel: React.FC<Props> = ({ units, dueReviews }) => {
  const navigate = useNavigate();
  const { data } = useProgression();
  const { data: assignments = [] } = useStudentCurriculumAssignments();
  const { data: canDo } = useMyCanDoReadiness();

  const currentUnit = units.find((u) => u.unlocked && u.progressPct < 100) ?? units[0];
  // Next unsolved lesson across ALL unlocked units in path order, so
  // "Continue" still works when the current unit's lessons are done but its
  // mastery meter sits below 100%.
  const nextLesson = findNextLesson(units);

  const streakDays =
    data?.streak?.current_streak ?? data?.progression?.current_streak_days ?? 0;

  /** Scroll to the unit's card on /learn (already-rendered), or hash-link it. */
  const openUnit = (unitId: string | null) => {
    if (!unitId) {
      navigate("/learn");
      return;
    }
    const anchor = unitAnchorId(unitId);
    const el = document.getElementById(anchor);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else navigate(`/learn#${anchor}`);
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Flame className="h-3 w-3" /> Streak
            </p>
            <p className="text-2xl font-bold">{streakDays} days</p>
            <p className="text-xs text-muted-foreground">
              {data?.streak?.freezes_available ?? 0} freeze(s) available
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Star className="h-3 w-3" /> XP
            </p>
            <p className="text-2xl font-bold">{data?.progression?.total_xp ?? 0}</p>
            <p className="text-xs text-muted-foreground">
              Level {data?.progression?.current_level ?? 1}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Layers className="h-3 w-3" /> Reviews due
            </p>
            <p className="text-2xl font-bold">{dueReviews}</p>
            <Button
              variant="link"
              className="h-auto p-0 text-xs"
              onClick={() => navigate("/review")}
            >
              Start review
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <Target className="h-3 w-3" /> Projected band
            </p>
            <p className="text-2xl font-bold">{canDo?.readiness.readiness.band ?? "—"}</p>
            <p className="text-xs text-muted-foreground">
              {canDo ? `${canDo.readiness.readiness.confidence} confidence · projection` : "keep practicing"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Keep going</CardTitle>
            <CardDescription>
              {currentUnit
                ? `Unit ${currentUnit.position + 1}: ${currentUnit.title}`
                : "No unit available yet"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {currentUnit && (
              <>
                <Progress value={currentUnit.progressPct} className="h-2" />
                <p className="text-xs text-muted-foreground">
                  {currentUnit.progressPct}% mastered
                </p>
                {currentUnit.can_do_statement && (
                  <p className="text-sm">{currentUnit.can_do_statement}</p>
                )}
                {nextLesson && (
                  <Button onClick={() => navigate(`/lessons/${nextLesson.lessonId}`)}>
                    Continue: {nextLesson.title}
                  </Button>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Next can-do targets</CardTitle>
            <CardDescription>What you're working toward next</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {!canDo?.nextTargets?.length && (
              <p className="text-sm text-muted-foreground">
                Targets appear once your teacher's curriculum is mapped to can-do statements.
              </p>
            )}
            {canDo?.nextTargets?.map((target) => (
              <div key={target.id} className="rounded-lg border p-3 space-y-1">
                <p className="text-sm">{target.statement}</p>
                <div className="flex gap-2">
                  <Badge variant="outline">{target.framework}</Badge>
                  {target.skill_or_mode && (
                    <Badge variant="secondary">{target.skill_or_mode}</Badge>
                  )}
                  {target.level && <Badge variant="outline">{target.level}</Badge>}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {!!assignments.length && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CalendarClock className="h-4 w-4" /> Assigned by your teacher
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border p-3"
              >
                <div>
                  <p className="text-sm font-medium">{assignment.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {assignment.classes?.name}
                    {assignment.due_date
                      ? ` · due ${new Date(assignment.due_date).toLocaleDateString()}`
                      : ""}
                  </p>
                </div>
                {assignment.lesson_id ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => navigate(`/lessons/${assignment.lesson_id}`)}
                  >
                    Open lesson
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => openUnit(assignment.unit_id)}
                  >
                    Open unit
                  </Button>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StudentHomePanel;
