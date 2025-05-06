
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader } from "lucide-react";
import { FoxLogo } from "./fox-components";

interface AnimatedLoaderProps {
  size?: "sm" | "md" | "lg";
  color?: string;
  className?: string;
  message?: string;
  foxThemed?: boolean;
}

const AnimatedLoader: React.FC<AnimatedLoaderProps> = ({
  size = "md",
  color = "text-palavox-accent",
  className,
  message,
  foxThemed = false
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12"
  };

  const logoSizes = {
    sm: "sm",
    md: "md",
    lg: "md"
  };

  if (foxThemed) {
    return (
      <div className={cn("flex flex-col items-center justify-center", className)}>
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.05, 1]
          }}
          transition={{
            rotate: {
              duration: 2.5,
              repeat: Infinity,
              ease: "linear"
            },
            scale: {
              duration: 1.2,
              repeat: Infinity,
              repeatType: "reverse"
            }
          }}
        >
          <FoxLogo size={logoSizes[size] as any} />
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
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "linear"
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
