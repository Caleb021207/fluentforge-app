
import React from 'react';
import { Shield } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ComplianceDashboard from "@/components/compliance/ComplianceDashboard";
import ParentalConsentManager from "@/components/compliance/ParentalConsentManager";
import DataBreachForm from "@/components/compliance/DataBreachForm";
import DataExportManager from "@/components/compliance/DataExportManager";
import DirectoryInfoOptOut from "@/components/compliance/DirectoryInfoOptOut";
import DataAccessAuditLog from "@/components/compliance/DataAccessAuditLog";

const Compliance = () => {
  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
          Compliance & Privacy Management
        </h1>
        <p className="text-gray-600">
          K-12 compliance tools for FERPA, COPPA, and data protection
        </p>
      </div>

      <Tabs defaultValue="dashboard" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:grid-cols-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="consent">Parental Consent</TabsTrigger>
          <TabsTrigger value="directory">Directory Info</TabsTrigger>
          <TabsTrigger value="audit">Access Audit</TabsTrigger>
          <TabsTrigger value="export">Data Export</TabsTrigger>
          <TabsTrigger value="breach">Data Breach</TabsTrigger>
        </TabsList>

        <TabsContent value="dashboard">
          <ComplianceDashboard />
        </TabsContent>

        <TabsContent value="consent">
          <ParentalConsentManager />
        </TabsContent>

        <TabsContent value="directory">
          <DirectoryInfoOptOut />
        </TabsContent>

        <TabsContent value="audit">
          <DataAccessAuditLog />
        </TabsContent>

        <TabsContent value="export">
          <DataExportManager />
        </TabsContent>

        <TabsContent value="breach">
          <DataBreachForm />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Compliance;
