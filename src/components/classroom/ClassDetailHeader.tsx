
import React from 'react';
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

interface ClassDetailHeaderProps {
  onBackClick: () => void;
  backText: string;
}

const ClassDetailHeader: React.FC<ClassDetailHeaderProps> = ({ 
  onBackClick, 
  backText 
}) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      className="mb-4"
      onClick={onBackClick}
    >
      <ChevronLeft className="h-4 w-4 mr-2" />
      {backText}
    </Button>
  );
};

export default ClassDetailHeader;
