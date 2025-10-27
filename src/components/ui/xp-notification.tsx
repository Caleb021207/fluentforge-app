import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";
import ConfettiExplosion from "./confetti";
import foxCelebrate from "@/assets/fox-celebrate-party.png";

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
          <div className="bg-[#7DD4C3] text-white font-bold px-8 py-6 rounded-2xl shadow-2xl flex flex-col items-center gap-3 border-4 border-white/40">
            <motion.img
              src={foxCelebrate}
              alt="Celebrating fox"
              className="w-32 h-32 -mt-2"
              animate={{
                scale: [1, 1.05, 1],
              }}
              transition={{
                duration: 0.8,
                repeat: 2,
                ease: "easeInOut"
              }}
            />
            <div className="flex items-center gap-2 -mt-2">
              <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
              <span className="text-3xl font-extrabold text-white drop-shadow-md">+{amount} XP</span>
              <Sparkles className="w-6 h-6 text-white drop-shadow-md" />
            </div>
            <span className="text-base font-bold opacity-95 text-white">Amazing work!</span>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default XPNotification;
