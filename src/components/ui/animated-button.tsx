
import React from "react";
import { Button, ButtonProps } from "@/components/ui/button";
import { motion } from "framer-motion";

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
      whileTap: { scale: 0.97 },
      transition: { duration: 0.2 }
    },
    lift: {
      whileHover: { y: -3, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
      whileTap: { y: -1 },
      transition: { duration: 0.2 }
    },
    pulse: {
      whileHover: { 
        boxShadow: [
          "0 0 0 0 rgba(99, 102, 241, 0)",
          "0 0 0 6px rgba(99, 102, 241, 0.1)"
        ],
      },
      transition: { duration: 0.8, repeat: Infinity, repeatType: "mirror" }
    },
    none: {}
  };
  
  const selectedAnimation = animations[animationType];
  
  return (
    <MotionButton
      className={className}
      {...props}
      {...selectedAnimation}
    >
      {children}
    </MotionButton>
  );
};

export default AnimatedButton;
