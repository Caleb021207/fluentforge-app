
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";

const ConversationalFluencyTest = () => {
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-xl font-bold">Conversational Fluency Test</CardTitle>
        <MessageSquare className="h-5 w-5 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            The Conversational Fluency Test evaluates your ability to understand and respond to spoken Spanish in real-time conversations. This test assesses your listening comprehension, speaking skills, and ability to maintain a natural conversation flow.
          </p>
          
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <p className="text-gray-500 mb-4">Ready to test your conversational Spanish skills?</p>
            <Button disabled className="bg-blue-500 hover:bg-blue-600">
              Start Test
            </Button>
            <p className="text-sm text-gray-400 mt-3">Coming soon</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConversationalFluencyTest;
