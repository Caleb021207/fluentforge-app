
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { floatAnimation, pulseAnimation } from "@/lib/animations";
import { FoxDecoration } from "./fox-components";

export const GradientBlob: React.FC<{
  className?: string;
  size?: string;
  colors?: string;
  animate?: boolean;
}> = ({ className, size = "w-64 h-64", colors = "from-palavox-accent to-palavox-teal", animate = true }) => {
  return (
    <motion.div
      className={cn(
        "absolute rounded-full opacity-30 blur-3xl -z-10",
        size,
        colors,
        className
      )}
      variants={animate ? floatAnimation : undefined}
      animate={animate ? "animate" : undefined}
    />
  );
};

export const DecorativeCircle: React.FC<{
  className?: string;
  size?: string;
  color?: string;
  animate?: boolean;
}> = ({ className, size = "w-4 h-4", color = "bg-palavox-accent", animate = true }) => {
  return (
    <motion.div
      className={cn("rounded-full", size, color, className)}
      variants={animate ? pulseAnimation : undefined}
      animate={animate ? "animate" : undefined}
    />
  );
};

export const DecorativeLine: React.FC<{
  className?: string;
  width?: string;
  height?: string;
  color?: string;
  orientation?: "horizontal" | "vertical";
}> = ({ className, width = "w-20", height = "h-0.5", color = "bg-palavox-accent", orientation = "horizontal" }) => {
  return (
    <div 
      className={cn(
        orientation === "horizontal" ? width : "w-0.5",
        orientation === "horizontal" ? height : "h-20",
        color,
        className
      )}
    />
  );
};

export const ScatterDots: React.FC<{
  className?: string;
  count?: number;
  color?: string;
}> = ({ className, count = 5, color = "bg-palavox-accent" }) => {
  return (
    <div className={cn("relative", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <DecorativeCircle
          key={index}
          className={`absolute top-${Math.floor(Math.random() * 10)} left-${Math.floor(Math.random() * 10)}`}
          size={`w-${Math.floor(Math.random() * 3) + 1} h-${Math.floor(Math.random() * 3) + 1}`}
          color={color}
          animate={index % 2 === 0}
        />
      ))}
    </div>
  );
};

export const WavyLine: React.FC<{
  className?: string;
  color?: string;
  width?: number;
  height?: number;
}> = ({ className, color = "stroke-palavox-accent", width = 200, height = 20 }) => {
  return (
    <svg 
      width={width} 
      height={height} 
      viewBox={`0 0 ${width} ${height}`} 
      className={className}
    >
      <path
        d={`M0 ${height/2} C ${width/4} ${height*0.8}, ${width/2} ${height*0.2}, ${width} ${height/2}`}
        fill="none"
        className={cn("stroke-2", color)}
      />
    </svg>
  );
};

// New Fox-themed decorative elements
export const FoxPawTrail: React.FC<{
  className?: string;
  count?: number;
  size?: "sm" | "md";
  color?: string;
}> = ({ className, count = 5, size = "sm", color = "#A3D5FF" }) => {
  return (
    <div className={cn("relative", className)}>
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          className={`absolute`}
          style={{
            top: `${Math.floor(Math.random() * 80)}%`,
            left: `${(index * 100) / count}%`,
            opacity: 0.7 - (index * 0.1),
            transform: `rotate(${Math.floor(Math.random() * 40) - 20}deg)`
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 0.7 - (index * 0.1), scale: 1 }}
          transition={{ delay: index * 0.2 }}
        >
          <FoxDecoration type="paw" size={size} color={color} animated={false} />
        </motion.div>
      ))}
    </div>
  );
};

export const FoxTailWag: React.FC<{
  className?: string;
  size?: "sm" | "md" | "lg";
  color?: string;
}> = ({ className, size = "md", color = "#FF9D5C" }) => {
  return (
    <motion.div
      className={cn("relative", className)}
      initial={{ rotate: -10 }}
      animate={{ rotate: [0, 10, -5, 10, 0] }}
      transition={{ 
        duration: 2, 
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut" 
      }}
    >
      <FoxDecoration type="tail" size={size} color={color} animated={false} />
    </motion.div>
  );
};
