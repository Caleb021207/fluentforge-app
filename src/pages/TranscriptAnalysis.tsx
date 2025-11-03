import React from "react";
import { Brain, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { useTeacherStatus } from "@/hooks/useTeacherStatus";
import TeacherAnalysisView from "@/components/teacher/TeacherAnalysisView";
import StudentAnalysisView from "@/components/student/StudentAnalysisView";

const TranscriptAnalysis = () => {
  const { isTeacher, isLoading } = useTeacherStatus();

  if (isLoading) {
    return (
      <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10 flex items-center justify-center">
        <p className="text-muted-foreground">Loading...</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <div className="max-w-6xl mx-auto p-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 text-center"
        >
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text flex items-center justify-center gap-3">
            <Brain className="h-10 w-10 md:h-12 md:h-12 text-primary" />
            AI Progress Analysis
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground flex items-center justify-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            {isTeacher 
              ? "Track your students' learning journey and your own progress"
              : "Upload your language test transcripts and get AI-powered insights to accelerate your learning progress"
            }
          </p>
        </motion.div>

        {isTeacher ? <TeacherAnalysisView /> : <StudentAnalysisView />}
      </div>
    </div>
  );
};

export default TranscriptAnalysis;
