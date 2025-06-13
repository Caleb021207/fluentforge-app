
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Copy, Shield } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { createDistrictAdminCode } from "@/utils/adminUtils";

const DevCodeGenerator = () => {
  const [districtName, setDistrictName] = useState("Palavox District");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCode, setGeneratedCode] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateCode = async () => {
    setIsGenerating(true);
    try {
      const result = await createDistrictAdminCode(districtName);
      
      if (result.success && result.code) {
        setGeneratedCode(result.code);
        toast({
          title: "District Admin Code Generated",
          description: `Code: ${result.code} - Give this to caleb@palavox.org`,
        });
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate district admin code",
        variant: "destructive"
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast({
      title: "Copied",
      description: `Code ${code} copied to clipboard`,
    });
  };

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <Shield className="h-5 w-5" />
          Dev Tool: District Admin Code Generator
        </CardTitle>
        <p className="text-sm text-orange-600">
          Generate a district admin code for caleb@palavox.org
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="districtName">District Name</Label>
          <Input
            id="districtName"
            value={districtName}
            onChange={(e) => setDistrictName(e.target.value)}
            placeholder="Enter district name"
          />
        </div>

        <Button 
          onClick={handleGenerateCode}
          disabled={isGenerating || !districtName.trim()}
          className="w-full"
        >
          {isGenerating ? "Generating..." : "Generate District Admin Code"}
        </Button>

        {generatedCode && (
          <div className="p-4 bg-white border border-orange-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Generated Code:</p>
                <code className="font-mono text-lg font-bold text-orange-800">
                  {generatedCode}
                </code>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => copyToClipboard(generatedCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Give this code to caleb@palavox.org to use in their profile access code section
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default DevCodeGenerator;
