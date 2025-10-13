
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield } from "lucide-react";

const Compliance = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Shield className="h-6 w-6 text-primary" />
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
        <CardContent className="p-6">
          <p className="text-gray-600">Compliance and privacy features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Compliance;
