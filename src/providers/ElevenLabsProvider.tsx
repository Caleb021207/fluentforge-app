
import React from 'react';
import { createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ElevenLabsContextType {
  apiKey: string | null;
  isLoading: boolean;
}

const ElevenLabsContext = createContext<ElevenLabsContextType>({
  apiKey: null,
  isLoading: true
});

export const useElevenLabs = () => useContext(ElevenLabsContext);

interface ElevenLabsProviderProps {
  children: React.ReactNode;
}

const ElevenLabsProvider: React.FC<ElevenLabsProviderProps> = ({ children }) => {
  // We'll fetch the API key from an environment variable or from Supabase
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchApiKey = async () => {
      try {
        // Try to get the API key from Supabase secrets
        const { data, error } = await supabase.functions.invoke('get-eleven-labs-key', {
          method: 'GET',
        });

        if (error) {
          console.error('Error fetching ElevenLabs API key:', error);
        } else if (data && data.apiKey) {
          setApiKey(data.apiKey);
        }
      } catch (error) {
        console.error('Failed to fetch ElevenLabs API key:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchApiKey();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-lingua-primary"></div>
      </div>
    );
  }

  return (
    <ElevenLabsContext.Provider value={{ apiKey, isLoading }}>
      {children}
    </ElevenLabsContext.Provider>
  );
};

export default ElevenLabsProvider;
