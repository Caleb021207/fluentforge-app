
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const Classroom = () => {
  const { t } = useLocalization();

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-6 w-6 text-primary" />
          {t("classManagement")}
        </h1>
        <p className="text-gray-600">
          {t("manageClassesAndTrackProgress")}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("classroomFeatures")}</CardTitle>
          <CardDescription>
            {t("createAndManageVirtualClassrooms")}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <p className="text-gray-600">{t("classroomFeaturesComingSoon")}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Classroom;
