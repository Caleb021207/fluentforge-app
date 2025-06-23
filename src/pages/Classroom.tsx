
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";

const Classroom = () => {
  const { t } = useLocalization();

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
          <Users className="h-8 w-8 text-blue-600" />
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
        <CardContent className="pt-6">
          <p className="text-gray-600">{t("classroomFeaturesComingSoon")}</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Classroom;
