
import React from "react";
import { motion } from "framer-motion";
import AnimatedElement from "../ui/animated-element";
import { fadeIn, slideInRight, staggeredContainer } from "@/lib/animations";
import { GradientBlob, DecorativeLine } from "../ui/decorative-elements";

interface AnimatedHomeSectionProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  withDecorations?: boolean;
}

const AnimatedHomeSection: React.FC<AnimatedHomeSectionProps> = ({
  children,
  title,
  subtitle,
  withDecorations = true,
}) => {
  return (
    <motion.section 
      className="relative py-12 md:py-20 overflow-hidden"
      variants={staggeredContainer(0.2)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
    >
      {withDecorations && (
        <>
          <GradientBlob 
            className="top-0 right-0 opacity-20" 
            size="w-72 h-72 md:w-96 md:h-96" 
            colors="from-palavox-accent/30 to-palabox-teal/30"
          />
          
          <GradientBlob 
            className="bottom-0 left-0 opacity-20" 
            size="w-64 h-64" 
            colors="from-palavox-teal/30 to-palavox-accent/30" 
          />
        </>
      )}
      
      <div className="container max-w-7xl mx-auto px-4 sm:px-6 relative">
        {title && (
          <AnimatedElement animation={fadeIn} className="mb-2">
            <h2 className="text-3xl md:text-4xl font-bold text-center">{title}</h2>
            {withDecorations && (
              <div className="flex justify-center mt-2">
                <DecorativeLine className="mx-auto" width="w-24" color="bg-palavox-accent" />
              </div>
            )}
          </AnimatedElement>
        )}
        
        {subtitle && (
          <AnimatedElement animation={fadeIn} delay={0.1} className="mb-10">
            <p className="text-lg md:text-xl text-muted-foreground text-center max-w-3xl mx-auto">
              {subtitle}
            </p>
          </AnimatedElement>
        )}
        
        <AnimatedElement animation={slideInRight} delay={0.2} className="relative z-10">
          {children}
        </AnimatedElement>
      </div>
    </motion.section>
  );
};

export default AnimatedHomeSection;
