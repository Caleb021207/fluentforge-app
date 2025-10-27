import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import ConfettiExplosion from "./confetti";
import xpPopupImage from "@/assets/xp-popup-celebration.png";

interface XPNotificationProps {
  show: boolean;
  amount: number;
}

const XPNotification: React.FC<XPNotificationProps> = ({ show, amount }) => {
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (show && amount > 10) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, amount]);

  // Only show the popup for XP > 10
  if (!show || amount <= 10) return null;

  return (
    <>
      <ConfettiExplosion trigger={showConfetti} duration={3000} particleCount={50} />
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.5, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.5, y: -50 }}
          transition={{ 
            type: "spring",
            stiffness: 200,
            damping: 20,
            duration: 0.6 
          }}
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 pointer-events-none"
        >
          <div className="flex flex-col items-center gap-4">
            <div className="bg-[#7DD4C3] rounded-3xl p-6 shadow-xl">
              <motion.img
                src={xpPopupImage}
                alt="Celebration"
                className="w-48 h-auto"
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 0.8,
                  repeat: 2,
                  ease: "easeInOut"
                }}
              />
            </div>
            <div className="flex flex-col items-center gap-2 bg-background/95 backdrop-blur-sm px-8 py-4 rounded-2xl shadow-lg">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span className="text-3xl font-bold text-foreground">+{amount} XP</span>
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <span className="text-sm font-semibold text-muted-foreground">Amazing work!</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default XPNotification;
