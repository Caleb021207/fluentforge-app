
import React from "react";

interface UserMessageProps {
  message: string;
}

export const UserMessage: React.FC<UserMessageProps> = ({ message }) => {
  return (
    <div className="flex justify-end mb-4">
      <div className="bg-primary text-primary-foreground p-3 rounded-lg max-w-[80%]">
        {message}
      </div>
    </div>
  );
};
