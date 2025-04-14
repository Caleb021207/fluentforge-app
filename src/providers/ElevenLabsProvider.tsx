
import React from "react";
import { Provider } from "@11labs/react";

export const ElevenLabsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <Provider apiKey={import.meta.env.VITE_ELEVEN_LABS_API_KEY || ""}>
      {children}
    </Provider>
  );
};
