import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";
import { useLocalization } from "@/hooks/useLocalization";

const UnauthenticatedProgress = () => {
  const { t } = useLocalization();
  
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center space-y-4 p-6">
        <h2 className="text-lg font-semibold">{t("trackYourProgress")}</h2>
        <p className="text-sm text-muted-foreground">{t("loginToTrack")}</p>
        <Button asChild>
          <a href="/login" className="flex items-center space-x-2">
            <LogIn className="h-4 w-4" />
            <span>{t("login")}</span>
          </a>
        </Button>
      </CardContent>
    </Card>
  );
};

export default UnauthenticatedProgress;

