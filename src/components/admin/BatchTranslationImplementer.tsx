import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { 
  createBatchImplementationPlan, 
  simulateBatchImplementation,
  generateBatchLanguageFileStructure,
  PRIORITY_LANGUAGES,
  ENHANCED_TRANSLATION_TEMPLATES,
  type BatchImplementationResult,
  type BatchImplementationPlan
} from '@/utils/batchTranslationImplementer';
import { generateLanguageIntegrationReport } from '@/utils/languageIntegrator';
import { AVAILABLE_LANGUAGES } from '@/translations/constants';

const BatchTranslationImplementer: React.FC = () => {
  const { toast } = useToast();
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>([]);
  const [implementationPlan, setImplementationPlan] = useState<BatchImplementationPlan | null>(null);
  const [implementationResult, setImplementationResult] = useState<BatchImplementationResult | null>(null);
  const [isImplementing, setIsImplementing] = useState(false);

  // Get available languages that aren't fully implemented
  const availableLanguages = Object.keys(AVAILABLE_LANGUAGES).filter(lang => {
    const report = generateLanguageIntegrationReport(lang);
    return report.completionPercentage < 100;
  });

  const handleLanguageSelection = (language: string, checked: boolean) => {
    if (checked) {
      setSelectedLanguages(prev => [...prev, language]);
    } else {
      setSelectedLanguages(prev => prev.filter(l => l !== language));
    }
  };

  const handleSelectAllPriority = () => {
    const priorityLanguages = PRIORITY_LANGUAGES.filter(lang => availableLanguages.includes(lang));
    setSelectedLanguages(priorityLanguages.slice(0, 10)); // First 10 priority languages
  };

  const handleCreatePlan = () => {
    if (selectedLanguages.length === 0) {
      toast({
        title: "No Languages Selected",
        description: "Please select at least one language to create an implementation plan.",
        variant: "destructive"
      });
      return;
    }

    const plan = createBatchImplementationPlan(selectedLanguages);
    setImplementationPlan(plan);
  };

  const handleImplementBatch = async () => {
    if (!implementationPlan) return;

    setIsImplementing(true);
    try {
      // Simulate the implementation
      const result = simulateBatchImplementation(implementationPlan.targetLanguages);
      setImplementationResult(result);
      
      toast({
        title: "Batch Implementation Complete",
        description: `Successfully prepared ${result.summary.successfulImplementations} languages for implementation.`,
      });
    } catch (error) {
      toast({
        title: "Implementation Error",
        description: "Failed to complete batch implementation.",
        variant: "destructive"
      });
    } finally {
      setIsImplementing(false);
    }
  };

  const getLanguageStatus = (language: string) => {
    const report = generateLanguageIntegrationReport(language);
    const hasTemplate = language in ENHANCED_TRANSLATION_TEMPLATES;
    
    return {
      completion: report.completionPercentage,
      hasTemplate,
      missing: report.missingKeys.length,
      critical: report.criticalMissing.length
    };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Batch Translation Implementation</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2 mb-4">
            <Button onClick={handleSelectAllPriority} variant="outline">
              Select Top 10 Priority Languages
            </Button>
            <Button 
              onClick={() => setSelectedLanguages([])} 
              variant="outline"
            >
              Clear Selection
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {availableLanguages.map(language => {
              const status = getLanguageStatus(language);
              const isSelected = selectedLanguages.includes(language);
              const isPriority = PRIORITY_LANGUAGES.includes(language as any);
              
              return (
                <Card key={language} className={`cursor-pointer transition-colors ${isSelected ? 'bg-blue-50 border-blue-200' : ''}`}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => handleLanguageSelection(language, checked as boolean)}
                        />
                        <div>
                          <h3 className="font-medium">{AVAILABLE_LANGUAGES[language]}</h3>
                          <p className="text-sm text-gray-500">{language}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        {isPriority && <Badge variant="secondary">Priority</Badge>}
                        {status.hasTemplate && <Badge variant="default">Template</Badge>}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Completion</span>
                        <span>{status.completion}%</span>
                      </div>
                      <Progress value={status.completion} className="h-2" />
                      
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>Missing: {status.missing}</span>
                        <span>Critical: {status.critical}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={handleCreatePlan}
              disabled={selectedLanguages.length === 0}
            >
              Create Implementation Plan ({selectedLanguages.length} languages)
            </Button>
          </div>
        </CardContent>
      </Card>

      {implementationPlan && (
        <Card>
          <CardHeader>
            <CardTitle>Implementation Plan</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{implementationPlan.targetLanguages.length}</div>
                <div className="text-sm text-gray-500">Languages</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{implementationPlan.estimatedFiles}</div>
                <div className="text-sm text-gray-500">Files to Create</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{implementationPlan.estimatedTranslations.toLocaleString()}</div>
                <div className="text-sm text-gray-500">Translations</div>
              </div>
              <div className="text-center">
                <Badge variant="outline" className="text-sm">
                  {implementationPlan.implementationStrategy}
                </Badge>
              </div>
            </div>

            <Alert>
              <AlertDescription>
                This implementation will create translation files for {implementationPlan.targetLanguages.length} languages 
                using the {implementationPlan.implementationStrategy} strategy. Languages with existing templates 
                will have higher completion rates initially.
              </AlertDescription>
            </Alert>

            <div className="space-y-2">
              <h4 className="font-medium">Priority Order:</h4>
              <div className="flex flex-wrap gap-2">
                {implementationPlan.priorityOrder.map((lang, index) => (
                  <Badge key={lang} variant={index < 5 ? "default" : "secondary"}>
                    {index + 1}. {AVAILABLE_LANGUAGES[lang]}
                  </Badge>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleImplementBatch}
              disabled={isImplementing}
              className="w-full"
            >
              {isImplementing ? "Implementing..." : "Start Batch Implementation"}
            </Button>
          </CardContent>
        </Card>
      )}

      {implementationResult && (
        <Card>
          <CardHeader>
            <CardTitle>Implementation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {implementationResult.summary.successfulImplementations}
                </div>
                <div className="text-sm text-gray-500">Successful</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {implementationResult.summary.totalFilesCreated}
                </div>
                <div className="text-sm text-gray-500">Files Created</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {implementationResult.summary.totalTranslationsAdded.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">Translations Added</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-600">
                  {Math.round((implementationResult.summary.successfulImplementations / implementationResult.summary.totalLanguages) * 100)}%
                </div>
                <div className="text-sm text-gray-500">Success Rate</div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="font-medium">Implementation Status:</h4>
              <div className="space-y-2">
                {implementationResult.results.map(result => (
                  <div key={result.language} className="flex items-center justify-between p-2 border rounded">
                    <div className="flex items-center space-x-2">
                      <Badge variant={result.success ? "default" : "destructive"}>
                        {result.success ? "✓" : "✗"}
                      </Badge>
                      <span>{AVAILABLE_LANGUAGES[result.language]}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      <span>{result.translationsAdded} translations</span>
                      <span>{result.completionPercentage}% complete</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  <strong>Next Steps:</strong>
                  {implementationResult.recommendations.map((rec, index) => (
                    <div key={index}>• {rec}</div>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BatchTranslationImplementer;
