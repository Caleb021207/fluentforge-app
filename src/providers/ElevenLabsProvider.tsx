
import React from 'react';
import { supabase } from '@/integrations/supabase/client';

interface ElevenLabsProviderProps {
  children: React.ReactNode;
}

const ElevenLabsProvider: React.FC<ElevenLabsProviderProps> = ({ children }) => {
  const [apiKey, setApiKey] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    const fetchApiKey = async () => {
      try {
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

  if (!apiKey) {
    console.warn('ElevenLabs API key not available. Voice features will be limited.');
  }

  // Simply pass the API key through React context for components to use 
  // via Window API since @11labs/react will look for it there
  if (apiKey && typeof window !== 'undefined') {
    (window as any).ELEVEN_LABS_API_KEY = apiKey;
  }

  return <>{children}</>;
};

export default ElevenLabsProvider;
