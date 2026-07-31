
import React from "react";
import TutorAvatar from "./chat-message/TutorAvatar";

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex items-end justify-start gap-2.5">
      <TutorAvatar />
      <div className="rounded-2xl rounded-bl-md border border-border/60 bg-card/80 px-4 py-3.5 shadow-sm">
        <div className="flex space-x-2">
          <div className="h-2 w-2 rounded-full bg-brand-sky animate-bounce" />
          <div className="h-2 w-2 rounded-full bg-brand-azure animate-bounce [animation-delay:0.2s]" />
          <div className="h-2 w-2 rounded-full bg-brand-mint animate-bounce [animation-delay:0.4s]" />
        </div>
      </div>
    </div>
  );
};

export default LoadingIndicator;
