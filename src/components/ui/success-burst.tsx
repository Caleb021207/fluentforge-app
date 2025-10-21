import React from "react";
import { motion } from "framer-motion";
import { Check } from "lucide-react";

interface SuccessBurstProps {
  show: boolean;
}

const SuccessBurst: React.FC<SuccessBurstProps> = ({ show }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 15 }}
        className="relative"
      >
        <motion.div
          initial={{ scale: 1, opacity: 0.8 }}
          animate={{ scale: 2.5, opacity: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="absolute inset-0 rounded-full bg-green-500"
        />
        <div className="relative w-20 h-20 rounded-full bg-green-500 flex items-center justify-center shadow-2xl">
          <Check className="w-12 h-12 text-white" strokeWidth={3} />
        </div>
      </motion.div>
    </div>
  );
};

export default SuccessBurst;
