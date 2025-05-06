
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

// Fox Logo Component - Based on the provided logo image
export const FoxLogo: React.FC<{
  className?: string;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}> = ({ className, size = "md", animated = true }) => {
  // Set size classes
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  // Hover animation
  const hoverAnimation = {
    rest: { scale: 1 },
    hover: { scale: 1.05, rotate: [0, 2, 0, -2, 0], transition: { duration: 0.6 } }
  };

  return (
    <motion.div 
      className={cn("relative", sizeClasses[size], className)}
      initial="rest"
      whileHover={animated ? "hover" : undefined}
      variants={animated ? hoverAnimation : undefined}
    >
      <svg viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Improved fox face with pointier features */}
        <path 
          d="M50 15C30 15 15 30 15 60C15 75 30 85 50 85C70 85 85 75 85 60C85 30 70 15 50 15Z" 
          fill="#FF9D5C" 
          stroke="#0B1C36" 
          strokeWidth="2"
        />
        {/* White face area */}
        <path 
          d="M30 45C30 35 45 30 50 30C55 30 70 35 70 45C70 60 60 70 50 70C40 70 30 60 30 45Z" 
          fill="white" 
        />
        {/* Eyes */}
        <circle cx="38" cy="48" r="3" fill="#0B1C36" />
        <circle cx="62" cy="48" r="3" fill="#0B1C36" />
        
        {/* Snout/nose */}
        <path 
          d="M50 55C45 55 43 58 43 60C43 62 45 65 50 65C55 65 57 62 57 60C57 58 55 55 50 55Z" 
          fill="#0B1C36" 
        />
        <path 
          d="M45 60Q50 62 55 60" 
          stroke="#0B1C36" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
        />
        
        {/* Pointier ears */}
        <path 
          d="M20 20L35 40L25 15Z" 
          fill="#FF9D5C" 
          stroke="#0B1C36" 
          strokeWidth="2"
        />
        <path 
          d="M80 20L65 40L75 15Z" 
          fill="#FF9D5C" 
          stroke="#0B1C36" 
          strokeWidth="2"
        />

        {/* Inner ear detail */}
        <path 
          d="M24 20L35 35" 
          stroke="#0B1C36" 
          strokeWidth="1" 
          strokeLinecap="round"
        />
        <path 
          d="M76 20L65 35" 
          stroke="#0B1C36" 
          strokeWidth="1" 
          strokeLinecap="round"
        />
      </svg>
    </motion.div>
  );
};

