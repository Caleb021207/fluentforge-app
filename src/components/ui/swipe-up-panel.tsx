
import React, { useState, useRef, useEffect } from 'react';
import { motion, PanInfo } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SwipeUpPanelProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  className?: string;
}

export const SwipeUpPanel = ({ children, isOpen, onOpenChange, className }: SwipeUpPanelProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    setIsDragging(false);
    
    if (info.velocity.y > 500 || info.offset.y > 100) {
      onOpenChange(false);
    } else if (info.velocity.y < -500 || info.offset.y < -100) {
      onOpenChange(true);
    }
  };

  const variants = {
    closed: {
      y: '85%',
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300
      }
    },
    open: {
      y: 0,
      transition: {
        type: 'spring',
        damping: 30,
        stiffness: 300
      }
    }
  };

  return (
    <>
      {/* Backdrop */}
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => onOpenChange(false)}
        />
      )}
      
      {/* Panel */}
      <motion.div
        ref={panelRef}
        className={cn(
          "fixed bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl border-t z-50",
          "min-h-[50vh] max-h-[90vh]",
          className
        )}
        variants={variants}
        animate={isOpen ? 'open' : 'closed'}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragStart={() => setIsDragging(true)}
        onDragEnd={handleDragEnd}
      >
        {/* Drag Handle */}
        <div className="flex justify-center pt-4 pb-2">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>
        
        {/* Content */}
        <div className="px-6 pb-6 overflow-y-auto max-h-[80vh]">
          {children}
        </div>
      </motion.div>
    </>
  );
};
