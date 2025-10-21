import * as React from "react"
import { motion, HTMLMotionProps } from "framer-motion"
import { cn } from "@/lib/utils"

interface InteractiveCardProps extends Omit<HTMLMotionProps<"div">, "ref"> {
  hoverScale?: number;
}

const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ className, hoverScale = 1.01, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        whileHover={{ scale: hoverScale, y: -4 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className={cn(
          "rounded-xl border bg-card text-card-foreground shadow-sm hover:shadow-lg transition-shadow duration-200",
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
