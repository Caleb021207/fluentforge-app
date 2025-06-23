
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
  const { t } = useLocalization();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <UserCircle className="h-8 w-8" />
        <div>
          <h1 className="text-3xl font-bold">
            {t("setUpProfile")}
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
              {t("welcome")}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t("accessCodeInstructions")}
            </p>
            
            <div className="bg-muted p-4 rounded-lg">
              <h4 className="font-medium mb-2">
                {t("codeTypes")}
              </h4>
              <ul className="text-sm space-y-1">
                <li>• <strong>DIST</strong> - {t("districtAdmin")}</li>
                <li>• <strong>SCH</strong> - {t("schoolAdministrator")}</li>
                <li>• <strong>TCH</strong> - {t("teacher")}</li>
                <li>• <strong>CLS</strong> - {t("studentClass")}</li>
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
