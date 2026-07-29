import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import type { CanDoStatement, StudentReadiness } from "@/utils/benchmarkReadiness";

/**
 * Can-do mastery heatmap: rows are students, columns are can-do statements
 * (grouped by framework + domain). Colour encodes mastery of the skills mapped
 * to that can-do through content_can_do_map.
 */

interface Props {
  statements: CanDoStatement[];
  students: StudentReadiness[];
  domainFilter?: string;
  frameworkFilter?: string;
}

function cellClass(mastery: number, unmapped: boolean, practiced: boolean) {
  if (unmapped) return "bg-muted/40 text-muted-foreground";
  if (!practiced) return "bg-muted";
  if (mastery >= 0.8) return "bg-primary text-primary-foreground";
  if (mastery >= 0.6) return "bg-primary/60 text-primary-foreground";
  if (mastery >= 0.35) return "bg-primary/35";
  return "bg-destructive/25";
}

const CanDoHeatmap: React.FC<Props> = ({ statements, students, domainFilter, frameworkFilter }) => {
  const visible = statements.filter(
    (s) =>
      (!domainFilter || domainFilter === "all" || (s.skill_or_mode || "General") === domainFilter) &&
      (!frameworkFilter || frameworkFilter === "all" || s.framework === frameworkFilter),
  );

  if (!students.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          No active students in this class yet.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Can-do mastery heatmap</CardTitle>
        <CardDescription>
          WIDA and NCSSFL-ACTFL can-do statements by student. Mastery requires ≥80% accuracy over at
          least 5 scored attempts on the skills mapped to that can-do.
        </CardDescription>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <TooltipProvider>
          <table className="w-full border-separate border-spacing-1 text-xs">
            <thead>
              <tr>
                <th className="sticky left-0 bg-background text-left font-medium p-2">Student</th>
                {visible.map((s) => (
                  <th key={s.id} className="p-1 align-bottom">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <div className="mx-auto w-6 truncate text-[10px] text-muted-foreground">
                          {s.framework === "WIDA" ? "W" : s.framework === "CEFR" ? "C" : "A"}
                          {s.level ?? ""}
                        </div>
                      </TooltipTrigger>
                      <TooltipContent className="max-w-xs">
                        <p className="font-medium">
                          {s.framework} · {s.skill_or_mode} · {s.level}
                        </p>
                        <p>{s.statement}</p>
                      </TooltipContent>
                    </Tooltip>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.studentId}>
                  <td className="sticky left-0 bg-background p-2 whitespace-nowrap font-medium">
                    {student.studentName}
                  </td>
                  {visible.map((s) => {
                    const cell = student.cells[s.id];
                    return (
                      <td key={s.id} className="p-0">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div
                              className={`h-7 w-7 rounded ${cellClass(
                                cell?.mastery ?? 0,
                                cell?.unmapped ?? true,
                                cell?.practiced ?? false,
                              )} flex items-center justify-center`}
                            >
                              {cell?.unmapped ? "–" : Math.round((cell?.mastery ?? 0) * 100)}
                            </div>
                          </TooltipTrigger>
                          <TooltipContent className="max-w-xs">
                            <p className="font-medium">{student.studentName}</p>
                            <p>{s.statement}</p>
                            <p className="mt-1">
                              {cell?.unmapped
                                ? "No curriculum content is mapped to this can-do yet."
                                : `Mastery ${Math.round((cell?.mastery ?? 0) * 100)}% · ${cell?.attempts ?? 0} scored attempts · ${cell?.tested ? "assessed" : "not yet assessed"}`}
                            </p>
                          </TooltipContent>
                        </Tooltip>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </TooltipProvider>

        <div className="mt-4 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary" /> mastered</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-primary/60" /> approaching</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-destructive/25" /> struggling</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-muted" /> not practiced</span>
          <span className="flex items-center gap-1"><span className="h-3 w-3 rounded bg-muted/40" /> no mapped content</span>
          <Badge variant="outline">{visible.length} can-dos</Badge>
        </div>
      </CardContent>
    </Card>
  );
};

export default CanDoHeatmap;
