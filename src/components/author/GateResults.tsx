import { CurriculumExercise } from "@/hooks/useCurriculum";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

const GATE_LABELS: Record<string, string> = {
  input_budget: "Comprehensible input",
  level: "Level / readability",
  solver: "Independent solver",
  pedagogy: "Pedagogy judge",
  bias: "Cultural sensitivity",
  duplicate: "Duplicate check",
};

export function GateResults({ gateResults }: { gateResults: any }) {
  if (!gateResults || typeof gateResults !== "object") {
    return <p className="text-sm text-muted-foreground">No gate results recorded.</p>;
  }

  const entries = Object.entries(gateResults).filter(
    ([key, value]) => GATE_LABELS[key] && value && typeof value === "object",
  ) as Array<[string, { pass: boolean; score?: number; detail: string }]>;

  return (
    <div className="space-y-2">
      {gateResults.learning_point && (
        <p className="text-sm">
          <span className="font-medium">Learning point: </span>
          {gateResults.learning_point}
        </p>
      )}
      {entries.map(([key, gate]) => (
        <div key={key} className="flex items-start gap-2 text-sm">
          {gate.pass ? (
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          ) : (
            <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
          )}
          <div>
            <span className="font-medium">{GATE_LABELS[key]}</span>
            {typeof gate.score === "number" && (
              <Badge variant="outline" className="ml-2">{gate.score}</Badge>
            )}
            <p className="text-muted-foreground">{gate.detail}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function statusVariant(status: string): "default" | "secondary" | "outline" | "destructive" {
  if (status === "operational") return "default";
  if (status === "gated") return "secondary";
  if (status === "retired") return "destructive";
  return "outline";
}

export function FunnelStats({ exercises }: { exercises: CurriculumExercise[] }) {
  const byType = exercises.reduce<Record<string, { total: number; gated: number; operational: number; draft: number; retired: number }>>(
    (acc, e) => {
      const row = (acc[e.type] ??= { total: 0, gated: 0, operational: 0, draft: 0, retired: 0 });
      row.total++;
      if (e.status === "gated") row.gated++;
      if (e.status === "operational") row.operational++;
      if (e.status === "draft") row.draft++;
      if (e.status === "retired") row.retired++;
      return acc;
    },
    {},
  );

  const types = Object.keys(byType);
  if (!types.length) return <p className="text-sm text-muted-foreground">No exercises in this lesson yet.</p>;

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-muted-foreground">
            <th className="py-2 pr-4 font-medium">Type</th>
            <th className="py-2 pr-4 font-medium">Generated</th>
            <th className="py-2 pr-4 font-medium">Gated</th>
            <th className="py-2 pr-4 font-medium">Approved</th>
            <th className="py-2 pr-4 font-medium">Draft</th>
            <th className="py-2 font-medium">Retired</th>
          </tr>
        </thead>
        <tbody>
          {types.map((t) => (
            <tr key={t} className="border-b last:border-0">
              <td className="py-2 pr-4 font-medium">{t}</td>
              <td className="py-2 pr-4">{byType[t].total}</td>
              <td className="py-2 pr-4">{byType[t].gated}</td>
              <td className="py-2 pr-4">{byType[t].operational}</td>
              <td className="py-2 pr-4">{byType[t].draft}</td>
              <td className="py-2">{byType[t].retired}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
