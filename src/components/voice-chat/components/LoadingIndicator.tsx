
import React from "react";

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex justify-center my-6">
      <div className="flex space-x-2">
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce" />
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
        <div className="w-3 h-3 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
      </div>
    </div>
  );
};

export default LoadingIndicator;
