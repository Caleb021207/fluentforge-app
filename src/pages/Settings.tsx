
import React, { useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { Shield } from "lucide-react";
import ParentalControls from "@/components/compliance/ParentalControls";
import { useNavigate } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const Settings = () => {
  const { t } = useLocalization();
  const navigate = useNavigate();
  
  return (
    <div className="container max-w-4xl mx-auto p-4 py-8">
      <h1 className="text-3xl font-bold mb-6">{t("settings")}</h1>
      
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center gap-2">
          <Shield size={20} className="text-primary" />
          <div>
            <CardTitle>{t("parentalControls")}</CardTitle>
            <CardDescription>{t("parentalControlsDescription")}</CardDescription>
          </div>
        </CardHeader>
      </Card>
      
      <div className="mt-4">
        <ParentalControls />
      </div>
    </div>
  );
};

export default Settings;
