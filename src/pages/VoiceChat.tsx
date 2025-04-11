import { useEffect, useState } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useNavigate, Link } from "react-router-dom";
import { getVoiceChatRoute, getLanguagePair, getAvailableTargetLanguages } from "@/utils/languageUtils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const VoiceChat = () => {
  const { currentLanguage, t } = useLocalization();
  const navigate = useNavigate();
  const [isRedirecting, setIsRedirecting] = useState(true);
  const [availableLanguages, setAvailableLanguages] = useState<string[]>([]);
  
  useEffect(() => {
    // Get the saved target language from localStorage
    const savedTargetLanguage = localStorage.getItem("targetLanguage");
    setAvailableLanguages(getAvailableTargetLanguages(currentLanguage));
    
    if (savedTargetLanguage) {
      // Get appropriate route based on language direction
      const redirectRoute = getVoiceChatRoute(
        currentLanguage, 
        savedTargetLanguage
      );
      
      if (redirectRoute !== '/voice-chat') {
        console.log(`Redirecting from VoiceChat to ${redirectRoute} based on language settings`);
        // Short timeout to prevent immediate redirect loops
        const timer = setTimeout(() => {
          navigate(redirectRoute);
        }, 500);
        return () => clearTimeout(timer);
      } else {
        // If we end up with the same route, stop trying to redirect
        setIsRedirecting(false);
      }
    } else {
      // No target language set, stop trying to redirect
      setIsRedirecting(false);
    }
  }, [currentLanguage, navigate]);

  // Generate language-specific links
  const renderLanguageOptions = () => {
    // For English speakers, show options to learn other languages
    if (currentLanguage === "english") {
      return (
        <>
          <h2 className="text-xl font-semibold mb-4">Choose a language to practice:</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            <Link to="/learn-french">
              <Button variant="outline" className="w-full h-16 text-lg">Practice French</Button>
            </Link>
            <Link to="/learn-portuguese">
              <Button variant="outline" className="w-full h-16 text-lg">Practice Portuguese</Button>
            </Link>
            {/* Other languages can be added here */}
          </div>
        </>
      );
    }
    // For French speakers, show option to practice English
    else if (currentLanguage === "french") {
      return (
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Choisissez une langue à pratiquer :</h2>
          <Link to="/french-voice-chat" className="w-full max-w-md">
            <Button className="w-full h-16 text-lg">Pratiquer l'anglais (pour francophones)</Button>
          </Link>
        </div>
      );
    }
    else if (currentLanguage === "portuguese") {
      return (
        <div className="flex flex-col items-center">
          <h2 className="text-xl font-semibold mb-4">Escolha um idioma para praticar:</h2>
          <Link to="/portuguese-voice-chat" className="w-full max-w-md">
            <Button className="w-full h-16 text-lg">Praticar inglês (para falantes de português)</Button>
          </Link>
        </div>
      );
    }
    // Default case
    return (
      <div className="text-center">
        <p className="text-amber-700 mb-4">
          No specific voice chat available for your language combination.
        </p>
        <Link to="/settings">
          <Button>Go to Settings</Button>
        </Link>
      </div>
    );
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[50vh] p-6">
      <div className="w-full max-w-2xl text-center">
        {isRedirecting ? (
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-4">Redirecting to appropriate voice chat...</h1>
            <p className="text-gray-600 mb-6">
              Please wait while we redirect you to the right practice environment.
            </p>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-lingua-primary"></div>
            </div>
          </Card>
        ) : (
          <Card className="p-8">
            <h1 className="text-2xl font-bold mb-4">Voice Chat Practice</h1>
            <p className="text-gray-600 mb-8">
              Please select a language below to practice your speaking skills.
            </p>
            
            {renderLanguageOptions()}
            
            <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-md">
              <p className="text-amber-800 text-sm">
                Tip: You can change your language settings on the <Link to="/settings" className="underline">settings page</Link>.
              </p>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default VoiceChat;
