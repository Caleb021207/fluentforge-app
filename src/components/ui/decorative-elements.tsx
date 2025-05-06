
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { floatAnimation, pulseAnimation } from "@/lib/animations";

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
