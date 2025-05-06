
import React, { useState } from "react";
import { Card } from "@/components/ui/card";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguageDisplayName } from "@/utils/languageUtils";
import { FoxMascot, FoxTip } from "@/components/ui/fox-components";
import { motion } from "framer-motion";

interface PracticeGuideProps {
  targetLanguage: string;
}

const PracticeGuide: React.FC<PracticeGuideProps> = ({ targetLanguage }) => {
  const { currentLanguage, t } = useLocalization();
  const [activeTip, setActiveTip] = useState<number | null>(null);
  
  // Get localized target language name
  const learningLanguage = getLanguageDisplayName(targetLanguage);
  
  const tips = [
    t("practiceTip1"),
    t("practiceTip2"),
    t("practiceTip3"),
    t("practiceTip4"),
    t("practiceTip5")
  ];
  
  const foxMoods = ["happy", "thinking", "excited", "happy", "thinking"];
  
  return (
    <Card className="p-6 border border-border relative overflow-hidden">
      {/* Fox decoration in the corner */}
      <div className="absolute top-0 right-0 opacity-70 pointer-events-none">
        <FoxMascot 
          size="lg" 
          className="-mt-2 -mr-2 transform -rotate-12" 
          mood="happy" 
        />
      </div>
      
      <div className="relative z-10">
        <h2 className="text-xl font-semibold mb-4 text-foreground flex items-center gap-2">
          {t("practiceGuide", { language: learningLanguage })}
        </h2>
        
        <p className="mb-6 text-foreground">
          {t("practiceGuideDescription", { language: learningLanguage })}
        </p>
        
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.01 }}
              onClick={() => setActiveTip(activeTip === index ? null : index)}
              className="cursor-pointer"
            >
              <FoxTip mood={foxMoods[index % foxMoods.length] as any}>
                {tip}
              </FoxTip>
            </motion.div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default PracticeGuide;
