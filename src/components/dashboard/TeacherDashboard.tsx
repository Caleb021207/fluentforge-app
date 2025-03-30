
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useClassroom } from '@/context/ClassroomContext';
import { Classroom } from '@/types/supabase';
import { AlertCircle, Copy, MoreVertical, RefreshCw, Trash, UserPlus, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const TeacherDashboard = () => {
  const { userClassrooms, createClassroom, deleteClassroom, resetClassCode, fetchStudentsInClassroom } = useClassroom();
  const [classroomName, setClassroomName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [selectedClassroom, setSelectedClassroom] = useState<Classroom | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoadingStudents, setIsLoadingStudents] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [studentsDialogOpen, setStudentsDialogOpen] = useState(false);
  const { toast } = useToast();

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    const newClassroom = await createClassroom(classroomName);
    setIsCreating(false);
    if (newClassroom) {
      setClassroomName('');
      setCreateDialogOpen(false);
    }
  };

  const handleDeleteClassroom = async (classroomId: string) => {
    await deleteClassroom(classroomId);
  };

  const handleResetClassCode = async (classroomId: string) => {
    await resetClassCode(classroomId);
  };

  const copyClassCode = (classCode: string) => {
    navigator.clipboard.writeText(classCode);
    toast({
      title: "Class code copied",
      description: "The class code has been copied to your clipboard",
    });
  };

  const viewStudents = async (classroom: Classroom) => {
    setSelectedClassroom(classroom);
    setStudentsDialogOpen(true);
    loadStudents(classroom.id);
  };

  const loadStudents = async (classroomId: string) => {
    setIsLoadingStudents(true);
    const studentsData = await fetchStudentsInClassroom(classroomId);
    setStudents(studentsData);
    setIsLoadingStudents(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">My Classrooms</h2>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>Create Classroom</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create a New Classroom</DialogTitle>
              <DialogDescription>
                Enter a name for your new classroom. A unique class code will be generated automatically.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreateClassroom}>
              <div className="space-y-4 py-4">
                <Input
                  value={classroomName}
                  onChange={(e) => setClassroomName(e.target.value)}
                  placeholder="Classroom name (e.g., Spanish 101)"
                  required
                />
              </div>
              <DialogFooter>
                <Button type="submit" disabled={isCreating}>
                  {isCreating ? "Creating..." : "Create Classroom"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {userClassrooms.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {userClassrooms.map((classroom) => (
            <Card key={classroom.id}>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <CardTitle>{classroom.name}</CardTitle>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => viewStudents(classroom)}>
                        <Users className="h-4 w-4 mr-2" />
                        <span>View Students</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleResetClassCode(classroom.id)}>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        <span>Reset Class Code</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDeleteClassroom(classroom.id)}>
                        <Trash className="h-4 w-4 mr-2" />
                        <span>Delete Classroom</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
                <CardDescription>
                  Created on {new Date(classroom.created_at).toLocaleDateString()}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-2 rounded text-sm font-mono flex items-center justify-between">
                  <span>Class Code: {classroom.class_code}</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="h-6 w-6 p-0" 
                    onClick={() => copyClassCode(classroom.class_code)}
                  >
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => viewStudents(classroom)}>
                  <Users className="h-4 w-4 mr-2" />
                  View Students
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Classrooms Created</CardTitle>
            <CardDescription>
              Create your first classroom to start teaching.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              As a teacher, you can create classrooms for your students. Each classroom will have a unique class code that you can share with your students for them to join.
            </p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => setCreateDialogOpen(true)} className="w-full">
              <UserPlus className="h-4 w-4 mr-2" />
              Create Your First Classroom
            </Button>
          </CardFooter>
        </Card>
      )}

      <Dialog open={studentsDialogOpen} onOpenChange={setStudentsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Students in {selectedClassroom?.name}</DialogTitle>
            <DialogDescription>
              View all students enrolled in this classroom and their usage statistics.
            </DialogDescription>
          </DialogHeader>
          {isLoadingStudents ? (
            <div className="py-8 flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-lingua-primary"></div>
            </div>
          ) : students.length > 0 ? (
            <div className="max-h-[400px] overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Joined On</TableHead>
                    <TableHead>Text Chats</TableHead>
                    <TableHead>Voice Minutes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.id}>
                      <TableCell>{student.display_name || student.id.substring(0, 8)}</TableCell>
                      <TableCell>{new Date(student.joined_at).toLocaleDateString()}</TableCell>
                      <TableCell>{student.text_chat_count}</TableCell>
                      <TableCell>{student.voice_minutes_used.toFixed(1)} min</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="py-8 text-center flex flex-col items-center gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <p>No students have joined this classroom yet.</p>
              <p className="text-sm text-muted-foreground">
                Share the class code <span className="font-mono">{selectedClassroom?.class_code}</span> with your students.
              </p>
              <Button
                variant="outline"
                className="mt-2"
                onClick={() => selectedClassroom && copyClassCode(selectedClassroom.class_code)}
              >
                <Copy className="h-4 w-4 mr-2" />
                Copy Class Code
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeacherDashboard;
