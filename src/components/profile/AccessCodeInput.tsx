
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Key, CheckCircle, AlertCircle } from "lucide-react";
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
  const { currentLanguage } = useLocalization();

  const handleProcessCode = async () => {
    if (!code.trim()) {
      toast({
        title: "Error",
        description: "Please enter an access code",
        variant: "destructive"
      });
      return;
    }

    setIsProcessing(true);
    try {
      const result = await processAccessCode(code);
      
      if (result.success) {
        toast({
          title: "Success",
          description: result.message,
        });
        setCode("");
        
        // Add a small delay to ensure the database has been updated
        setTimeout(() => {
          onCodeProcessed();
        }, 1000);
      } else {
        toast({
          title: "Error",
          description: result.message,
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error processing code:', error);
      toast({
        title: "Error",
        description: "Failed to process access code. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const getRoleDisplay = (role: string) => {
    switch (role) {
      case 'student': return currentLanguage === "spanish" ? "Estudiante" : "Student";
      case 'teacher': return currentLanguage === "spanish" ? "Profesor" : "Teacher";
      case 'admin': return currentLanguage === "spanish" ? "Administrador" : "Administrator";
      case 'district': return currentLanguage === "spanish" ? "Distrito" : "District Admin";
      default: return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          {currentLanguage === "spanish" ? "Código de Acceso" : "Access Code"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Current Status */}
        {currentRole && (
          <div className="space-y-2">
            <Label className="text-sm font-medium">
              {currentLanguage === "spanish" ? "Estado Actual" : "Current Status"}
            </Label>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <Badge variant="default">{getRoleDisplay(currentRole)}</Badge>
              {currentAssignment && (
                <span className="text-sm text-muted-foreground">at {currentAssignment}</span>
              )}
            </div>
          </div>
        )}

        {/* Code Input */}
        <div className="space-y-2">
          <Label htmlFor="accessCode">
            {currentLanguage === "spanish" ? "Ingresa Código" : "Enter Code"}
          </Label>
          <div className="flex gap-2">
            <Input
              id="accessCode"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder={currentLanguage === "spanish" ? "Ej: DIST123456" : "e.g., DIST123456"}
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
                  {currentLanguage === "spanish" ? "Procesando..." : "Processing..."}
                </>
              ) : (
                currentLanguage === "spanish" ? "Aplicar" : "Apply"
              )}
            </Button>
          </div>
        </div>

        {/* Code Type Info */}
        <div className="text-xs text-muted-foreground space-y-1">
          <p className="font-medium">
            {currentLanguage === "spanish" ? "Tipos de Código:" : "Code Types:"}
          </p>
          <div className="grid grid-cols-2 gap-1">
            <span>• DIST - {currentLanguage === "spanish" ? "Distrito" : "District"}</span>
            <span>• SCH - {currentLanguage === "spanish" ? "Escuela" : "School"}</span>
            <span>• TCH - {currentLanguage === "spanish" ? "Profesor" : "Teacher"}</span>
            <span>• CLS - {currentLanguage === "spanish" ? "Clase" : "Class"}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccessCodeInput;
