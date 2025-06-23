
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { getLanguageIntegrationStatus, validateLanguageReadiness } from '@/utils/languageIntegrator';
import { validateAllLanguageTranslations, getLanguagesByCompleteness } from '@/utils/translationValidator';
import { AVAILABLE_LANGUAGES } from '@/translations/constants';
import BatchTranslationImplementer from './BatchTranslationImplementer';

const TranslationDashboard: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  
  const languageStatuses = getLanguageIntegrationStatus();
  const languagesByCompleteness = getLanguagesByCompleteness();
  const allValidations = validateAllLanguageTranslations();

  const getStatusColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 50) return 'text-orange-600';
    return 'text-red-600';
  };

  const getStatusBadge = (percentage: number) => {
    if (percentage >= 90) return <Badge className="bg-green-100 text-green-800">Ready</Badge>;
    if (percentage >= 70) return <Badge className="bg-yellow-100 text-yellow-800">Good</Badge>;
    if (percentage >= 50) return <Badge className="bg-orange-100 text-orange-800">Partial</Badge>;
    return <Badge className="bg-red-100 text-red-800">Incomplete</Badge>;
  };

  const completedLanguages = languageStatuses.filter(lang => lang.completionPercentage >= 90);
  const inProgressLanguages = languageStatuses.filter(lang => lang.completionPercentage >= 50 && lang.completionPercentage < 90);
  const incompleteLanguages = languageStatuses.filter(lang => lang.completionPercentage < 50);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Translation Management Dashboard</h1>
        <div className="flex gap-2">
          <Badge variant="outline">{languageStatuses.length} Languages</Badge>
          <Badge className="bg-green-100 text-green-800">{completedLanguages.length} Complete</Badge>
          <Badge className="bg-yellow-100 text-yellow-800">{inProgressLanguages.length} In Progress</Badge>
          <Badge className="bg-red-100 text-red-800">{incompleteLanguages.length} Incomplete</Badge>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="batch">Batch Implementation</TabsTrigger>
          <TabsTrigger value="validation">Validation</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Total Languages</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{languageStatuses.length}</div>
                <p className="text-xs text-muted-foreground">Active translations</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Production Ready</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{completedLanguages.length}</div>
                <p className="text-xs text-muted-foreground">≥90% complete</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">In Development</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{inProgressLanguages.length}</div>
                <p className="text-xs text-muted-foreground">50-89% complete</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium">Need Attention</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{incompleteLanguages.length}</div>
                <p className="text-xs text-muted-foreground">&lt;50% complete</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Completion Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {languagesByCompleteness.slice(0, 8).map(lang => (
                  <div key={lang.language} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{lang.displayName}</span>
                      <div className="flex items-center gap-2">
                        <span className={`text-sm font-medium ${getStatusColor(lang.completionPercentage)}`}>
                          {lang.completionPercentage}%
                        </span>
                        {getStatusBadge(lang.completionPercentage)}
                      </div>
                    </div>
                    <Progress value={lang.completionPercentage} className="h-2" />
                    {lang.missingKeys > 0 && (
                      <p className="text-xs text-gray-500">{lang.missingKeys} missing translations</p>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Priority Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {incompleteLanguages.length > 0 && (
                  <Alert>
                    <AlertDescription>
                      <strong>{incompleteLanguages.length} languages</strong> need significant translation work.
                      Consider using the batch implementation tool.
                    </AlertDescription>
                  </Alert>
                )}
                
                {inProgressLanguages.length > 0 && (
                  <Alert>
                    <AlertDescription>
                      <strong>{inProgressLanguages.length} languages</strong> are nearly complete.
                      Focus on these for quick wins.
                    </AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <h4 className="font-medium">Recommended Next Steps:</h4>
                  <ul className="text-sm space-y-1 text-gray-600">
                    <li>• Use batch implementation for multiple languages</li>
                    <li>• Prioritize languages with existing user base</li>
                    <li>• Validate critical UI translations first</li>
                    <li>• Test translations in staging environment</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="languages" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {languageStatuses.map(lang => {
              const readiness = validateLanguageReadiness(lang.language);
              
              return (
                <Card key={lang.language} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{lang.displayName}</CardTitle>
                        <p className="text-sm text-gray-500">{lang.language}</p>
                      </div>
                      {getStatusBadge(lang.completionPercentage)}
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion</span>
                        <span className={getStatusColor(lang.completionPercentage)}>
                          {lang.completionPercentage}%
                        </span>
                      </div>
                      <Progress value={lang.completionPercentage} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Found:</span>
                        <span className="ml-1 font-medium">{lang.foundKeys}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Missing:</span>
                        <span className="ml-1 font-medium text-red-600">{lang.missingKeys.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total:</span>
                        <span className="ml-1 font-medium">{lang.totalKeys}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Critical:</span>
                        <span className="ml-1 font-medium text-orange-600">{lang.criticalMissing.length}</span>
                      </div>
                    </div>

                    {lang.criticalMissing.length > 0 && (
                      <Alert className="py-2">
                        <AlertDescription className="text-xs">
                          {lang.criticalMissing.length} critical UI elements missing translations
                        </AlertDescription>
                      </Alert>
                    )}

                    <div className="flex gap-2 text-xs">
                      {readiness.isReady ? (
                        <Badge className="bg-green-100 text-green-800">Production Ready</Badge>
                      ) : (
                        <Badge className="bg-yellow-100 text-yellow-800">Needs Work</Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="batch">
          <BatchTranslationImplementer />
        </TabsContent>

        <TabsContent value="validation" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Translation Validation Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Object.entries(allValidations).map(([language, validation]) => (
                  <div key={language} className="border rounded-lg p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="font-medium">{AVAILABLE_LANGUAGES[language] || language}</h3>
                      <Badge variant={validation.isComplete ? "default" : "secondary"}>
                        {validation.completionPercentage}% Complete
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Found Keys:</span>
                        <span className="ml-2 font-medium text-green-600">{validation.foundKeys}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Missing Keys:</span>
                        <span className="ml-2 font-medium text-red-600">{validation.missingKeys.length}</span>
                      </div>
                      <div>
                        <span className="text-gray-500">Total Keys:</span>
                        <span className="ml-2 font-medium">{validation.totalKeys}</span>
                      </div>
                    </div>

                    {validation.missingKeys.length > 0 && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm font-medium text-blue-600">
                          Show Missing Keys ({validation.missingKeys.length})
                        </summary>
                        <div className="mt-2 max-h-32 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-1 text-xs">
                            {validation.missingKeys.slice(0, 20).map(key => (
                              <code key={key} className="bg-gray-100 px-1 py-0.5 rounded">{key}</code>
                            ))}
                            {validation.missingKeys.length > 20 && (
                              <span className="text-gray-500">...and {validation.missingKeys.length - 20} more</span>
                            )}
                          </div>
                        </div>
                      </details>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TranslationDashboard;
