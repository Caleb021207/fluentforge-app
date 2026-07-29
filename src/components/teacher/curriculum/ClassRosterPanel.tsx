import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, UserPlus, X } from "lucide-react";
import { useClassRoster } from "@/hooks/useClassRoster";
import { listRosterProviders } from "@/integrations/rostering";

interface Props {
  classId?: string;
}

const ClassRosterPanel: React.FC<Props> = ({ classId }) => {
  const { roster, isLoading, loadError, addStudent, removeStudent, lastError, clearError } =
    useClassRoster(classId);
  const [email, setEmail] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    clearError();
    addStudent.mutate(email.trim(), { onSuccess: () => setEmail("") });
  };

  if (!classId) {
    return (
      <Card>
        <CardContent className="pt-6 text-sm text-muted-foreground">
          Select a class to manage its roster.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Roster</CardTitle>
          <CardDescription>
            Add students by the email they signed up with. Enrollment changes run through a
            server-side check that you teach this class.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <form onSubmit={submit} className="flex flex-col gap-2 sm:flex-row">
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@school.org"
              aria-label="Student email"
            />
            <Button type="submit" disabled={addStudent.isPending}>
              {addStudent.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <UserPlus className="mr-2 h-4 w-4" />
              )}
              Add student
            </Button>
          </form>

          {(lastError || loadError) && (
            <Alert variant="destructive">
              <AlertDescription>{lastError || loadError}</AlertDescription>
            </Alert>
          )}

          {isLoading ? (
            <p className="text-sm text-muted-foreground">Loading roster…</p>
          ) : !roster.length ? (
            <p className="text-sm text-muted-foreground">No students enrolled yet.</p>
          ) : (
            <ul className="divide-y rounded-lg border">
              {roster.map((entry) => (
                <li key={entry.id} className="flex items-center justify-between gap-3 p-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">
                      {entry.profiles?.display_name || entry.profiles?.email || "Student"}
                    </p>
                    <p className="truncate text-xs text-muted-foreground">
                      {entry.profiles?.email}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {entry.profiles?.target_level && (
                      <Badge variant="outline">{entry.profiles.target_level}</Badge>
                    )}
                    <Badge variant="secondary">{entry.status ?? "active"}</Badge>
                    <Button
                      variant="ghost"
                      size="icon"
                      aria-label="Remove student"
                      onClick={() => removeStudent.mutate(entry.student_id)}
                      disabled={removeStudent.isPending}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Rostering integrations</CardTitle>
          <CardDescription>
            Interfaces are in place; district sync is not wired up yet.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          {listRosterProviders().map((provider) => (
            <div key={provider.id} className="rounded-lg border p-3">
              <p className="text-sm font-medium">{provider.name}</p>
              <Badge variant="outline" className="mt-2">
                {provider.configured ? "Connected" : "Not configured"}
              </Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default ClassRosterPanel;
