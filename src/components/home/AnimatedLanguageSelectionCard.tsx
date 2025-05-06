
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { DecorativeCircle } from "../ui/decorative-elements";
import { useLocalization } from "@/context/LocalizationContext";

const MotionCard = motion(Card);

interface AnimatedLanguageSelectionCardProps {
  title: string;
  onSelect: () => void;
  isSelected?: boolean;
  icon?: string;
  children?: React.ReactNode;
}

const AnimatedLanguageSelectionCard: React.FC<AnimatedLanguageSelectionCardProps> = ({
  title,
  onSelect,
  isSelected = false,
  icon,
  children,
}) => {
  const { t } = useLocalization();
  
  return (
    <MotionCard
      className={`relative overflow-hidden cursor-pointer ${
        isSelected 
          ? "ring-2 ring-palavox-accent bg-palavox-accent/10" 
          : "hover:bg-background/80"
      }`}
      onClick={onSelect}
      whileHover={{ 
        scale: 1.03,
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)"
      }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      <CardContent className="p-6 flex flex-col items-center">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 opacity-30">
          <DecorativeCircle 
            size="w-20 h-20" 
            color="bg-palavox-accent/20" 
            className="-right-10 -top-10"
          />
        </div>
        
        {icon && <div className="text-3xl mb-3">{icon}</div>}
        
        <h3 className="text-lg font-medium mb-2">{title}</h3>
        
        {children}
        
        {isSelected && (
          <motion.div 
            className="absolute bottom-0 left-0 w-full h-1 bg-palavox-accent"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </CardContent>
    </MotionCard>
  );
};

export default AnimatedLanguageSelectionCard;
