import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    maxUses: string,
    targetId?: string,
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
  const [targetClassId, setTargetClassId] = useState("");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");

  // Class codes must point at a real class row (process_access_code enrolls
  // into classes(id)), so the creator picks one of their own classes.
  const { data: myClasses } = useQuery({
    queryKey: ["code-form-classes"],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];
      const { data } = await supabase
        .from("classes")
        .select("id, name")
        .eq("teacher_id", user.id)
        .order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: codeType === "class",
  });

  const handleSubmit = async () => {
    if (codeType === "class") {
      const cls = (myClasses ?? []).find((c) => c.id === targetClassId);
      if (!cls) return;
      await onGenerateCode(codeType, cls.name, expiresAt, maxUses, cls.id);
    } else {
      await onGenerateCode(codeType, targetName, expiresAt, maxUses);
    }
    // Reset form on success
    setCodeType("");
    setTargetName("");
    setTargetClassId("");
    setExpiresAt("");
    setMaxUses("");
  };

  const getTargetLabel = (type: string) => {
    switch (type) {
      case 'district': return 'District Name';
      case 'school': return 'School Name';
      case 'teacher': return 'School Name';
      case 'class': return 'Class';
      default: return 'Name';
    }
  };

  const submitDisabled =
    isGenerating || !codeType || (codeType === "class" ? !targetClassId : !targetName);

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
          <Label htmlFor="targetName">{getTargetLabel(codeType)}</Label>
          {codeType === "class" ? (
            <Select value={targetClassId} onValueChange={setTargetClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select one of your classes" />
              </SelectTrigger>
              <SelectContent>
                {(myClasses ?? []).map((cls) => (
                  <SelectItem key={cls.id} value={cls.id}>
                    {cls.name}
                  </SelectItem>
                ))}
                {(myClasses ?? []).length === 0 && (
                  <SelectItem value="__none__" disabled>
                    No classes yet — create one first
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
          ) : (
            <Input
              id="targetName"
              value={targetName}
              onChange={(e) => setTargetName(e.target.value)}
              placeholder={`Enter ${codeType || 'target'} name`}
            />
          )}
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
          disabled={submitDisabled}
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
