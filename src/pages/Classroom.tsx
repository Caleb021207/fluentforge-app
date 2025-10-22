import React from 'react';
import { InteractiveCard } from "@/components/ui/card";
import { Users } from "lucide-react";
import { useLocalization } from "@/context/LocalizationContext";
import { GradientBlob } from "@/components/ui/decorative-elements";
import { motion } from "framer-motion";

const Classroom = () => {
  const { t } = useLocalization();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/10">
      <GradientBlob className="top-20 left-10" />
      <GradientBlob className="bottom-20 right-10" colors="from-palavox-teal to-palavox-accent" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto p-4 relative z-10"
      >
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 gradient-text flex items-center justify-center gap-3">
            <Users className="h-10 w-10 md:h-12 md:w-12" />
            {t("classManagement")}
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            {t("manageClassesAndTrackProgress")}
          </p>
        </div>

        <InteractiveCard>
          <div className="p-6">
            <h3 className="text-lg font-semibold mb-2">{t("classroomFeatures")}</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {t("createAndManageVirtualClassrooms")}
            </p>
            <p className="text-muted-foreground">{t("classroomFeaturesComingSoon")}</p>
          </div>
        </InteractiveCard>
      </motion.div>
    </div>
  );
};

export default Classroom;
