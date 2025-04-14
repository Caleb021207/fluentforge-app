
import React from 'react';
import { useParams } from 'react-router-dom';
import { useLocalization } from "@/context/LocalizationContext";

const StudyPage = () => {
  const { studyId } = useParams();
  const { t } = useLocalization();

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{t("studyMaterials")}</h1>
      <p>{t("studyIdIs", { id: studyId })}</p>
    </div>
  );
};

export default StudyPage;
