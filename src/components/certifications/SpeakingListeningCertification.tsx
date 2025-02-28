
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SpeakingListeningCertification = () => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>Speaking & Listening Certification Test</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-gray-600">
            This feature has been temporarily removed and will be rebuilt in a future update.
          </p>
          <Button disabled>Test Currently Unavailable</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SpeakingListeningCertification;
