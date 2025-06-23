
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import TranslationDashboard from "@/components/admin/TranslationDashboard";
import TranslationStatus from "@/components/admin/TranslationStatus";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TranslationManagement: React.FC = () => {
  const { t } = useLocalization();

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-8">
        <Tabs defaultValue="status" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="status">Translation Status</TabsTrigger>
            <TabsTrigger value="dashboard">Translation Dashboard</TabsTrigger>
          </TabsList>
          
          <TabsContent value="status" className="mt-6">
            <TranslationStatus />
          </TabsContent>
          
          <TabsContent value="dashboard" className="mt-6">
            <TranslationDashboard />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TranslationManagement;
