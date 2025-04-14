
import React from "react";
import { ConversationProvider } from "@11labs/react";

export const ElevenLabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ConversationProvider apiKey={import.meta.env.VITE_ELEVEN_LABS_API_KEY || ""}>
      {children}
    </ConversationProvider>
  );
};
