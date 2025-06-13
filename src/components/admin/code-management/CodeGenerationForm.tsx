
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";

interface CodeType {
  value: string;
  label: string;
}

interface CodeGenerationFormProps {
  availableTypes: CodeType[];
  onGenerateCode: (
    codeType: string,
    targetName: string,
    expiresAt: string,
    maxUses: string
  ) => Promise<void>;
  isGenerating: boolean;
  onCancel: () => void;
}

const CodeGenerationForm = ({
  availableTypes,
  onGenerateCode,
  isGenerating,
  onCancel
}: CodeGenerationFormProps) => {
  const [codeType, setCodeType] = useState("");
  const [targetName, setTargetName] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");

  const handleSubmit = async () => {
    await onGenerateCode(codeType, targetName, expiresAt, maxUses);
    // Reset form on success
    setCodeType("");
    setTargetName("");
    setExpiresAt("");
    setMaxUses("");
  };

  const getTargetLabel = (type: string) => {
    switch (type) {
      case 'district': return 'District Name';
      case 'school': return 'School Name';
      case 'teacher': return 'School Name';
      case 'class': return 'Class Name';
      default: return 'Name';
    }
  };

  return (
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
            {getTargetLabel(codeType)}
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
          onClick={handleSubmit}
          disabled={isGenerating || !codeType || !targetName}
          className="flex items-center gap-2"
        >
          {isGenerating ? "Generating..." : (
            <>
              <Plus className="h-4 w-4" />
              Generate Code
            </>
          )}
        </Button>
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default CodeGenerationForm;
