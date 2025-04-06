
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateTranslationsWithAI, formatTranslationsAsTypeScript } from '@/utils/translationGenerator';
import { AVAILABLE_LANGUAGES } from '@/translations';
import { generateLanguageImplementationChecklist } from '@/utils/languageTemplateExporter';

const LanguageAdminTools = () => {
  const [sourceLanguage, setSourceLanguage] = useState('english');
  const [targetLanguage, setTargetLanguage] = useState('');
  const [customTargetLanguage, setCustomTargetLanguage] = useState('');
  const [translationInput, setTranslationInput] = useState('');
  const [translationOutput, setTranslationOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [checklist, setChecklist] = useState<string[]>([]);
  const { toast } = useToast();

  const handleGenerateTranslation = async () => {
    if (!sourceLanguage || !targetLanguage && !customTargetLanguage) {
      toast({
        title: 'Missing Languages',
        description: 'Please select both source and target languages',
        variant: 'destructive',
      });
      return;
    }

    if (!translationInput) {
      toast({
        title: 'Missing Content',
        description: 'Please enter some text to translate',
        variant: 'destructive',
      });
      return;
    }

    setIsGenerating(true);

    try {
      // Parse the input as JSON
      let translationsObject: Record<string, string> = {};
      
      try {
        translationsObject = JSON.parse(translationInput);
      } catch (e) {
        // If not valid JSON, try to parse as key:value pairs
        const lines = translationInput.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          const match = line.match(/^(.+?):(.+)$/);
          if (match) {
            const key = match[1].trim();
            const value = match[2].trim().replace(/^['"](.*)['"]$/, '$1');
            translationsObject[key] = value;
          }
        });
      }

      if (Object.keys(translationsObject).length === 0) {
        throw new Error('Could not parse input as valid translation data');
      }

      const finalTargetLanguage = targetLanguage || customTargetLanguage;
      
      const result = await generateTranslationsWithAI({
        sourceLanguage,
        targetLanguage: finalTargetLanguage,
        translations: translationsObject,
      });

      if (!result.success || !result.translations) {
        throw new Error(result.error || 'Translation failed');
      }

      // Format the result as TypeScript code
      const formattedOutput = formatTranslationsAsTypeScript(result.translations);
      setTranslationOutput(formattedOutput);

      toast({
        title: 'Translation Generated',
        description: `Successfully translated to ${finalTargetLanguage}`,
      });

      // Generate a checklist
      setChecklist(generateLanguageImplementationChecklist(finalTargetLanguage));
    } catch (error) {
      console.error('Translation generation error:', error);
      toast({
        title: 'Translation Error',
        description: error.message || 'Failed to generate translations',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Language Management Tools</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label htmlFor="sourceLanguage">Source Language</Label>
              <Select
                value={sourceLanguage}
                onValueChange={setSourceLanguage}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select source language" />
                </SelectTrigger>
                <SelectContent>
                  {Object.keys(AVAILABLE_LANGUAGES).map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {AVAILABLE_LANGUAGES[lang as keyof typeof AVAILABLE_LANGUAGES]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="targetLanguage">Target Language</Label>
              <Select
                value={targetLanguage}
                onValueChange={setTargetLanguage}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select target language" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Custom Language...</SelectItem>
                  {Object.keys(AVAILABLE_LANGUAGES).map(lang => (
                    <SelectItem key={lang} value={lang}>
                      {AVAILABLE_LANGUAGES[lang as keyof typeof AVAILABLE_LANGUAGES]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {targetLanguage === "" && (
                <div className="mt-3">
                  <Label htmlFor="customLanguage">Custom Language Name</Label>
                  <Input
                    id="customLanguage"
                    value={customTargetLanguage}
                    onChange={(e) => setCustomTargetLanguage(e.target.value)}
                    placeholder="e.g. turkish"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            <Label htmlFor="translationInput">Translation Input (JSON or key:value pairs)</Label>
            <Textarea
              id="translationInput"
              className="font-mono h-40"
              value={translationInput}
              onChange={(e) => setTranslationInput(e.target.value)}
              placeholder='{"welcome": "Welcome", "hello": "Hello"}'
            />
          </div>

          <Button 
            className="mt-4" 
            onClick={handleGenerateTranslation} 
            disabled={isGenerating}
          >
            {isGenerating ? 'Generating...' : 'Generate Translation'}
          </Button>

          {translationOutput && (
            <div className="mt-6">
              <Label htmlFor="translationOutput">Generated Translation</Label>
              <Textarea
                id="translationOutput"
                className="font-mono h-60"
                value={translationOutput}
                readOnly
              />
              <Button 
                variant="outline" 
                className="mt-2"
                onClick={() => navigator.clipboard.writeText(translationOutput)}
              >
                Copy to Clipboard
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {checklist.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Implementation Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-2">
              {checklist.map((item, index) => (
                <li key={index} className="text-gray-700">{item}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default LanguageAdminTools;
