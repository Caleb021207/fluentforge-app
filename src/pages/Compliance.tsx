
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const Compliance = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-8 w-8 text-blue-600" />
          Compliance & Privacy
        </h1>
        <p className="text-gray-600">
          Privacy settings, data compliance, and safety features.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Privacy & Compliance</CardTitle>
          <CardDescription>
            Manage your privacy settings and compliance preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-600">Compliance and privacy features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Compliance;
