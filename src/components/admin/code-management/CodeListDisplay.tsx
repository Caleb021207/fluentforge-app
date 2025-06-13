
import { Badge } from "@/components/ui/badge";
import CodeCard from "./CodeCard";

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

interface CodeListDisplayProps {
  codes: AccessCode[];
  isLoading: boolean;
  onCopyCode: (code: string) => void;
}

const CodeListDisplay = ({ codes, isLoading, onCopyCode }: CodeListDisplayProps) => {
  if (isLoading) {
    return <p>Loading codes...</p>;
  }

  if (codes.length === 0) {
    return <p className="text-muted-foreground">No codes generated yet.</p>;
  }

  return (
    <div className="space-y-3">
      {codes.map((code) => (
        <CodeCard 
          key={code.id} 
          code={code} 
          onCopyCode={onCopyCode} 
        />
      ))}
    </div>
  );
};

export default CodeListDisplay;
