
import React from "react";
import { ElevenLabsProvider as ElevenLabsProviderBase } from "@11labs/react";

export const ElevenLabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <ElevenLabsProviderBase apiKey={import.meta.env.VITE_ELEVEN_LABS_API_KEY || ""}>
      {children}
    </ElevenLabsProviderBase>
  );
};
