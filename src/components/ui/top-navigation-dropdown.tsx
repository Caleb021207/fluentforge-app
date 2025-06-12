
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
}

interface TopNavigationDropdownProps {
  items: NavigationItem[];
  currentPath: string;
  onNavigate: (path: string) => void;
  className?: string;
}

export const TopNavigationDropdown = ({ 
  items, 
  currentPath, 
  onNavigate, 
  className 
}: TopNavigationDropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const currentItem = items.find(item => item.path === currentPath);

  const handleItemClick = (path: string) => {
    onNavigate(path);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)}>
      {/* Trigger Button */}
      <Button
        variant="ghost"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 text-foreground"
      >
        <span className="font-medium">
          {currentItem?.label || 'Navigate'}
        </span>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </Button>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 z-40"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Dropdown Panel */}
            <motion.div
              initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-xl shadow-lg z-50 overflow-hidden"
              style={{ transformOrigin: 'top' }}
            >
              {/* Horizontal Scroll Container */}
              <div className="overflow-x-auto">
                <div className="flex min-w-max p-2 gap-1">
                  {items.map((item, index) => (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleItemClick(item.path)}
                      className={cn(
                        "flex items-center gap-2 px-4 py-3 rounded-lg transition-colors whitespace-nowrap",
                        "hover:bg-accent hover:text-accent-foreground",
                        currentPath === item.path && "bg-accent text-accent-foreground"
                      )}
                    >
                      {item.icon && (
                        <span className="w-4 h-4 flex-shrink-0">
                          {item.icon}
                        </span>
                      )}
                      <span className="font-medium">{item.label}</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};
