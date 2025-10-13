import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CertificationCodeTester = () => {
  const [generatedCode, setGeneratedCode] = useState("");
  const [testCode, setTestCode] = useState("");
  const [verificationResult, setVerificationResult] = useState<any>(null);
  const [usageResult, setUsageResult] = useState<any>(null);
  const [studentName, setStudentName] = useState("Test Student");
  const [testType, setTestType] = useState("reading");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const generateTestCode = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('generate_access_code', {
        p_code_type: 'class',
        p_target_id: crypto.randomUUID(),
        p_target_name: 'Test Certification Class',
        p_max_uses: 3
      });

      if (error) throw error;
      
      setGeneratedCode(data);
      setTestCode(data);
      toast({
        title: "Code Generated",
        description: `Generated code: ${data}`,
      });
    } catch (error: any) {
      toast({
        title: "Error generating code",
        description: error.message,
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const verifyCode = async () => {
    if (!testCode) {
      toast({
        title: "Error",
        description: "Please enter a code to verify",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('verify-certification-code', {
        body: { code: testCode }
      });

      if (error) throw error;
      
      setVerificationResult(data);
      toast({
        title: "Verification Complete",
        description: data.valid ? "Code is valid!" : "Code is invalid",
        variant: data.valid ? "default" : "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error verifying code",
        description: error.message,
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  const recordUsage = async () => {
    if (!testCode) {
      toast({
        title: "Error",
        description: "Please enter a code to record usage for",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('record-certification-usage', {
        body: { 
          code: testCode,
          test_type: testType,
          student_info: { name: studentName }
        }
      });

      if (error) throw error;
      
      setUsageResult(data);
      toast({
        title: "Usage Recorded",
        description: data.success ? "Usage recorded successfully!" : "Failed to record usage",
        variant: data.success ? "default" : "destructive"
      });
    } catch (error: any) {
      toast({
        title: "Error recording usage",
        description: error.message,
        variant: "destructive"
      });
    }
    setIsLoading(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold">Certification Code System Tester</h1>
        <p className="text-muted-foreground mt-2">
          Test the end-to-end certification code verification and usage recording system
        </p>
      </div>

      {/* Step 1: Generate Test Code */}
      <Card>
        <CardHeader>
          <CardTitle>Step 1: Generate Test Code</CardTitle>
          <CardDescription>
            Generate a test certification code that can be used 3 times
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={generateTestCode} disabled={isLoading}>
            Generate Test Code
          </Button>
          {generatedCode && (
            <div className="mt-4 p-4 bg-green-50 rounded-lg">
              <Label className="text-sm font-medium">Generated Code:</Label>
              <div className="text-lg font-mono mt-1">{generatedCode}</div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Step 2: Test Code Verification */}
      <Card>
        <CardHeader>
          <CardTitle>Step 2: Verify Certification Code</CardTitle>
          <CardDescription>
            Test the verify-certification-code edge function (simulates palavoxcert.org checking)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="testCode">Code to Test</Label>
            <Input
              id="testCode"
              value={testCode}
              onChange={(e) => setTestCode(e.target.value)}
              placeholder="Enter code to verify"
            />
          </div>
          <Button onClick={verifyCode} disabled={isLoading}>
            Verify Code
          </Button>
          
          {verificationResult && (
            <div className={`mt-4 p-4 rounded-lg ${verificationResult.valid ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={verificationResult.valid ? "default" : "destructive"}>
                  {verificationResult.valid ? "VALID" : "INVALID"}
                </Badge>
              </div>
              <div className="text-sm space-y-1">
                <div><strong>Message:</strong> {verificationResult.message}</div>
                {verificationResult.remaining_uses !== undefined && (
                  <div><strong>Remaining Uses:</strong> {verificationResult.remaining_uses}</div>
                )}
                {verificationResult.expires_at && (
                  <div><strong>Expires:</strong> {new Date(verificationResult.expires_at).toLocaleString()}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Separator />

      {/* Step 3: Record Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Step 3: Record Certification Usage</CardTitle>
          <CardDescription>
            Test the record-certification-usage edge function (simulates palavoxcert.org recording test completion)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="studentName">Student Name</Label>
              <Input
                id="studentName"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                placeholder="Student name"
              />
            </div>
            <div>
              <Label htmlFor="testType">Test Type</Label>
              <select
                id="testType"
                value={testType}
                onChange={(e) => setTestType(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="reading">Reading</option>
                <option value="writing">Writing</option>
                <option value="speaking">Speaking</option>
                <option value="listening">Listening</option>
              </select>
            </div>
          </div>
          
          <Button onClick={recordUsage} disabled={isLoading}>
            Record Test Usage
          </Button>
          
          {usageResult && (
            <div className={`mt-4 p-4 rounded-lg ${usageResult.success ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="flex items-center gap-2 mb-2">
                <Badge variant={usageResult.success ? "default" : "destructive"}>
                  {usageResult.success ? "SUCCESS" : "FAILED"}
                </Badge>
              </div>
              <div className="text-sm space-y-1">
                <div><strong>Message:</strong> {usageResult.message}</div>
                {usageResult.remaining_uses !== undefined && (
                  <div><strong>Remaining Uses:</strong> {usageResult.remaining_uses}</div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Usage Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>How to Test</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal pl-6 space-y-2 text-sm">
            <li>Click "Generate Test Code" to create a new certification code</li>
            <li>Use "Verify Code" to test if the code is valid (simulates palavoxcert.org checking before test)</li>
            <li>Use "Record Test Usage" to simulate a student completing a test (decrements remaining uses)</li>
            <li>Try verifying again to see the updated remaining uses</li>
            <li>Record usage 3 times to exhaust the code, then verify to see it's no longer valid</li>
          </ol>
          
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <h4 className="font-semibold mb-2">Edge Function URLs for palavoxcert.org:</h4>
            <div className="text-sm font-mono space-y-1">
              <div>Verify: https://dukpljcweixxmpkiblwo.supabase.co/functions/v1/verify-certification-code</div>
              <div>Record: https://dukpljcweixxmpkiblwo.supabase.co/functions/v1/record-certification-usage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CertificationCodeTester;