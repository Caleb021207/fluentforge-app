import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle } from "lucide-react";
import { useTeacherAssignments } from '@/hooks/useTeacherAssignments';
import CreateAssignmentDialog from './CreateAssignmentDialog';
import AssignmentsList from './AssignmentsList';
import { useToast } from "@/hooks/use-toast";
import AnimatedLoader from "@/components/ui/animated-loader";

interface TeacherAssignmentsViewProps {
  classId: string;
  className: string;
}

const TeacherAssignmentsView = ({ classId }: TeacherAssignmentsViewProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const {
    assignments,
    submissions,
    isLoading,
    createAssignment,
    deleteAssignment,
    fetchAssignments
  } = useTeacherAssignments(classId);

  const handleCreateAssignment = async (data: any) => {
    await createAssignment(data);
  };

  const handleDeleteAssignment = async (id: string) => {
    try {
      await deleteAssignment(id);
      toast({
        title: "Assignment Deleted",
        description: "The assignment has been removed",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <AnimatedLoader size="md" message="Loading assignments..." />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Conversation Assignments</h3>
        <Button onClick={() => setIsDialogOpen(true)} size="sm">
          <PlusCircle className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </div>

      <AssignmentsList
        assignments={assignments}
        submissions={submissions}
        onDeleteAssignment={handleDeleteAssignment}
        onRefresh={fetchAssignments}
      />

      <CreateAssignmentDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onCreateAssignment={handleCreateAssignment}
        classId={classId}
      />
    </div>
  );
};

export default TeacherAssignmentsView;
