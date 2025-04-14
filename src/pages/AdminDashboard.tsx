
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Loader2, Users, Calendar, Award } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";

const AdminDashboard = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [userProfiles, setUserProfiles] = useState<any[]>([]);
  const [totalAccounts, setTotalAccounts] = useState(0);
  const [accountsByLevel, setAccountsByLevel] = useState<Record<string, number>>({});
  const [certificationCount, setCertificationCount] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true);
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // For demo purposes, we'll just check if the user's email contains "admin"
          // In a real application, you would have a proper role-based system
          const isAdminUser = user.email?.includes("admin") || false;
          setIsAdmin(isAdminUser);
          
          if (isAdminUser) {
            await fetchUserData();
          } else {
            toast({
              title: "Access Denied",
              description: "You don't have permission to access the admin dashboard.",
              variant: "destructive",
            });
            navigate("/");
          }
        } else {
          toast({
            title: "Authentication Required",
            description: "Please sign in to access this page.",
            variant: "destructive",
          });
          navigate("/");
        }
      } catch (error) {
        console.error("Error checking authentication:", error);
        toast({
          title: "Error",
          description: "An error occurred while checking your permissions.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, [toast, navigate]);

  const fetchUserData = async () => {
    try {
      // Get user profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("user_profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Get certification attempts
      const { data: certifications, error: certificationsError } = await supabase
        .from("certification_attempts")
        .select("*");

      if (certificationsError) throw certificationsError;

      // Process data
      if (profiles) {
        setUserProfiles(profiles);
        setTotalAccounts(profiles.length);
        
        // Calculate accounts by level
        const levelCounts: Record<string, number> = {};
        profiles.forEach((profile) => {
          const level = profile.target_level || "Unknown";
          levelCounts[level] = (levelCounts[level] || 0) + 1;
        });
        setAccountsByLevel(levelCounts);
      }

      if (certifications) {
        setCertificationCount(certifications.length);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast({
        title: "Error",
        description: "An error occurred while fetching user data.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-lingua-primary" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return (
      <div className="text-center py-8">
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6">You don't have permission to access this page.</p>
        <Button onClick={() => navigate("/")} className="bg-lingua-primary hover:bg-lingua-primary/90">
          Return to Home
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-lingua-text">Admin Dashboard</h1>
        <Badge variant="outline" className="px-3 py-1">
          Admin View
        </Badge>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Total Accounts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalAccounts}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Calendar className="h-4 w-4 mr-2" />
              New This Month
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {userProfiles.filter(p => {
                const createdDate = new Date(p.created_at);
                const now = new Date();
                return createdDate.getMonth() === now.getMonth() && 
                       createdDate.getFullYear() === now.getFullYear();
              }).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium flex items-center">
              <Award className="h-4 w-4 mr-2" />
              Certifications Taken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{certificationCount}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">User Accounts</TabsTrigger>
          <TabsTrigger value="metrics">Level Distribution</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users" className="p-1">
          <Card>
            <CardHeader>
              <CardTitle>User Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-4 font-medium">User ID</th>
                      <th className="text-left py-2 px-4 font-medium">Display Name</th>
                      <th className="text-left py-2 px-4 font-medium">Target Level</th>
                      <th className="text-left py-2 px-4 font-medium">Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userProfiles.length > 0 ? (
                      userProfiles.map((profile) => (
                        <tr key={profile.id} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-4 text-sm">{profile.id.substring(0, 8)}...</td>
                          <td className="py-2 px-4 text-sm">{profile.display_name || "-"}</td>
                          <td className="py-2 px-4 text-sm">{profile.target_level || "-"}</td>
                          <td className="py-2 px-4 text-sm">
                            {profile.created_at ? format(new Date(profile.created_at), 'MMM d, yyyy') : "-"}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-4 text-center text-gray-500">
                          No user accounts found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metrics">
          <Card>
            <CardHeader>
              <CardTitle>User Level Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {Object.entries(accountsByLevel).sort().map(([level, count]) => (
                  <Card key={level}>
                    <CardContent className="p-4 text-center">
                      <div className="text-2xl font-bold">{count}</div>
                      <div className="text-sm text-muted-foreground mt-1">{level}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="text-sm text-muted-foreground mt-8">
        <p>
          Note: This is a simple admin dashboard. In a production environment, 
          you would implement more sophisticated access controls and additional metrics.
        </p>
      </div>
    </div>
  );
};

export default AdminDashboard;
