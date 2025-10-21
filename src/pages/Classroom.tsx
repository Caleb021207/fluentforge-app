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
        <div className="mb-6">
          <h1 className="text-2xl font-bold mb-2 flex items-center gap-2 bg-gradient-to-r from-primary to-palavox-teal bg-clip-text text-transparent">
            <Users className="h-6 w-6 text-primary" />
            {t("classManagement")}
          </h1>
          <p className="text-muted-foreground">
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
