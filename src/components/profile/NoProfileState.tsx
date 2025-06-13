
import { User } from "@supabase/supabase-js";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserCircle, Key } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import AccessCodeInput from "./AccessCodeInput";

interface NoProfileStateProps {
  user: User;
  onProfileUpdate: () => void;
}

const NoProfileState = ({ user, onProfileUpdate }: NoProfileStateProps) => {
  const { currentLanguage } = useLocalization();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <UserCircle className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">
            {currentLanguage === "spanish" ? "Configurar Perfil" : "Set Up Profile"}
          </h1>
          <p className="text-muted-foreground">
            {user.email}
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Welcome Message */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              {currentLanguage === "spanish" ? "Bienvenido" : "Welcome"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {currentLanguage === "spanish" 
                ? "Para comenzar, necesitas un código de acceso. Estos códigos son proporcionados por tu distrito, escuela o profesor."
                : "To get started, you need an access code. These codes are provided by your district, school, or teacher."
              }
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">
                {currentLanguage === "spanish" ? "Tipos de Códigos:" : "Code Types:"}
              </h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>DIST</strong> - {currentLanguage === "spanish" ? "Administrador de Distrito" : "District Administrator"}</li>
                <li>• <strong>SCH</strong> - {currentLanguage === "spanish" ? "Administrador de Escuela" : "School Administrator"}</li>
                <li>• <strong>TCH</strong> - {currentLanguage === "spanish" ? "Profesor" : "Teacher"}</li>
                <li>• <strong>CLS</strong> - {currentLanguage === "spanish" ? "Estudiante (Clase)" : "Student (Class)"}</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Access Code Input */}
        <AccessCodeInput 
          onCodeProcessed={onProfileUpdate}
        />
      </div>
    </div>
  );
};

export default NoProfileState;
