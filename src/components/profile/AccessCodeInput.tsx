
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Key, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { processAccessCode } from "@/utils/accessCodeUtils";
import { useLocalization } from "@/context/LocalizationContext";

interface AccessCodeInputProps {
  onCodeProcessed: () => void;
  currentRole?: string;
  currentAssignment?: string;
}

const AccessCodeInput = ({ onCodeProcessed, currentRole, currentAssignment }: AccessCodeInputProps) => {
  const [code, setCode] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { t } = useLocalization();

  const handleProcessCode = async () => {
    if (!code.trim()) {
      toast({
        title: t("error"),
        description: t("pleaseEnterAccessCode"),
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      console.log('Processing access code:', code);
      const result = await processAccessCode(code);
      console.log('Access code result:', result);
      
      if (result.success) {
        toast({
          title: t("success"),
          description: result.message,
        });
        setCode("");
        
        console.log('Access code processed successfully, triggering profile update...');
        
        // Force a full page reload to ensure all data refreshes
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast({
          title: t("error"),
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing code:', error);
      toast({
        title: t("error"),
        description: t("failedToProcessAccessCode"),
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'student': return t("student");
      case 'teacher': return t("teacher");
      case 'admin': return t("administrator");
      case 'district': return t("districtAdmin");
      default: return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          {t("accessCode")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        {currentRole && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {t("currentStatus")}
            </Label>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <Badge variant="default">{getRoleDisplay(currentRole)}</Badge>
              {currentAssignment && (
                <span className="text-sm text-muted-foreground">{t("at")} {currentAssignment}</span>
              )}
            </div>
          </div>
        )}

        {/* Code Input */}
        <div className="space-y-2">
          <Label htmlFor="accessCode">
            {t("enterCode")}
          </Label>
          <div className="flex gap-2">
            <Input
              id="accessCode"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={t("accessCodeExample")}
              disabled={isProcessing}
              className="font-mono"
              maxLength={10}
            />
            <Button 
              onClick={handleProcessCode}
              disabled={isProcessing || !code.trim()}
              size="default"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("processing")}
                </>
              ) : (
                t("apply")
              )}
            </Button>
          </div>
        </div>

        {/* Code Type Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">
            {t("codeTypes")}:
          </p>
          <div className="grid grid-cols-2 gap-1">
            <span>• DIST - {t("district")}</span>
            <span>• SCH - {t("school")}</span>
            <span>• TCH - {t("teacher")}</span>
            <span>• CLS - {t("studentClass")}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessCodeInput;
