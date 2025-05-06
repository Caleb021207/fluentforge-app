
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { motion } from "framer-motion";

// Create a properly typed motion button component
const MotionButton = motion(Button);

interface AnimatedButtonProps extends ButtonProps {
  children: React.ReactNode;
  animationType?: "scale" | "lift" | "pulse" | "none";
}

const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  animationType = "scale",
  className,
  ...props
}) => {
  // Animation presets
  const animations = {
    scale: {
      whileHover: { scale: 1.03 },
      whileTap: { scale: 0.97 }
    },
    lift: {
      whileHover: { y: -3, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
      whileTap: { y: -1 }
    },
    pulse: {
      whileHover: { 
        boxShadow: [
          "0 0 0 0 rgba(99, 102, 241, 0)",
          "0 0 0 6px rgba(99, 102, 241, 0.1)"
        ],
      }
    },
    none: {}
  };
  
  const selectedAnimation = animations[animationType];
  
  // Fixed: Properly handle animation types and transitions separately
  return (
    <MotionButton
      className={className}
      {...props}
      {...(selectedAnimation?.whileHover && { whileHover: selectedAnimation.whileHover })}
      {...(selectedAnimation?.whileTap && { whileTap: selectedAnimation.whileTap })}
      transition={{ duration: 0.2 }}
    >
      {children}
    </MotionButton>
  );
};

export default AnimatedButton;
