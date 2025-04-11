
import { useEffect } from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useNavigate } from "react-router-dom";
import { getVoiceChatRoute } from "@/utils/languageUtils";

const VoiceChat = () => {
  const { currentLanguage } = useLocalization();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Get the saved target language from localStorage
    const savedTargetLanguage = localStorage.getItem("targetLanguage");
    
    if (savedTargetLanguage) {
      // Get appropriate route based on language direction
      const redirectRoute = getVoiceChatRoute(
        currentLanguage, 
        savedTargetLanguage
      );
      
      if (redirectRoute !== '/voice-chat') {
        console.log(`Redirecting from VoiceChat to ${redirectRoute} based on language settings`);
        navigate(redirectRoute);
      }
    }
  }, [currentLanguage, navigate]);

  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Redirecting to appropriate voice chat...</h1>
        <p className="text-gray-600">
          Please select a language to learn in your settings if you're not automatically redirected.
        </p>
      </div>
    </div>
  );
};

export default VoiceChat;
