
import React from "react";

interface ErrorMessageProps {
  message: string;
}

export const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return (
    <div className="flex mb-4">
      <div className="bg-destructive/10 text-destructive p-3 rounded-lg max-w-[80%]">
        <div className="font-medium mb-1">Error</div>
        <div>{message}</div>
      </div>
    </div>
  );
};
