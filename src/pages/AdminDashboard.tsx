
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useLocalization } from "@/context/LocalizationContext";
import AccessCodeGenerator from "@/components/admin/AccessCodeGenerator";
import { ShieldCheck, Users, CheckCircle2, Database } from "lucide-react";

const AdminDashboard = () => {
  const { t } = useLocalization();

  return (
    <div className="p-6">
      <header className="mb-6">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-gray-500">Manage settings, users, and content</p>
      </header>

      <Tabs defaultValue="users">
        <TabsList className="mb-4 grid grid-cols-4 md:w-[400px]">
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="access">Access</TabsTrigger>
          <TabsTrigger value="system">System</TabsTrigger>
        </TabsList>
        
        <TabsContent value="users">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">120</div>
                <p className="text-xs text-gray-500">+10% from last month</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">76%</div>
                <p className="text-xs text-gray-500">+4% from last month</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="content">
          <Card>
            <CardHeader>
              <CardTitle>Content Management</CardTitle>
              <CardDescription>Manage lessons, exercises, and assessments</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <p>Content management features are coming soon.</p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="access">
          <div className="grid gap-6 md:grid-cols-2">
            <AccessCodeGenerator />
            
            <Card>
              <CardHeader>
                <CardTitle>Tier Management Tools</CardTitle>
                <CardDescription>Test and manage the tiered system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p>Use these tools to test and manage the tier system:</p>
                  <Button asChild className="w-full">
                    <Link to="/test-tiers">Test Tier System</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Settings</CardTitle>
              <CardDescription>Server and application settings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Database className="h-4 w-4 text-gray-500" />
                  <span>Database Status</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500 text-sm">Online</span>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ShieldCheck className="h-4 w-4 text-gray-500" />
                  <span>Security Status</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-green-500 text-sm">Protected</span>
                  <div className="h-2 w-2 rounded-full bg-green-500"></div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
