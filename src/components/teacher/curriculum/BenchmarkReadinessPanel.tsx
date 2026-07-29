import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";
import type { CoverageRow, StudentReadiness } from "@/utils/benchmarkReadiness";

/**
 * The differentiator: practiced-vs-tested coverage plus a *projected*
 * benchmark-readiness band.
 *
 * Both views run off the shared can-do spine (content_can_do_map ->
 * can_do_statements). "Practiced" means the learner has scored attempts on
 * curriculum mapped to the can-do; "tested" means there is assessment evidence
 * (a scored certification attempt) at that can-do's level. The readiness band is
 * a projection with a stated confidence — never a benchmark score.
 */

interface Props {
  coverage: CoverageRow[];
  students: StudentReadiness[];
}

const confidenceCopy: Record<string, string> = {
  low: "Low confidence — not enough evidence yet",
  moderate: "Moderate confidence",
  high: "High confidence",
};

const BenchmarkReadinessPanel: React.FC<Props> = ({ coverage, students }) => {
  const mapped = coverage.filter((c) => !c.unmapped);
  const avg = (key: "practicedPct" | "testedPct" | "masteredPct") =>
    mapped.length ? Math.round(mapped.reduce((n, c) => n + c[key], 0) / mapped.length) : 0;

  const gaps = mapped
    .filter((c) => c.practicedPct - c.testedPct >= 25)
    .sort((a, b) => b.practicedPct - b.testedPct - (a.practicedPct - a.testedPct))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          Readiness below is a <strong>projection</strong> from can-do evidence in this app, not a
          benchmark score and not a substitute for the official assessment (ACCESS for ELLs, AAPPL or
          your district's screener).
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Practiced vs. tested coverage</CardTitle>
          <CardDescription>
            Where the class has practiced a can-do but has no assessment evidence for it yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-4 sm:grid-cols-3">
            {(
              [
                ["Practiced", avg("practicedPct")],
                ["Assessed", avg("testedPct")],
                ["Mastered", avg("masteredPct")],
              ] as const
            ).map(([label, value]) => (
              <div key={label} className="rounded-lg border p-4">
                <p className="text-xs text-muted-foreground">{label} (class average)</p>
                <p className="text-2xl font-bold">{value}%</p>
                <Progress value={value} className="mt-2 h-1.5" />
              </div>
            ))}
          </div>

          {!mapped.length && (
            <p className="text-sm text-muted-foreground">
              No can-do statements are mapped to curriculum content yet. Map units to can-dos in the
              authoring tool to activate this view.
            </p>
          )}

          {!!gaps.length && (
            <div className="space-y-2">
              <p className="text-sm font-medium">Largest practiced-but-untested gaps</p>
              {gaps.map((row) => (
                <div key={row.canDoId} className="rounded-lg border p-3 space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm max-w-xl">{row.statement}</p>
                    <div className="flex gap-2">
                      <Badge variant="outline">{row.framework}</Badge>
                      <Badge variant="secondary">{row.domain}</Badge>
                    </div>
                  </div>
                  <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-2">
                    <span>Practiced by {row.practicedPct}%</span>
                    <span>Assessed for {row.testedPct}%</span>
                  </div>
                  <Progress value={row.practicedPct} className="h-1.5" />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Projected benchmark readiness</CardTitle>
          <CardDescription>
            Mapped can-do mastery, average skill mastery and vocabulary retention combined into a
            band per student, with the evidence behind it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {!students.length && (
            <p className="text-sm text-muted-foreground">No active students in this class yet.</p>
          )}
          {students.map((student) => (
            <div key={student.studentId} className="rounded-lg border p-4 space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">{student.studentName}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">
                    Projected band: {student.readiness.band} (WIDA {student.readiness.widaBand})
                  </Badge>
                  <Badge variant="outline">ACTFL {student.readiness.actflBand}</Badge>
                  <Badge
                    variant={student.readiness.confidence === "low" ? "destructive" : "default"}
                  >
                    {confidenceCopy[student.readiness.confidence]}
                  </Badge>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">{student.readiness.rationale}</p>
              <div className="grid gap-1 text-xs text-muted-foreground sm:grid-cols-3">
                <span>
                  Can-dos mastered: {student.masteredCount}/{student.totalMapped}
                </span>
                <span>Assessed can-dos: {student.testedCount}</span>
                <span>
                  Vocabulary retention:{" "}
                  {student.vocabRetention === null
                    ? "no reviews yet"
                    : `${Math.round(student.vocabRetention * 100)}%`}
                </span>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default BenchmarkReadinessPanel;
