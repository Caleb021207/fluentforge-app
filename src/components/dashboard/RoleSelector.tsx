
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useClassroom } from '@/context/ClassroomContext';
import { UserRole } from '@/types/supabase';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { GraduationCap, School, ChevronDown } from 'lucide-react';

interface RoleSelectorProps {
  showAsButton?: boolean;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ showAsButton = false }) => {
  const { userRole, setUserRole, isLoading } = useClassroom();

  if (showAsButton) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            {userRole === 'teacher' ? (
              <>
                <School className="h-4 w-4" />
                <span>Teacher</span>
              </>
            ) : (
              <>
                <GraduationCap className="h-4 w-4" />
                <span>Student</span>
              </>
            )}
            <ChevronDown className="h-4 w-4 ml-1" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem 
            onClick={() => setUserRole('teacher')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <School className="h-4 w-4" />
            <span>Switch to Teacher</span>
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => setUserRole('student')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <GraduationCap className="h-4 w-4" />
            <span>Switch to Student</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <div className="container mx-auto py-10 flex flex-col items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Choose Your Role</CardTitle>
          <CardDescription className="text-center">
            Select your role to continue using Palavox
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <Button
            size="lg"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={() => setUserRole('teacher')}
            disabled={isLoading}
          >
            <School className="h-6 w-6" />
            <span className="text-lg">I'm a Teacher</span>
          </Button>
          
          <Button
            size="lg" 
            variant="outline"
            className="w-full flex items-center justify-center gap-2 py-6"
            onClick={() => setUserRole('student')}
            disabled={isLoading}
          >
            <GraduationCap className="h-6 w-6" />
            <span className="text-lg">I'm a Student</span>
          </Button>
        </CardContent>
        <CardFooter className="flex justify-center">
          <p className="text-sm text-gray-500">
            You can change your role later in your dashboard settings
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default RoleSelector;
