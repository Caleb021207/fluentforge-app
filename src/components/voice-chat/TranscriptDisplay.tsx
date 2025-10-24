
import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocalization } from "@/context/LocalizationContext";
import { Loader2 } from "lucide-react";
import { TranscriptDisplayProps } from "@/types/voiceChat";

const TranscriptDisplay: React.FC<TranscriptDisplayProps> = ({ transcript, isListening, isTranscribing = false }) => {
  const { t } = useLocalization();

  return (
    <AnimatePresence mode="wait">
      {(isListening || transcript || isTranscribing) && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="mb-6"
        >
          <div className="bg-primary/5 rounded-lg p-4 min-h-[60px] border border-primary/20">
            {isTranscribing ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-base italic">
                  {t("processing") || "Processing your speech"}...
                </p>
              </div>
            ) : transcript ? (
              <p className="text-foreground text-lg">{transcript}</p>
            ) : isListening ? (
              <p className="text-muted-foreground text-base italic">
                {t("listening")}... (click stop when done)
              </p>
            ) : null}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default TranscriptDisplay;
