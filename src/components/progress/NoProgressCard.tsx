
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLocalization } from "@/context/LocalizationContext";
import { useClassroom } from "@/hooks/useClassroom";
import { CreateClassForm } from "@/components/classroom/CreateClassForm";
import { JoinClassForm } from "@/components/classroom/JoinClassForm";

const NoProgressCard = () => {
  const { t } = useLocalization();
  const { isTeacher, createClassroom, joinClassroom } = useClassroom();
  
  return (
    <Card className="border border-dashed border-gray-300 bg-gray-50">
      <CardContent className="text-center py-12">
        <p className="text-lg text-gray-600 mb-6">
          {isTeacher ? t("createFirstClassToSeeProgress") : t("joinClassToSeeProgress")}
        </p>

        {isTeacher ? (
          <CreateClassForm onCreate={createClassroom} />
        ) : (
          <JoinClassForm onJoin={joinClassroom} />
        )}
      </CardContent>
    </Card>
  );
};

export default NoProgressCard;
