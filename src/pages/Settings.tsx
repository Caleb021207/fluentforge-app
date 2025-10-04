
import React from "react";
import { Shield, FileText, TrendingUp } from "lucide-react";
import ParentalControls from "@/components/compliance/ParentalControls";
import { UsageDashboard } from "@/components/usage/UsageDashboard";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const Settings = () => {
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>
      
      {/* Usage Limits Section */}
      <Card className="w-full mb-6">
        <CardHeader className="flex flex-row items-center gap-2">
          <TrendingUp size={20} className="text-primary" />
          <div>
            <CardTitle>Usage Limits</CardTitle>
            <CardDescription>Monitor your daily AI usage and remaining quota</CardDescription>
          </div>
        </CardHeader>
      </Card>
      
      <div className="mb-6">
        <UsageDashboard />
      </div>
      
      {/* Parental Controls Section */}
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-2">
          <Shield size={20} className="text-primary" />
          <div>
            <CardTitle>Parental Controls</CardTitle>
            <CardDescription>Manage safety and privacy settings</CardDescription>
          </div>
        </CardHeader>
        <CardFooter className="flex justify-end">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1" 
            onClick={() => navigate("/safety-policy")}
          >
            <FileText size={16} />
            Safety Policy
          </Button>
        </CardFooter>
      </Card>
      
      <div className="mt-4">
        <ParentalControls />
      </div>
    </div>
  );
};

export default Settings;
