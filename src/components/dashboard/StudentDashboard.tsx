
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useClassroom } from '@/context/ClassroomContext';
import { CircleOff, Clock, MessageSquare, Mic } from 'lucide-react';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const { enrolledClassrooms, usageStats, hasClassroom, joinClassroom, leaveClassroom } = useClassroom();
  const [classCode, setClassCode] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleJoinClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsJoining(true);
    const success = await joinClassroom(classCode);
    setIsJoining(false);
    if (success) {
      setClassCode('');
      setDialogOpen(false);
    }
  };

  const handleLeaveClassroom = async (classroomId: string) => {
    await leaveClassroom(classroomId);
  };

  const timeUsed = usageStats?.voice_minutes_used || 0;
  const timeRemaining = hasClassroom ? Math.max(0, 5 - timeUsed) : 0;
  const chatCount = usageStats?.text_chat_count || 0;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Voice Chat Time</CardTitle>
            <CardDescription>Daily voice chat usage</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Mic className="h-5 w-5 mr-2 text-lingua-primary" />
                <span className="text-2xl font-bold">{timeUsed.toFixed(1)} min</span>
              </div>
              <div className="text-sm text-muted-foreground flex items-center">
                <Clock className="h-4 w-4 mr-1" />
                <span>{hasClassroom ? `${timeRemaining.toFixed(1)} min remaining` : "Free tier"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Text Chat Usage</CardTitle>
            <CardDescription>Daily chat interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <MessageSquare className="h-5 w-5 mr-2 text-lingua-primary" />
              <span className="text-2xl font-bold">{chatCount}</span>
              <span className="ml-2 text-sm text-muted-foreground">messages</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Practice Options</CardTitle>
            <CardDescription>Practice your language skills</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <Link to="/practice">
              <Button variant="outline" className="w-full justify-start">
                <MessageSquare className="h-4 w-4 mr-2" />
                Text Practice
              </Button>
            </Link>
            <Link to="/voice-chat">
              <Button variant="outline" className="w-full justify-start">
                <Mic className="h-4 w-4 mr-2" />
                Voice Practice
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">My Classrooms</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button>Join Classroom</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Join a Classroom</DialogTitle>
                <DialogDescription>
                  Enter the class code provided by your teacher to join a classroom.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleJoinClassroom}>
                <div className="space-y-4 py-4">
                  <Input
                    value={classCode}
                    onChange={(e) => setClassCode(e.target.value.toUpperCase())}
                    placeholder="Enter class code (e.g., ABC1234)"
                    className="uppercase"
                    maxLength={10}
                    required
                  />
                </div>
                <DialogFooter>
                  <Button type="submit" disabled={isJoining}>
                    {isJoining ? "Joining..." : "Join Classroom"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {enrolledClassrooms.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {enrolledClassrooms.map(({ classroom, enrollment }) => (
              <Card key={classroom.id}>
                <CardHeader>
                  <CardTitle>{classroom.name}</CardTitle>
                  <CardDescription>
                    Joined on {new Date(enrollment.joined_at).toLocaleDateString()}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-2">Teacher ID: {classroom.teacher_id.substring(0, 8)}...</p>
                  <div className="bg-muted p-2 rounded text-sm font-mono flex items-center justify-between">
                    <span>Class Code: {classroom.class_code}</span>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button 
                    variant="outline" 
                    className="w-full" 
                    onClick={() => handleLeaveClassroom(classroom.id)}
                  >
                    <CircleOff className="h-4 w-4 mr-2" />
                    Leave Classroom
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>No Classrooms Joined</CardTitle>
              <CardDescription>
                Join a classroom to access premium features and track your progress.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">
                Ask your teacher for a class code to join their classroom. As a student without a classroom, you have access to:
              </p>
              <ul className="list-disc list-inside mt-2 text-sm text-muted-foreground">
                <li>Unlimited text chat practice</li>
                <li>Browser-based text-to-speech functionality</li>
                <li>Basic language learning resources</li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button onClick={() => setDialogOpen(true)} className="w-full">
                Join a Classroom
              </Button>
            </CardFooter>
          </Card>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
