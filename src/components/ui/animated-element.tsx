
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
  // Extract transition duration from animation if provided, or use default
  const transitionDuration = duration !== undefined 
    ? duration 
    : (animation.visible && 
       typeof animation.visible === 'object' && 
       'transition' in animation.visible && 
       typeof animation.visible.transition === 'object' && 
       'duration' in animation.visible.transition)
      ? animation.visible.transition.duration
      : 0.3;
  
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
            duration: transitionDuration,
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedElement;
