
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus, Users, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAccessCode, getUserAccessCodes } from "@/utils/accessCodeUtils";
import { useLocalization } from "@/context/LocalizationContext";
import CodeGenerationForm from "./code-management/CodeGenerationForm";
import CodeListDisplay from "./code-management/CodeListDisplay";
import { supabase } from "@/integrations/supabase/client";

interface AccessCode {
  id: string;
  code: string;
  code_type: string;
  target_name: string;
  expires_at: string | null;
  max_uses: number | null;
  current_uses: number;
  active: boolean;
  created_at: string;
}

interface CodeManagementProps {
  userRole: string;
  userSchool?: string;
}

const CodeManagement = ({ userRole, userSchool }: CodeManagementProps) => {
  const [codes, setCodes] = useState<AccessCode[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [showCodes, setShowCodes] = useState(false);
  
  const { toast } = useToast();
  const { currentLanguage } = useLocalization();

  useEffect(() => {
    loadCodes();
  }, []);

  const loadCodes = async () => {
    setIsLoading(true);
    try {
      const userCodes = await getUserAccessCodes();
      setCodes(userCodes);
    } catch (error) {
      console.error('Error loading codes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getAvailableCodeTypes = () => {
    switch (userRole) {
      case 'district':
        return [
          { value: 'district', label: 'District Admin' },
          { value: 'school', label: 'School Admin' }
        ];
      case 'admin':
        return [
          { value: 'teacher', label: 'Teacher' },
          { value: 'class', label: 'Class' }
        ];
      case 'teacher':
        return [
          { value: 'class', label: 'Class' }
        ];
      default:
        return [];
    }
  };

  const handleGenerateCode = async (
    codeType: string,
    targetName: string,
    expiresAt: string,
    maxUses: string
  ) => {
    if (!codeType || !targetName) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateAccessCode(
        codeType as any,
        crypto.randomUUID(),
        targetName,
        expiresAt || undefined,
        maxUses ? parseInt(maxUses) : undefined
      );

      if (result.success && result.code) {
        toast({
          title: "Success",
          description: result.message,
        });
        
        setShowForm(false);
        loadCodes();
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error generating code:', error);
      toast({
        title: "Error",
        description: "Failed to generate access code",
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

  const handleDeleteCode = async (codeId: string) => {
    try {
      const { error } = await supabase
        .from('access_codes')
        .delete()
        .eq('id', codeId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Access code deleted successfully",
      });
      
      loadCodes();
    } catch (error) {
      console.error('Error deleting code:', error);
      toast({
        title: "Error",
        description: "Failed to delete access code",
        variant: "destructive"
      });
    }
  };

  const availableTypes = getAvailableCodeTypes();

  if (availableTypes.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Access Code Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            You don't have permission to generate access codes.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="h-5 w-5" />
          Access Code Management
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Generate access codes to assign roles to users in your organization
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Generate New Code
          </Button>
          <Button 
            variant="outline"
            onClick={() => setShowCodes(!showCodes)}
            className="flex items-center gap-2"
          >
            {showCodes ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showCodes ? 'Hide' : 'View'} My Codes
          </Button>
        </div>

        {showForm && (
          <CodeGenerationForm
            availableTypes={availableTypes}
            onGenerateCode={handleGenerateCode}
            isGenerating={isGenerating}
            onCancel={() => setShowForm(false)}
          />
        )}

        {showCodes && (
          <div className="space-y-4">
            <h3 className="font-medium">Your Generated Codes</h3>
            <CodeListDisplay
              codes={codes}
              isLoading={isLoading}
              onCopyCode={copyToClipboard}
              onDeleteCode={handleDeleteCode}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default CodeManagement;
