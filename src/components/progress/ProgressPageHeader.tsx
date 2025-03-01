
import React from "react";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw } from "lucide-react";

interface ProgressPageHeaderProps {
  isRefreshing: boolean;
  onRefresh: () => void;
}

const ProgressPageHeader = ({ isRefreshing, onRefresh }: ProgressPageHeaderProps) => {
  return (
    <div className="flex justify-between items-center">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        Your Learning Progress
      </h1>
      
      <Button 
        variant="outline" 
        onClick={onRefresh} 
        disabled={isRefreshing}
        className="flex items-center gap-2"
      >
        {isRefreshing ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Refreshing...
          </>
        ) : (
          <>
            <RefreshCw className="h-4 w-4" />
            Refresh Data
          </>
        )}
      </Button>
    </div>
  );
};

export default ProgressPageHeader;
