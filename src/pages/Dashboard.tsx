
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { useClassroom } from '@/context/ClassroomContext';
import StudentDashboard from '@/components/dashboard/StudentDashboard';
import TeacherDashboard from '@/components/dashboard/TeacherDashboard';
import RoleSelector from '@/components/dashboard/RoleSelector';
import { requireAuth } from '@/utils/authUtils';

const Dashboard = () => {
  const { user } = useAuth();
  const { userRole, isTeacher, isStudent, isLoading } = useClassroom();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lingua-primary"></div>
      </div>
    );
  }

  // If no role is selected yet, show the role selector
  if (!userRole) {
    return <RoleSelector />;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Classroom Dashboard</h1>
          <p className="text-muted-foreground">
            Manage your language learning classes and track progress
          </p>
        </div>
        <RoleSelector showAsButton />
      </div>

      {isTeacher ? <TeacherDashboard /> : <StudentDashboard />}
    </div>
  );
};

export default requireAuth(Dashboard);
