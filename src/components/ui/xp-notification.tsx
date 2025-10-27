import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import ConfettiExplosion from "./confetti";
import xpPopupBase from "@/assets/xp-popup-base.png";

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
          <div className="relative">
            <img 
              src={xpPopupBase} 
              alt="XP Celebration" 
              className="w-auto h-auto"
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 pt-8">
              <div className="flex items-center gap-2">
                <Sparkles className="w-7 h-7 text-white drop-shadow-lg" />
                <span className="text-4xl font-extrabold text-white drop-shadow-lg">+{amount} XP</span>
                <Sparkles className="w-7 h-7 text-white drop-shadow-lg" />
              </div>
              <span className="text-lg font-bold text-white drop-shadow-md">Amazing work!</span>
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default XPNotification;
