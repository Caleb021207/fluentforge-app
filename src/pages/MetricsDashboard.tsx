
import React from 'react';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useTeacherStatus } from '@/hooks/useTeacherStatus';
import { Navigate } from 'react-router-dom';
import StudentMetricsDashboard from '@/components/metrics-dashboard/StudentMetricsDashboard';
import TeacherMetricsDashboard from '@/components/metrics-dashboard/TeacherMetricsDashboard';

const MetricsDashboard = () => {
  const { isAuthenticated } = useAuthGuard();
  const { isTeacher, isLoading: teacherStatusLoading } = useTeacherStatus();
  
  if (!isAuthenticated) {
    return <Navigate to="/" />;
  }
  
  if (teacherStatusLoading) {
    return <div className="p-8 flex justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }
  
  return (
    <div className="container max-w-7xl mx-auto py-6">
      <h1 className="text-2xl md:text-3xl font-bold mb-6">Language Metrics Dashboard</h1>
      
      {isTeacher ? <TeacherMetricsDashboard /> : <StudentMetricsDashboard />}
    </div>
  );
};

export default MetricsDashboard;
