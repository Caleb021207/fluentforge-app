
import React, { useState, useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { generateTestAccessCodes, checkAdminAccess } from "@/utils/testUtils";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, AlertTriangle, Copy, Check } from "lucide-react";
import AdminLogger from "@/components/debug/AdminLogger";

interface GeneratedCodes {
  tier2Codes: string[];
  tier3Codes: string[];
  tier4Codes: string[];
  tier5Codes: string[];
}

const TestTiers = () => {
  const { t } = useLocalization();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [codes, setCodes] = useState<GeneratedCodes | null>(null);
  const [copied, setCopied] = useState<{[key: string]: boolean}>({});

  useEffect(() => {
    const checkAccess = async () => {
      setIsLoading(true);
      const hasAccess = await checkAdminAccess();
      setIsAdmin(hasAccess);
      setIsLoading(false);
    };
    
    checkAccess();
  }, []);

  const handleGenerateCodes = async () => {
    setIsGenerating(true);
    try {
      const generatedCodes = await generateTestAccessCodes(2); // Generate 2 codes per tier
      setCodes(generatedCodes);
      
      toast({
        title: "Success",
        description: "Test access codes generated successfully",
      });
    } catch (error) {
      console.error("Error generating test codes:", error);
      toast({
        title: "Error",
        description: "Failed to generate test access codes",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(prev => ({ ...prev, [code]: true }));
    
    setTimeout(() => {
      setCopied(prev => ({ ...prev, [code]: false }));
    }, 2000);
    
    toast({
      title: "Copied",
      description: "Access code copied to clipboard",
    });
  };

  if (isLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-4 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lingua-primary"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="container max-w-4xl mx-auto p-4">
        <Card>
          <CardHeader>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>You need administrator access to view this page</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="h-5 w-5" />
              <p>This page is only available to administrators for testing purposes.</p>
            </div>
          </CardContent>
        </Card>
        
        {/* Add the debug logger in development mode */}
        <AdminLogger />
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6">Tier System Testing</h1>
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Generate Test Access Codes</CardTitle>
          <CardDescription>Generate test access codes for all tier levels</CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleGenerateCodes} 
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Generating Codes...
              </>
            ) : (
              "Generate Test Codes"
            )}
          </Button>
          
          {codes && (
            <div className="mt-6 space-y-4">
              {Object.entries(codes).map(([tierKey, codesList]) => (
                <div key={tierKey} className="border rounded-md p-3">
                  <h3 className="font-medium mb-2">{tierKey.replace(/([A-Z])/g, ' $1').trim()} Codes</h3>
                  <div className="space-y-2">
                    {codesList.map((code, index) => (
                      <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                        <div className="font-mono">{code}</div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(code)}
                        >
                          {copied[code] ? (
                            <Check className="h-4 w-4 text-green-500" />
                          ) : (
                            <Copy className="h-4 w-4" />
                          )}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
        <CardFooter className="text-xs text-gray-500 flex flex-col items-start space-y-2">
          <p>Use these codes to test the tier system by redeeming them on different accounts.</p>
          <p>Tier 2: 10 minutes/week | Tier 3: 20 minutes/week | Tier 4: 30 minutes/week | Tier 5: 60 minutes/week</p>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Testing Instructions</CardTitle>
          <CardDescription>How to test the tiered system</CardDescription>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-5 space-y-2">
            <li>Create multiple test accounts using different email addresses</li>
            <li>Use the generated access codes to upgrade accounts to different tiers</li>
            <li>Test premium voice chat access and verify time limits:
              <ul className="list-disc pl-5 mt-1">
                <li>Tier 2: 10 minutes per week</li>
                <li>Tier 3: 20 minutes per week</li>
                <li>Tier 4: 30 minutes per week</li>
                <li>Tier 5: 60 minutes per week</li>
              </ul>
            </li>
            <li>Verify that cooldown periods are correctly applied after the time limit is reached</li>
            <li>Test that the weekly reset occurs correctly at the configured time</li>
          </ol>
        </CardContent>
      </Card>
      
      {/* Add the debug logger in development mode */}
      <AdminLogger />
    </div>
  );
};

export default TestTiers;
