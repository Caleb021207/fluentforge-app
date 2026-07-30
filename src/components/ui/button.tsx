import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "relative inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-semibold ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        /* Primary action: the signature sky -> mint gradient with a soft glow. */
        default:
          "bg-brand-gradient text-[#06263A] shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5 active:translate-y-0",
        /* Flat solid, for dense UI where a gradient would be noisy. */
        solid:
          "bg-primary text-primary-foreground hover:bg-primary/90 hover:-translate-y-0.5",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:-translate-y-0.5",
        outline:
          "border border-border/80 bg-background/40 backdrop-blur-sm hover:border-brand-sky/60 hover:bg-brand-sky/10 hover:text-foreground",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost:
          "hover:bg-brand-sky/10 hover:text-foreground",
        link:
          "text-primary underline-offset-4 hover:underline",
        success:
          "bg-gradient-to-r from-brand-mint to-emerald-400 text-[#06263A] shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5",
        accent:
          "bg-accent text-accent-foreground hover:bg-accent/90 hover:-translate-y-0.5",
        gradient:
          "bg-brand-gradient text-[#06263A] shadow-brand hover:shadow-brand-lg hover:-translate-y-0.5",
        /* Gradient hairline outline, transparent fill. */
        outlineGradient:
          "gradient-border bg-background/30 backdrop-blur-sm text-foreground hover:bg-brand-sky/10",
        celebration:
          "bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 text-white hover:scale-105 hover:shadow-xl",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 rounded-lg px-3.5 text-sm",
        lg: "h-13 rounded-2xl px-8 text-base",
        xl: "h-14 rounded-2xl px-10 text-lg",
        icon: "h-10 w-10 rounded-lg",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
