import { useState, useEffect, useCallback } from 'react';
import { supabase } from "@/integrations/supabase/client";

interface ProfilingStatus {
  studentId: string;
  profilingEnabled: boolean;
  hasConsent: boolean;
}

export const useStudentProfilingStatus = (studentIds: string[]) => {
  const [statusMap, setStatusMap] = useState<Map<string, ProfilingStatus>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  const fetchStatus = useCallback(async () => {
    if (!studentIds.length) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const academicYear = `${new Date().getFullYear()}-${new Date().getFullYear() + 1}`;

    try {
      // Fetch profiling status
      const { data: profiles, error: profilesError } = await supabase
        .from('student_learning_profiles')
        .select('student_id, profiling_enabled')
        .in('student_id', studentIds)
        .eq('academic_year', academicYear);

      if (profilesError) {
        console.error("Error fetching profiling status:", profilesError);
      }

      // Fetch consent records
      const { data: consents, error: consentsError } = await supabase
        .from('parental_consent_records')
        .select('student_id, consented')
        .in('student_id', studentIds)
        .eq('consent_type', 'profiling')
        .eq('academic_year', academicYear);

      if (consentsError) {
        console.error("Error fetching consent records:", consentsError);
      }

      // Build status map
      const newStatusMap = new Map<string, ProfilingStatus>();
      
      studentIds.forEach(studentId => {
        const profile = profiles?.find(p => p.student_id === studentId);
        const consent = consents?.find(c => c.student_id === studentId);
        
        newStatusMap.set(studentId, {
          studentId,
          profilingEnabled: profile?.profiling_enabled ?? false,
          hasConsent: consent?.consented ?? false
        });
      });

      setStatusMap(newStatusMap);
    } catch (error) {
      console.error("Error in useStudentProfilingStatus:", error);
    } finally {
      setIsLoading(false);
    }
  }, [studentIds.join(',')]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const updateStatus = useCallback((studentId: string, updates: Partial<ProfilingStatus>) => {
    setStatusMap(prev => {
      const newMap = new Map(prev);
      const current = newMap.get(studentId) || { 
        studentId, 
        profilingEnabled: false, 
        hasConsent: false 
      };
      newMap.set(studentId, { ...current, ...updates });
      return newMap;
    });
  }, []);

  const getStatus = useCallback((studentId: string): ProfilingStatus => {
    return statusMap.get(studentId) || { 
      studentId, 
      profilingEnabled: false, 
      hasConsent: false 
    };
  }, [statusMap]);

  return {
    statusMap,
    isLoading,
    getStatus,
    updateStatus,
    refetch: fetchStatus
  };
};
