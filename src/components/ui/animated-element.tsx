
import React from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";

interface AnimatedElementProps {
  children: React.ReactNode;
  animation: Variants;
  className?: string;
  delay?: number;
  duration?: number;
  isVisible?: boolean;
  animateOnMount?: boolean;
  animateOnceOnly?: boolean;
}

const AnimatedElement = ({
  children,
  animation,
  className = "",
  delay = 0,
  duration,
  isVisible = true,
  animateOnMount = true,
  animateOnceOnly = false,
}: AnimatedElementProps) => {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className={className}
          variants={animation}
          initial={animateOnMount ? "hidden" : false}
          animate="visible"
          exit="hidden"
          viewport={animateOnceOnly ? { once: true } : undefined}
          transition={{
            delay,
            // Use optional chaining to safely access the duration
            duration: duration || animation.visible?.transition?.duration || 0.3,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedElement;
