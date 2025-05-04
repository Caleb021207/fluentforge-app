import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/hooks/useLocalization";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon } from "lucide-react";

const DistrictInfoSection = () => {
  const { t } = useLocalization();
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Shelby County Schools (SCBOE)</CardTitle>
        <CardDescription>
          CIPA and FERPA Compliant Educational Platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert>
          <InfoIcon className="h-4 w-4" />
          <AlertDescription>
            This platform is approved for use in Shelby County Schools through the Student Code of Conduct.
            Parents who do not want their child to use this platform must notify the school in writing.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium">Key Compliance Features:</h4>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li>CIPA-compliant content filtering</li>
            <li>FERPA-compliant data privacy controls</li>
            <li>Age-appropriate access controls (ages 8+)</li>
            <li>Parental oversight options</li>
            <li>School administrator management tools</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default DistrictInfoSection;
