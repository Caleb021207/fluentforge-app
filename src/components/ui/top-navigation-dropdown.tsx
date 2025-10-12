
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

interface NavigationItem {
  label: string;
  path: string;
  icon?: React.ReactNode;
  disabled?: boolean;
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

  const handleItemClick = (path: string, disabled?: boolean) => {
    if (disabled) return;
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
            
            {/* Dropdown Panel - Full Width */}
            <motion.div
              initial={{ opacity: 0, y: -10, scaleY: 0.95 }}
              animate={{ opacity: 1, y: 0, scaleY: 1 }}
              exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="fixed left-0 right-0 top-[120px] bg-background border-b shadow-lg z-50 overflow-hidden"
              style={{ transformOrigin: 'top' }}
            >
              {/* Full Width Navigation Grid */}
              <div className="w-full px-4 py-6">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 max-w-7xl mx-auto">
                  {items.map((item, index) => (
                    <motion.button
                      key={item.path}
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      onClick={() => handleItemClick(item.path, item.disabled)}
                      disabled={item.disabled}
                      className={cn(
                        "flex flex-col items-center gap-2 p-4 rounded-xl transition-colors",
                        "hover:bg-accent hover:text-accent-foreground",
                        "border border-transparent hover:border-accent",
                        currentPath === item.path && "bg-accent text-accent-foreground border-accent",
                        item.disabled && "opacity-40 cursor-not-allowed hover:bg-transparent hover:border-transparent"
                      )}
                    >
                      {item.icon && (
                        <span className="w-6 h-6 flex-shrink-0">
                          {item.icon}
                        </span>
                      )}
                      <span className="text-sm font-medium text-center leading-tight">
                        {item.label}
                      </span>
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
