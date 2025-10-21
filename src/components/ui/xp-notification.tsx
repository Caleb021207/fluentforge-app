import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles } from "lucide-react";

interface XPNotificationProps {
  show: boolean;
  amount: number;
}

const XPNotification: React.FC<XPNotificationProps> = ({ show, amount }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.8 }}
          animate={{ opacity: 1, y: -50, scale: 1.2 }}
          exit={{ opacity: 0, y: -100, scale: 0.8 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="fixed top-24 right-8 z-50 pointer-events-none"
        >
          <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 text-white font-bold px-6 py-3 rounded-full shadow-2xl flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            <span className="text-lg">+{amount} XP</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default XPNotification;
