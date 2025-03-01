
import React from "react";
import { Loader2 } from "lucide-react";

const LoadingProgress = () => {
  return (
    <div className="flex justify-center items-center min-h-[400px]">
      <Loader2 className="h-8 w-8 animate-spin text-lingua-primary" />
    </div>
  );
};

export default LoadingProgress;
