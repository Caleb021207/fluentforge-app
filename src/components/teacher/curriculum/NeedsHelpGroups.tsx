import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { NeedsHelpGroup } from "@/utils/benchmarkReadiness";

/**
 * "Who needs help" — students grouped by the can-dos they have NOT met, so a
 * teacher can pull a small group around one shared unmet can-do.
 */

interface Props {
  groups: NeedsHelpGroup[];
  totalStudents: number;
}

const NeedsHelpGroups: React.FC<Props> = ({ groups, totalStudents }) => {
  const actionable = groups.filter((g) => g.students.length >= 2).slice(0, 8);
  const singles = groups.filter((g) => g.students.length === 1).slice(0, 8);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Who needs help</CardTitle>
        <CardDescription>
          Grouped by shared unmet can-do statements — each group is a ready-made small-group lesson.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {!groups.length && (
          <p className="text-sm text-muted-foreground">
            No unmet can-dos detected yet. Once students complete lessons, gaps show up here.
          </p>
        )}

        {actionable.map((group) => (
          <div key={group.canDoId} className="rounded-lg border p-4 space-y-3">
            <div className="flex flex-wrap items-start justify-between gap-2">
              <div className="space-y-1 max-w-2xl">
                <p className="font-medium text-sm">{group.statement}</p>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline">{group.framework}</Badge>
                  <Badge variant="secondary">{group.domain}</Badge>
                  {group.level && <Badge variant="outline">Level {group.level}</Badge>}
                </div>
              </div>
              <Badge>{group.students.length} of {totalStudents} students</Badge>
            </div>
            <Progress value={(group.students.length / Math.max(1, totalStudents)) * 100} className="h-1.5" />
            <div className="flex flex-wrap gap-2">
              {group.students.map((s) => (
                <span key={s.id} className="rounded-full bg-muted px-3 py-1 text-xs">
                  {s.name} · {Math.round(s.mastery * 100)}%
                </span>
              ))}
            </div>
          </div>
        ))}

        {!!singles.length && (
          <div className="rounded-lg border border-dashed p-4">
            <p className="text-sm font-medium mb-2">Individual follow-ups</p>
            <ul className="space-y-1 text-xs text-muted-foreground">
              {singles.map((group) => (
                <li key={group.canDoId}>
                  <span className="font-medium text-foreground">{group.students[0].name}</span> —{" "}
                  {group.statement}
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default NeedsHelpGroups;
