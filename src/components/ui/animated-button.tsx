
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
  // Define animation variants for each type
  let animationProps = {};
  
  switch (animationType) {
    case "scale":
      animationProps = {
        whileHover: { scale: 1.03 },
        whileTap: { scale: 0.97 }
      };
      break;
    case "lift":
      animationProps = {
        whileHover: { y: -3, boxShadow: "0 4px 12px rgba(0,0,0,0.15)" },
        whileTap: { y: -1 }
      };
      break;
    case "pulse":
      animationProps = {
        whileHover: { 
          boxShadow: [
            "0 0 0 0 rgba(99, 102, 241, 0)",
            "0 0 0 6px rgba(99, 102, 241, 0.1)"
          ]
        }
      };
      break;
    case "none":
    default:
      // No animation
      break;
  }
  
  return (
    <MotionButton
      className={className}
      {...props}
      {...animationProps}
      transition={{ duration: 0.2 }}
    >
      {children}
    </MotionButton>
  );
};

export default AnimatedButton;
