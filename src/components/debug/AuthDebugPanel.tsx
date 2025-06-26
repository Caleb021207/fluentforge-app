
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const AuthDebugPanel = () => {
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchDebugInfo = async () => {
    setIsLoading(true);
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error('User error:', userError);
        toast({
          title: "Authentication Error",
          description: userError.message,
          variant: "destructive"
        });
        return;
      }

      if (!user) {
        setDebugInfo({ error: "No authenticated user" });
        return;
      }

      // Get user profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      // Get district associations
      const { data: districtUsers, error: districtError } = await supabase
        .from('district_users')
        .select('*, school_districts(*)')
        .eq('user_id', user.id);

      // Get accessible schools
      const { data: schools, error: schoolsError } = await supabase
        .from('schools')
        .select('*');

      // Get accessible classes
      const { data: classes, error: classesError } = await supabase
        .from('classes')
        .select('*, schools(name)');

      // Get accessible student enrollments
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('student_enrollments')
        .select('*, classes(name, schools(name))');

      setDebugInfo({
        user: {
          id: user.id,
          email: user.email,
          created_at: user.created_at
        },
        profile,
        profileError,
        districtUsers,
        districtError,
        schools: schools?.length || 0,
        schoolsError,
        classes: classes?.length || 0,
        classesError,
        enrollments: enrollments?.length || 0,
        enrollmentsError,
        rawData: {
          schools,
          classes,
          enrollments
        }
      });

    } catch (error) {
      console.error('Debug fetch error:', error);
      toast({
        title: "Debug Error",
        description: "Failed to fetch debug information",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDebugInfo();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Authentication & Permissions Debug Panel
          <Button onClick={fetchDebugInfo} disabled={isLoading}>
            {isLoading ? "Loading..." : "Refresh"}
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {debugInfo ? (
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold">User Info:</h3>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo.user, null, 2)}
              </pre>
            </div>

            <div>
              <h3 className="font-semibold">Profile:</h3>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo.profile, null, 2)}
              </pre>
              {debugInfo.profileError && (
                <p className="text-red-500 text-sm">Error: {debugInfo.profileError.message}</p>
              )}
            </div>

            <div>
              <h3 className="font-semibold">District Associations:</h3>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto">
                {JSON.stringify(debugInfo.districtUsers, null, 2)}
              </pre>
              {debugInfo.districtError && (
                <p className="text-red-500 text-sm">Error: {debugInfo.districtError.message}</p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold">Schools Access:</h3>
                <p>Count: {debugInfo.schools}</p>
                {debugInfo.schoolsError && (
                  <p className="text-red-500 text-sm">Error: {debugInfo.schoolsError.message}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold">Classes Access:</h3>
                <p>Count: {debugInfo.classes}</p>
                {debugInfo.classesError && (
                  <p className="text-red-500 text-sm">Error: {debugInfo.classesError.message}</p>
                )}
              </div>

              <div>
                <h3 className="font-semibold">Enrollments Access:</h3>
                <p>Count: {debugInfo.enrollments}</p>
                {debugInfo.enrollmentsError && (
                  <p className="text-red-500 text-sm">Error: {debugInfo.enrollmentsError.message}</p>
                )}
              </div>
            </div>

            <details className="mt-4">
              <summary className="cursor-pointer font-semibold">Raw Data (Click to expand)</summary>
              <pre className="text-xs bg-muted p-2 rounded overflow-auto mt-2 max-h-96">
                {JSON.stringify(debugInfo.rawData, null, 2)}
              </pre>
            </details>
          </div>
        ) : (
          <p>Loading debug information...</p>
        )}
      </CardContent>
    </Card>
  );
};

export default AuthDebugPanel;
