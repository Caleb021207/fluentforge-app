
import React from "react";

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-start">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex space-x-2">
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.2s]" />
          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
