
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, Calendar, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

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

interface CodeCardProps {
  code: AccessCode;
  onCopyCode: (code: string) => void;
  onDeleteCode?: (codeId: string) => void;
}

const CodeCard = ({ code, onCopyCode, onDeleteCode }: CodeCardProps) => {
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

  return (
    <div className="border rounded-lg p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <code className="font-mono text-lg font-bold">{code.code}</code>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onCopyCode(code.code)}
          >
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={code.active ? "default" : "secondary"}>
            {code.active ? "Active" : "Inactive"}
          </Badge>
          {onDeleteCode && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Access Code</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete the code "{code.code}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDeleteCode(code.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>
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
  );
};

export default CodeCard;
