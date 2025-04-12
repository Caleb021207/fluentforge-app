
import React from 'react';
import { useParams } from 'react-router-dom';
import { useLocalization } from "@/context/LocalizationContext";

const StudyPage = () => {
  const { studyId } = useParams();
  const { t } = useLocalization();
  
  return (
    <div className="min-h-screen p-4">
      <h1 className="text-3xl font-bold mb-8">Study Page</h1>
      <p className="text-lg">Studying material ID: {studyId}</p>
    </div>
  );
};

export default StudyPage;
