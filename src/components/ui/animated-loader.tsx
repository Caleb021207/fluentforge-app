
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";

interface AnimatedLoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
  message?: string;
}

const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  size = "md",
  color = "text-palavox-accent",
  className,
  message
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.div
        animate={{ 
          rotate: 360,
          scale: [1, 1.05, 1]
        }}
        transition={{
          rotate: {
            duration: 1.5,
            repeat: Infinity,
            ease: "linear"
          },
          scale: {
            duration: 1,
            repeat: Infinity,
            repeatType: "reverse"
          }
        }}
        className={cn("text-palavox-primary", color)}
      >
        <Loader className={sizeClasses[size]} />
      </motion.div>
      
      {message && (
        <motion.p 
          className="mt-3 text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {message}
        </motion.p>
      )}
    </div>
  );
};

export default AnimatedLoader;
