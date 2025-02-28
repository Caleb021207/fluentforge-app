
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";

const ConversationalFluencyTest = () => {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Conversational Fluency Test</CardTitle>
        <MessageSquare className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="bg-gray-50 rounded-lg p-6 text-center">
          <p className="text-gray-500 mb-2">Test your conversational Spanish skills</p>
          <p className="text-sm text-gray-400">Coming soon</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationalFluencyTest;
