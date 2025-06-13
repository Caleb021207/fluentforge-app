import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Copy, Plus, Calendar, Users, Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { generateAccessCode, getUserAccessCodes } from "@/utils/accessCodeUtils";
import { useLocalization } from "@/context/LocalizationContext";
import DevCodeGenerator from "./DevCodeGenerator";

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
  
  // Form state
  const [codeType, setCodeType] = useState("");
  const [targetName, setTargetName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");
  
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

  const handleGenerateCode = async () => {
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
        crypto.randomUUID(), // For now, using a random UUID as target_id
        targetName,
        expiresAt || undefined,
        maxUses ? parseInt(maxUses) : undefined
      );

      if (result.success && result.code) {
        toast({
          title: "Success",
          description: result.message,
        });
        
        // Reset form
        setCodeType("");
        setTargetName("");
        setExpiresAt("");
        setMaxUses("");
        setShowForm(false);
        
        // Reload codes
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getCodeTypeDisplay = (type: string) => {
    switch (type) {
      case 'district': return 'District Admin';
      case 'school': return 'School Admin';
      case 'teacher': return 'Teacher';
      case 'class': return 'Class';
      default: return type;
    }
  };

  const availableTypes = getAvailableCodeTypes();

  if (availableTypes.length === 0) {
    return (
      <div className="space-y-6">
        {/* Dev Tool for generating district codes */}
        <DevCodeGenerator />
        
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
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Dev Tool for generating district codes */}
      <DevCodeGenerator />
      
      {/* Access Code Management */}
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
            <div className="border rounded-lg p-4 space-y-4">
              <h3 className="font-medium">Generate New Access Code</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="codeType">Code Type</Label>
                  <Select value={codeType} onValueChange={setCodeType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select code type" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="targetName">
                    {codeType === 'district' ? 'District Name' :
                     codeType === 'school' ? 'School Name' :
                     codeType === 'teacher' ? 'School Name' :
                     codeType === 'class' ? 'Class Name' : 'Name'}
                  </Label>
                  <Input
                    id="targetName"
                    value={targetName}
                    onChange={(e) => setTargetName(e.target.value)}
                    placeholder={`Enter ${codeType || 'target'} name`}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expiresAt">Expiration Date (Optional)</Label>
                  <Input
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxUses">Max Uses (Optional)</Label>
                  <Input
                    id="maxUses"
                    type="number"
                    value={maxUses}
                    onChange={(e) => setMaxUses(e.target.value)}
                    placeholder="Leave empty for unlimited"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleGenerateCode}
                  disabled={isGenerating || !codeType || !targetName}
                  className="flex items-center gap-2"
                >
                  {isGenerating ? "Generating..." : "Generate Code"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {showCodes && (
            <div className="space-y-4">
              <h3 className="font-medium">Your Generated Codes</h3>
              {isLoading ? (
                <p>Loading codes...</p>
              ) : codes.length === 0 ? (
                <p className="text-muted-foreground">No codes generated yet.</p>
              ) : (
                <div className="space-y-3">
                  {codes.map((code) => (
                    <div key={code.id} className="border rounded-lg p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-lg font-bold">{code.code}</code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => copyToClipboard(code.code)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <Badge variant={code.active ? "default" : "secondary"}>
                          {code.active ? "Active" : "Inactive"}
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Type:</span>
                          <p className="font-medium">{getCodeTypeDisplay(code.code_type)}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Target:</span>
                          <p className="font-medium">{code.target_name}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Uses:</span>
                          <p className="font-medium">
                            {code.current_uses}{code.max_uses ? ` / ${code.max_uses}` : ' / ∞'}
                          </p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Created:</span>
                          <p className="font-medium">{formatDate(code.created_at)}</p>
                        </div>
                      </div>

                      {code.expires_at && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          Expires: {formatDate(code.expires_at)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CodeManagement;
