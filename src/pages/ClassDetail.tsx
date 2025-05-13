
import React from 'react';
import { useParams } from 'react-router-dom';
import { useLocalization } from "@/context/LocalizationContext";
import { CLASSROOM_TEXT } from "@/constants/classroomText";
import ClassStudentsList from "@/components/classroom/ClassStudentsList";
import ClassDetailHeader from '@/components/classroom/ClassDetailHeader';
import ClassDetailCard from '@/components/classroom/ClassDetailCard';
import LoadingClassDetail from '@/components/classroom/LoadingClassDetail';
import { useClassDetail } from '@/hooks/useClassDetail';

const ClassDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useLocalization();
  
  const {
    classData,
    isLoading,
    showStudentsList,
    setShowStudentsList,
    handleBackClick,
    isTeacher
  } = useClassDetail(id, t);

  if (isLoading) {
    return <LoadingClassDetail loadingText={t("loading") || "Loading"} />;
  }

  if (!classData) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <div className="text-center py-8">
          <p className="text-2xl text-muted-foreground">{t("classNotFound") || "Class not found"}</p>
          <ClassDetailHeader 
            onBackClick={handleBackClick} 
            backText={t("backToClasses") || "Back to Classes"} 
          />
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-4xl mx-auto p-6">
      <ClassDetailHeader 
        onBackClick={handleBackClick} 
        backText={t("backToClasses") || "Back to Classes"} 
      />
      
      <ClassDetailCard 
        classData={classData}
        isTeacher={isTeacher}
        translateFn={t}
        onViewStudents={() => setShowStudentsList(true)}
        classCodeLabel={CLASSROOM_TEXT.CLASS_CODE}
        createdLabel={t("created") || "Created"}
      />

      {isTeacher && (
        <ClassStudentsList
          classId={classData.id}
          className={classData.class_name}
          open={showStudentsList}
          onOpenChange={setShowStudentsList}
        />
      )}
    </div>
  );
};

export default ClassDetail;
