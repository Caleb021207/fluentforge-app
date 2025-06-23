
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import {
  validateAllLanguageTranslations,
  getLanguagesByCompleteness,
  MASTER_TRANSLATION_KEYS,
  TRANSLATION_CATEGORIES,
  getMissingKeysForCategory,
} from "@/utils/translationValidator";
import { CheckCircle, AlertCircle, Copy, Download } from "lucide-react";

const TranslationDashboard: React.FC = () => {
  const { toast } = useToast();
  const [selectedLanguage, setSelectedLanguage] = useState<string>("");
  
  const languageData = getLanguagesByCompleteness();
  const allValidations = validateAllLanguageTranslations();

  const handleCopyMissingKeys = (languageCode: string, category?: keyof typeof TRANSLATION_CATEGORIES) => {
    const validation = allValidations[languageCode];
    const keys = category 
      ? getMissingKeysForCategory(languageCode, category)
      : validation.missingKeys;
    
    navigator.clipboard.writeText(keys.join('\n'));
    toast({
      title: "Copied to clipboard",
      description: `${keys.length} missing keys copied for ${languageCode}${category ? ` (${category})` : ''}`,
    });
  };

  const generateTranslationTemplate = (languageCode: string) => {
    const validation = allValidations[languageCode];
    const template = validation.missingKeys.map(key => `"${key}": "",`).join('\n');
    
    navigator.clipboard.writeText(template);
    toast({
      title: "Template copied",
      description: `Translation template for ${languageCode} copied to clipboard`,
    });
  };

  const getStatusColor = (percentage: number) => {
    if (percentage >= 95) return "text-green-600";
    if (percentage >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  const getStatusIcon = (percentage: number) => {
    if (percentage >= 95) return <CheckCircle className="h-4 w-4 text-green-600" />;
    return <AlertCircle className="h-4 w-4 text-red-600" />;
  };

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">Translation Management Dashboard</h1>
        <p className="text-muted-foreground mt-2">
          Comprehensive translation coverage for all {Object.keys(allValidations).length} languages
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Languages</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{languageData.length}</div>
            <p className="text-sm text-muted-foreground">
              {languageData.filter(l => l.completionPercentage >= 95).length} complete
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Master Keys</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{MASTER_TRANSLATION_KEYS.length}</div>
            <p className="text-sm text-muted-foreground">Translation keys defined</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average Coverage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(
                languageData.reduce((sum, lang) => sum + lang.completionPercentage, 0) / languageData.length
              )}%
            </div>
            <p className="text-sm text-muted-foreground">Across all languages</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Language Completion Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {languageData.map((lang) => (
                  <div key={lang.language} className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {getStatusIcon(lang.completionPercentage)}
                      <div>
                        <div className="font-medium">{lang.displayName}</div>
                        <div className="text-sm text-muted-foreground">
                          {lang.missingKeys} missing keys
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Progress value={lang.completionPercentage} className="w-32" />
                      <Badge 
                        variant={lang.completionPercentage >= 95 ? "default" : "destructive"}
                        className={getStatusColor(lang.completionPercentage)}
                      >
                        {lang.completionPercentage}%
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setSelectedLanguage(lang.language)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="detailed" className="space-y-4">
          {selectedLanguage && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Detailed Analysis: {languageData.find(l => l.language === selectedLanguage)?.displayName}
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleCopyMissingKeys(selectedLanguage)}
                    >
                      <Copy className="h-4 w-4 mr-2" />
                      Copy Missing Keys
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => generateTranslationTemplate(selectedLanguage)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Generate Template
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.entries(TRANSLATION_CATEGORIES).map(([categoryName, categoryKeys]) => {
                    const missingInCategory = getMissingKeysForCategory(selectedLanguage, categoryName as keyof typeof TRANSLATION_CATEGORIES);
                    const completionPercentage = Math.round(
                      ((categoryKeys.length - missingInCategory.length) / categoryKeys.length) * 100
                    );

                    return (
                      <div key={categoryName} className="border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="font-semibold capitalize">{categoryName}</h3>
                          <div className="flex items-center space-x-2">
                            <Progress value={completionPercentage} className="w-24" />
                            <Badge variant={completionPercentage >= 95 ? "default" : "destructive"}>
                              {completionPercentage}%
                            </Badge>
                          </div>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {categoryKeys.length - missingInCategory.length} of {categoryKeys.length} keys present
                        </div>
                        {missingInCategory.length > 0 && (
                          <div className="mt-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCopyMissingKeys(selectedLanguage, categoryName as keyof typeof TRANSLATION_CATEGORIES)}
                            >
                              Copy {missingInCategory.length} Missing Keys
                            </Button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          {!selectedLanguage && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Select a language from the overview tab to see detailed analysis.
              </AlertDescription>
            </Alert>
          )}
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(TRANSLATION_CATEGORIES).map(([categoryName, categoryKeys]) => (
              <Card key={categoryName}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg capitalize">{categoryName}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="text-2xl font-bold">{categoryKeys.length}</div>
                    <div className="text-sm text-muted-foreground">Translation keys</div>
                    <div className="text-xs text-muted-foreground">
                      Avg completion: {Math.round(
                        languageData.reduce((sum, lang) => {
                          const missing = getMissingKeysForCategory(lang.language, categoryName as keyof typeof TRANSLATION_CATEGORIES);
                          return sum + ((categoryKeys.length - missing.length) / categoryKeys.length) * 100;
                        }, 0) / languageData.length
                      )}%
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TranslationDashboard;
