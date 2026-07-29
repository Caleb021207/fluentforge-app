import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useTeacherClasses } from "@/hooks/useClassRoster";
import { useClassCanDoMastery } from "@/hooks/useClassCanDoMastery";
import CanDoHeatmap from "./CanDoHeatmap";
import NeedsHelpGroups from "./NeedsHelpGroups";
import BenchmarkReadinessPanel from "./BenchmarkReadinessPanel";

interface Props {
  teacherId?: string;
}

const ClassBenchmarksTab: React.FC<Props> = ({ teacherId }) => {
  const { data: classes = [], isLoading: classesLoading } = useTeacherClasses(teacherId);
  const [classId, setClassId] = useState<string>("");
  const [domain, setDomain] = useState("all");
  const [framework, setFramework] = useState("all");

  useEffect(() => {
    if (!classId && classes.length) setClassId(classes[0].id);
  }, [classes, classId]);

  const { data, isLoading } = useClassCanDoMastery(classId || undefined);

  if (!classesLoading && !classes.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Create a class and enroll students to see can-do mastery and readiness projections.
        </CardContent>
      </Card>
    );
  }

  const frameworks = [...new Set((data?.statements ?? []).map((s) => s.framework))];

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="grid gap-4 pt-6 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="bench-class">Class</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger id="bench-class">
                <SelectValue placeholder="Select a class" />
              </SelectTrigger>
              <SelectContent position="popper">
                {classes.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bench-framework">Framework</Label>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger id="bench-framework">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All frameworks</SelectItem>
                {frameworks.map((f) => (
                  <SelectItem key={f} value={f}>
                    {f}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bench-domain">Domain</Label>
            <Select value={domain} onValueChange={setDomain}>
              <SelectTrigger id="bench-domain">
                <SelectValue />
              </SelectTrigger>
              <SelectContent position="popper">
                <SelectItem value="all">All domains</SelectItem>
                {(data?.domains ?? []).map((d) => (
                  <SelectItem key={d} value={d}>
                    {d}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      ) : (
        <>
          <CanDoHeatmap
            statements={data?.statements ?? []}
            students={data?.students ?? []}
            domainFilter={domain}
            frameworkFilter={framework}
          />
          <NeedsHelpGroups
            groups={data?.needsHelp ?? []}
            totalStudents={data?.students.length ?? 0}
          />
          <BenchmarkReadinessPanel
            coverage={data?.coverage ?? []}
            students={data?.students ?? []}
          />
        </>
      )}
    </div>
  );
};

export default ClassBenchmarksTab;
