
import React from 'react';
import { useLocalization } from "@/context/LocalizationContext";
import JoinClassForm from "@/components/classroom/JoinClassForm";
import StudentClassView from "@/components/classroom/StudentClassView";

const StudentClass = () => {
  const { t } = useLocalization();

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-8">{t("myClass")}</h1>
      <StudentClassView />
      <JoinClassForm />
    </div>
  );
};

export default StudentClass;
