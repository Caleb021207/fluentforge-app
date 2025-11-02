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
  const [imageLoaded, setImageLoaded] = useState(false);

  // Preload image when component mounts
  useEffect(() => {
    const img = new Image();
    img.src = xpPopupImage;
    img.onload = () => setImageLoaded(true);
  }, []);

  useEffect(() => {
    if (show && amount >= 50 && imageLoaded) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [show, amount, imageLoaded]);

  // Only show the popup for XP >= 50 and when image is loaded
  if (!show || amount < 50 || !imageLoaded) return null;

  return (
    <>
      <ConfettiExplosion trigger={showConfetti} duration={3000} particleCount={500} />
      <AnimatePresence>
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ 
            type: "spring",
            stiffness: 260,
            damping: 20,
            duration: 0.6 
          }}
          className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none"
        >
          <div className="bg-[#7DD4C3] rounded-3xl p-8 shadow-2xl flex flex-col items-center gap-3">
            <motion.img
              src={xpPopupImage}
              alt="Celebration"
              className="w-40 h-auto"
              animate={{
                scale: [1, 1.05, 1],
                rotate: [0, 3, -3, 0],
              }}
              transition={{
                duration: 0.8,
                repeat: 3,
                ease: "easeInOut"
              }}
            />
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-white" />
              <span className="text-3xl font-bold text-white">+{amount} XP</span>
              <Sparkles className="w-5 h-5 text-white" />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
};

export default XPNotification;
