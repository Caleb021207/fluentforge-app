import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface InteractiveCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  hoverScale?: number;
  glowOnHover?: boolean;
}

const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, hoverScale = 1.02, glowOnHover = true, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: hoverScale }}
        whileTap={{ scale: 0.98 }}
        className={cn(
          "rounded-lg border bg-card text-card-foreground shadow-sm transition-shadow duration-300",
          glowOnHover && "hover:glow-accent",
          className
        )}
        {...props}
      >
        {children}
      </motion.div>
    )
  }
)
InteractiveCard.displayName = "InteractiveCard"

export { InteractiveCard }