// Fox Mascot Component for more interactive elements
export const FoxMascot: React.FC<{
  className?: string;
  size?: "sm" | "md" | "lg";
  mood?: "happy" | "thinking" | "excited";
  animated?: boolean;
}> = ({ className, size = "md", mood = "happy", animated = true }) => {
  // Size classes
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-20 h-20",
    lg: "w-32 h-32",
  };

  // Animation for different moods
  const animations = {
    happy: {
      animate: {
        y: [0, -5, 0],
        transition: {
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse" as const
        }
      }
    },
    thinking: {
      animate: {
        rotate: [0, 5, 0, -5, 0],
        transition: {
          duration: 3,
          repeat: Infinity,
          repeatType: "reverse" as const
        }
      }
    },
    excited: {
      animate: {
        scale: [1, 1.05, 1],
        transition: {
          duration: 0.5,
          repeat: Infinity,
          repeatType: "reverse" as const
        }
      }
    }
  };

  return (
    <motion.div 
      className={cn("relative", sizeClasses[size], className)}
      {...(animated ? animations[mood] : {})}
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {/* Fox body - more fox-like shape */}
        <path 
          d="M50 15C30 15 20 35 20 55C20 75 35 85 50 85C65 85 80 75 80 55C80 35 70 15 50 15Z" 
          fill="#FF7A2F" 
          stroke="#0B1C36" 
          strokeWidth="2"
        />
        {/* White chest/throat area */}
        <path 
          d="M35 45C35 35 45 35 50 35C55 35 65 35 65 45C65 60 55 70 50 70C45 70 35 60 35 45Z" 
          fill="white" 
        />
        {/* Eyes based on mood */}
        {mood === "happy" && (
          <>
            <circle cx="40" cy="48" r="3" fill="#0B1C36" />
            <circle cx="60" cy="48" r="3" fill="#0B1C36" />
            <path d="M45 60C46.6667 61.3333 53.3333 61.3333 55 60" stroke="#0B1C36" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {mood === "thinking" && (
          <>
            <circle cx="40" cy="48" r="3" fill="#0B1C36" />
            <circle cx="60" cy="48" r="3" fill="#0B1C36" />
            <path d="M45 60Q50 58 55 60" stroke="#0B1C36" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        {mood === "excited" && (
          <>
            <path d="M38 48C39 46 41 46 42 48" stroke="#0B1C36" strokeWidth="2" strokeLinecap="round" />
            <path d="M58 48C59 46 61 46 62 48" stroke="#0B1C36" strokeWidth="2" strokeLinecap="round" />
            <path d="M45 58C46.6667 62 53.3333 62 55 58" stroke="#0B1C36" strokeWidth="2" strokeLinecap="round" />
          </>
        )}
        
        {/* Pointier Fox ears */}
        <path 
          d="M25 20L40 40L20 15Z" 
          fill="#FF7A2F" 
          stroke="#0B1C36" 
          strokeWidth="2"
        />
        <path 
          d="M75 20L60 40L80 15Z" 
          fill="#FF7A2F" 
          stroke="#0B1C36" 
          strokeWidth="2"
        />
        
        {/* Inner ear detail */}
        <path 
          d="M27 22L37 35" 
          stroke="#0B1C36" 
          strokeWidth="1" 
          strokeLinecap="round" 
          opacity="0.5"
        />
        <path 
          d="M73 22L63 35" 
          stroke="#0B1C36" 
          strokeWidth="1" 
          strokeLinecap="round" 
          opacity="0.5"
        />
        
        {/* Fox tail - bushier and more fox-like */}
        <path 
          d="M80 55C95 45 90 35 87 38C84 41 85 46 80 55Z"
          fill="#FF7A2F"
          stroke="#0B1C36"
          strokeWidth="2"
        />
        <path 
          d="M85 45C90 42 92 40 93 38"
          stroke="#0B1C36" 
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
        />
        
        {/* White tail tip */}
        <path 
          d="M90 40C93 37 94 36 95 34"
          stroke="white" 
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        />
      </svg>
    </motion.div>
  );
};

// Fox Decoration for UI elements
export const FoxDecoration: React.FC<{
  className?: string;
  type?: "paw" | "tail" | "ear" | "silhouette";
  size?: "sm" | "md" | "lg";
  color?: string;
  animated?: boolean;
}> = ({ className, type = "paw", size = "md", color = "#FF7A2F", animated = true }) => {
  // Size classes
  const sizeClasses = {
    sm: "w-6 h-6",
    md: "w-10 h-10",
    lg: "w-16 h-16",
  };

  // Animation variants
  const animationVariants = {
    paw: {
      animate: {
        rotate: [0, 5, 0, -5, 0],
        transition: { duration: 4, repeat: Infinity }
      }
    },
    tail: {
      animate: {
        rotate: [0, 10, 0],
        transition: { duration: 2, repeat: Infinity }
      }
    },
    ear: {
      animate: {
        y: [0, -2, 0],
        transition: { duration: 2, repeat: Infinity }
      }
    },
    silhouette: {
      animate: {
        scale: [1, 1.03, 1],
        transition: { duration: 3, repeat: Infinity }
      }
    }
  };

  // SVG content based on type
  const getSvgContent = () => {
    switch(type) {
      case "paw":
        return (
          <path 
            d="M50 80C60 80 65 70 65 65C65 60 60 55 55 55C50 55 45 60 45 65C45 70 40 80 50 80Z M35 50C40 50 42 45 42 42C42 39 40 35 35 35C30 35 28 39 28 42C28 45 30 50 35 50Z M65 50C70 50 72 45 72 42C72 39 70 35 65 35C60 35 58 39 58 42C58 45 60 50 65 50Z M35 80C30 80 28 75 28 72C28 69 30 65 35 65C40 65 42 69 42 72C42 75 40 80 35 80Z M65 80C60 80 58 75 58 72C58 69 60 65 65 65C70 65 72 69 72 72C72 75 70 80 65 80Z"
            fill={color}
            stroke="#0B1C36"
            strokeWidth="2"
          />
        );
      case "tail":
        return (
          <>
            <path 
              d="M20 50C10 40 15 20 30 15C45 10 60 30 50 50C40 70 30 60 20 50Z"
              fill={color}
              stroke="#0B1C36"
              strokeWidth="2"
            />
            {/* White tail tip */}
            <path 
              d="M12 42C8 38 7 35 5 32"
              stroke="white" 
              strokeWidth="3"
              strokeLinecap="round"
              fill="none"
            />
          </>
        );
      case "ear":
        return (
          <>
            <path 
              d="M50 10L30 40L20 5L50 10Z"
              fill={color}
              stroke="#0B1C36"
              strokeWidth="2"
            />
            <path 
              d="M50 10L70 40L80 5L50 10Z"
              fill={color}
              stroke="#0B1C36"
              strokeWidth="2"
            />
            {/* Inner ear details */}
            <path 
              d="M40 30L30 15"
              stroke="#0B1C36"
              strokeWidth="1"
              opacity="0.5"
              strokeLinecap="round"
            />
            <path 
              d="M60 30L70 15"
              stroke="#0B1C36"
              strokeWidth="1"
              opacity="0.5"
              strokeLinecap="round"
            />
          </>
        );
      case "silhouette":
        return (
          <path 
            d="M50 10C30 10 15 30 15 50C15 70 30 90 50 90C70 90 85 70 85 50C85 30 70 10 50 10Z M25 20L35 40L20 15Z M75 20L65 40L80 15Z M40 50L35 55L45 60L55 60L65 55L60 50L60 45L50 40L40 45L40 50Z"
            fill={color}
            stroke="#0B1C36"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        );
      default:
        return null;
    }
  };

  return (
    <motion.div 
      className={cn("relative", sizeClasses[size], className)}
      {...(animated ? animationVariants[type] : {})}
    >
      <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
        {getSvgContent()}
      </svg>
    </motion.div>
  );
};

// Fox Tips Component for learning guidance
export const FoxTip: React.FC<{
  children: React.ReactNode;
  className?: string;
  mood?: "happy" | "thinking" | "excited";
}> = ({ children, className, mood = "happy" }) => {
  return (
    <div className={cn("relative flex items-start gap-4 p-4 rounded-lg border border-accent/30 bg-accent/5", className)}>
      <div className="flex-shrink-0">
        <FoxMascot size="sm" mood={mood} />
      </div>
      <div className="flex-grow">
        <div className="text-sm text-foreground leading-relaxed">
          {children}
        </div>
      </div>
    </div>
  );
};

// Fox Loading Component
export const FoxLoading: React.FC<{
  className?: string;
  size?: "sm" | "md" | "lg";
  message?: string;
}> = ({ className, size = "md", message }) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
  };
  
  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <motion.div
        className={sizeClasses[size]}
        animate={{
          y: [0, -10, 0],
          rotate: [0, 10, -10, 0],
          scale: [1, 1.1, 1],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
      >
        <FoxLogo size={size} />
      </motion.div>
      
      {message && (
        <motion.p 
          className="mt-4 text-sm text-muted-foreground"
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
