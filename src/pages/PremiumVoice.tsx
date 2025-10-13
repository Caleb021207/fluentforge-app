
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Volume2 } from "lucide-react";

const PremiumVoice = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Volume2 className="h-8 w-8 text-blue-600" />
          Premium Voice Chat
        </h1>
        <p className="text-gray-600">
          Practice speaking with advanced AI voice conversation partners.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Premium Voice Features</CardTitle>
          <CardDescription>
            Advanced AI-powered voice conversation practice
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="text-gray-600">Premium voice chat features coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default PremiumVoice;
