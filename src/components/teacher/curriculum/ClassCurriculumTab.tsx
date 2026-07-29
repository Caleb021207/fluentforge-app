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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTeacherClasses } from "@/hooks/useClassRoster";
import ClassRosterPanel from "./ClassRosterPanel";
import CurriculumAssignmentsPanel from "./CurriculumAssignmentsPanel";

interface Props {
  teacherId?: string;
}

const ClassCurriculumTab: React.FC<Props> = ({ teacherId }) => {
  const { data: classes = [], isLoading } = useTeacherClasses(teacherId);
  const [classId, setClassId] = useState<string>("");

  useEffect(() => {
    if (!classId && classes.length) setClassId(classes[0].id);
  }, [classes, classId]);

  if (!isLoading && !classes.length) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Create a class in the Classes tab first, then come back to build its roster and assign
          curriculum.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardContent className="pt-6">
          <div className="max-w-sm space-y-2">
            <Label htmlFor="class-picker">Class</Label>
            <Select value={classId} onValueChange={setClassId}>
              <SelectTrigger id="class-picker">
                <SelectValue placeholder={isLoading ? "Loading classes…" : "Select a class"} />
              </SelectTrigger>
              <SelectContent position="popper">
                {classes.map((cls: any) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                    {cls.period ? ` · Period ${cls.period}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="roster" className="space-y-4">
        <TabsList>
          <TabsTrigger value="roster">Roster</TabsTrigger>
          <TabsTrigger value="assign">Assign curriculum</TabsTrigger>
        </TabsList>
        <TabsContent value="roster">
          <ClassRosterPanel classId={classId || undefined} />
        </TabsContent>
        <TabsContent value="assign">
          <CurriculumAssignmentsPanel classId={classId || undefined} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ClassCurriculumTab;
