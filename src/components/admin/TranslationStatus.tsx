
import React from "react";
import { validateAllLanguages, type LanguageValidationReport } from "@/utils/translationValidator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, AlertCircle, XCircle } from "lucide-react";

const TranslationStatus: React.FC = () => {
  const reports = validateAllLanguages();

  const getStatusIcon = (completionPercentage: number) => {
    if (completionPercentage === 100) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (completionPercentage >= 80) {
      return <AlertCircle className="h-5 w-5 text-yellow-500" />;
    } else {
      return <XCircle className="h-5 w-5 text-red-500" />;
    }
  };

  const getStatusColor = (completionPercentage: number) => {
    if (completionPercentage === 100) return "bg-green-100 text-green-800";
    if (completionPercentage >= 80) return "bg-yellow-100 text-yellow-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="p-6 space-y-4">
      <div>
        <h2 className="text-2xl font-bold mb-2">Translation System Status</h2>
        <p className="text-gray-600">Monitor translation completeness across all supported languages</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {reports.map((report: LanguageValidationReport) => (
          <Card key={report.language}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {report.language}
              </CardTitle>
              {getStatusIcon(report.validation.completionPercentage)}
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Completion</span>
                  <Badge className={getStatusColor(report.validation.completionPercentage)}>
                    {report.validation.completionPercentage}%
                  </Badge>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Keys</span>
                  <span className="text-sm font-medium">
                    {report.validation.foundKeys}/{report.validation.totalKeys}
                  </span>
                </div>

                {report.criticalMissing.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-red-600 font-medium">
                      Critical Missing: {report.criticalMissing.length}
                    </span>
                  </div>
                )}

                {report.validation.missingKeys.length > 0 && (
                  <div className="mt-2 text-xs text-gray-500">
                    Missing: {Math.min(report.validation.missingKeys.length, 3)} 
                    {report.validation.missingKeys.length > 3 && "+"} keys
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {process.env.NODE_ENV === 'development' && (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-sm">Development Info</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-gray-600">
              Check the browser console for detailed translation validation logs.
              This status panel is only visible in development mode.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TranslationStatus;
