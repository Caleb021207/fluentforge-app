
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { generateSystemTranslationReport, generateLanguageHealthReport } from '@/utils/enhancedTranslationValidator';
import { getAuditSummary } from '@/utils/languageAuditSystem';

const TranslationSystemDashboard: React.FC = () => {
  const [systemReport, setSystemReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  useEffect(() => {
    const loadReport = async () => {
      setLoading(true);
      try {
        const report = generateSystemTranslationReport();
        setSystemReport(report);
      } catch (error) {
        console.error('Failed to load translation report:', error);
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center p-8">Loading translation system report...</div>;
  }

  if (!systemReport) {
    return <div className="p-8 text-center text-red-600">Failed to load translation system report</div>;
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    if (score >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getScoreBadge = (score: number) => {
    if (score >= 90) return <Badge className="bg-green-100 text-green-800">Excellent</Badge>;
    if (score >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (score >= 50) return <Badge className="bg-orange-100 text-orange-800">Fair</Badge>;
    return <Badge className="bg-red-100 text-red-800">Poor</Badge>;
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Translation System Dashboard</h1>
        <div className="flex gap-2">
          <Badge variant="outline">System Score: {systemReport.systemScore}/100</Badge>
          {getScoreBadge(systemReport.systemScore)}
        </div>
      </div>

      {systemReport.criticalIssues > 0 && (
        <Alert>
          <AlertDescription>
            <strong>Critical Issues Detected:</strong> {systemReport.criticalIssues} critical translation issues require immediate attention.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="languages">Language Health</TabsTrigger>
          <TabsTrigger value="issues">Common Issues</TabsTrigger>
          <TabsTrigger value="recommendations">Action Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{systemReport.summary.totalLanguages}</div>
                <p className="text-xs text-muted-foreground">Supported languages</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Fully Integrated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{systemReport.summary.fullyIntegrated}</div>
                <p className="text-xs text-muted-foreground">Complete translations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Highly Integrated</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{systemReport.summary.highlyIntegrated}</div>
                <p className="text-xs text-muted-foreground">Near completion</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{systemReport.criticalIssues}</div>
                <p className="text-xs text-muted-foreground">Require immediate fix</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>System Health Overview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Overall System Score</span>
                <span className={getScoreColor(systemReport.systemScore)}>{systemReport.systemScore}/100</span>
              </div>
              <Progress value={systemReport.systemScore} className="w-full" />
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{systemReport.summary.fullyIntegrated}</div>
                  <div className="text-sm text-muted-foreground">Fully Integrated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{systemReport.summary.highlyIntegrated}</div>
                  <div className="text-sm text-muted-foreground">Highly Integrated</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-orange-600">{systemReport.summary.minimallyIntegrated}</div>
                  <div className="text-sm text-muted-foreground">Minimally Integrated</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="languages" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Health Scores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemReport.healthReports.slice(0, 20).map((report: any) => (
                  <div key={report.language} className="flex items-center justify-between p-3 border rounded">
                    <div className="flex items-center gap-3">
                      <span className="font-medium capitalize">{report.language}</span>
                      {getScoreBadge(report.overallScore)}
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-32">
                        <Progress value={report.overallScore} className="h-2" />
                      </div>
                      <span className={`font-bold ${getScoreColor(report.overallScore)}`}>
                        {report.overallScore}/100
                      </span>
                      <Badge variant="outline">{report.issues.length} issues</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="issues" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Most Common Missing Translation Keys</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {systemReport.commonMissingKeys.map((item: any, index: number) => (
                  <div key={item.key} className="flex items-center justify-between p-3 border rounded">
                    <div>
                      <span className="font-medium">{item.key}</span>
                      <p className="text-sm text-muted-foreground">Missing in {item.count} languages</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-24">
                        <Progress value={item.percentage} className="h-2" />
                      </div>
                      <Badge variant="destructive">{item.percentage}%</Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recommendations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>System Recommendations</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {systemReport.recommendations.map((rec: string, index: number) => (
                  <div key={index} className="flex items-start gap-3 p-3 border rounded">
                    <Badge className="mt-0.5">{index + 1}</Badge>
                    <span>{rec}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Implementation Priority</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 border-l-4 border-red-500 bg-red-50">
                  <h4 className="font-bold text-red-800">Critical (Immediate)</h4>
                  <p className="text-sm">Fix mixed language text in practice guides across all languages</p>
                </div>
                <div className="p-3 border-l-4 border-orange-500 bg-orange-50">
                  <h4 className="font-bold text-orange-800">High Priority (This Week)</h4>
                  <p className="text-sm">Standardize translation keys and implement fallback system</p>
                </div>
                <div className="p-3 border-l-4 border-yellow-500 bg-yellow-50">
                  <h4 className="font-bold text-yellow-800">Medium Priority (This Month)</h4>
                  <p className="text-sm">Complete missing translations for highly integrated languages</p>
                </div>
                <div className="p-3 border-l-4 border-blue-500 bg-blue-50">
                  <h4 className="font-bold text-blue-800">Low Priority (Next Quarter)</h4>
                  <p className="text-sm">Enhance minimally integrated languages with full feature support</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TranslationSystemDashboard;
