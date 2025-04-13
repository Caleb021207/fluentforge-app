
import React, { useEffect, useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

/**
 * A debug component to log admin status and database structure
 * Only visible in development mode
 */
const AdminLogger = () => {
  const [userInfo, setUserInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setUserInfo({ message: "No user logged in" });
          return;
        }
        
        // Get user profile
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          console.error("Profile error:", profileError);
          setError(`Profile error: ${profileError.message}`);
          return;
        }
        
        // Log the structure of the user_profiles table
        const { data: tableInfo, error: tableError } = await supabase
          .from('user_profiles')
          .select('*')
          .limit(1);
        
        if (tableError) {
          console.error("Table info error:", tableError);
          setError(`Table info error: ${tableError.message}`);
          return;
        }
        
        setUserInfo({
          userId: user.id,
          profile,
          tableColumns: tableInfo && tableInfo.length > 0 ? Object.keys(tableInfo[0]) : []
        });
      } catch (err) {
        console.error("Admin logger error:", err);
        setError(`Error: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };
    
    checkAdminStatus();
  }, []);

  // Only show in development
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <Card className="mt-4 border-dashed border-red-300 bg-red-50 hidden">
      <CardHeader>
        <CardTitle>Admin Debug Log</CardTitle>
        <CardDescription>Only visible in development</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div>Loading user info...</div>
        ) : error ? (
          <div className="text-red-500">{error}</div>
        ) : (
          <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto">
            {JSON.stringify(userInfo, null, 2)}
          </pre>
        )}
      </CardContent>
    </Card>
  );
};

export default AdminLogger;
