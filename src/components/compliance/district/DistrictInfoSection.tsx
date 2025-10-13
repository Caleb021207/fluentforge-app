
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, Building2 } from "lucide-react";

const DistrictInfoSection = () => {
  const { t } = useLocalization();
  
  // TODO: Make this dynamic based on user's district from database
  // For now, showing generic version with Shelby County as example
  const districtName = "Shelby County Schools (SCBOE)";
  const isDistrictSpecific = true; // Set to false for generic view
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-lingua-primary" />
          {isDistrictSpecific ? districtName : "District Compliance Information"}
        </CardTitle>
        <CardDescription>
          CIPA and FERPA Compliant Educational Platform
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {isDistrictSpecific ? (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              This platform is approved for use in {districtName} through the Student Code of Conduct.
              Parents who do not want their child to use this platform must notify the school in writing.
            </AlertDescription>
          </Alert>
        ) : (
          <Alert>
            <InfoIcon className="h-4 w-4" />
            <AlertDescription>
              Palavox is designed to meet CIPA and FERPA requirements for K-12 educational institutions.
              Each school district can customize compliance settings based on local policies.
              Contact sales@palavox.org for district-specific implementation details.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-2">
          <h4 className="font-medium">Key Compliance Features:</h4>
          <ul className="list-disc pl-6 space-y-1.5 text-sm">
            <li>CIPA-compliant content filtering (violence, substances, adult content, hate speech)</li>
            <li>FERPA-compliant data privacy controls with minimal PII collection</li>
            <li>Age-appropriate access controls (ages 8+) with age verification</li>
            <li>Parental oversight options including PIN-protected settings</li>
            <li>School administrator management tools and usage analytics</li>
            <li>Encrypted data storage (AES-256) and secure transmission (TLS 1.3)</li>
            <li>Role-based access control (RBAC) for teachers and administrators</li>
          </ul>
        </div>

        {!isDistrictSpecific && (
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong>For District Administrators:</strong> To customize this section for your district,
              including approval status and district-specific policies, please contact us at{" "}
              <a href="mailto:sales@palavox.org" className="text-lingua-primary hover:underline">
                sales@palavox.org
              </a>
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DistrictInfoSection;
