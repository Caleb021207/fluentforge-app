
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";

export const usePromptGenerator = () => {
  const { currentLanguage } = useLocalization();

  const generateLanguageLearningPrompt = () => {
    const { native, practice } = getLanguagePair(currentLanguage);
    
    // For English speakers, customize prompts based on target language
    if (currentLanguage === "english") {
      // Get target language from localStorage
      const targetLanguage = localStorage.getItem("targetLanguage") || "spanish";
      
      // French-specific prompts for English speakers
      if (targetLanguage === "french") {
        return "Hello! I'd like to practice French conversation. Can you help me learn some common phrases and vocabulary?";
      }
      
      // Default prompt for other languages (Spanish, etc.)
      return `Hello! I'd like to practice ${practice}. Can you help me with a conversation?`;
    }
    
    // For non-English speakers learning English
    const promptsByLanguage: Record<string, string> = {
      spanish: "¡Hola! Me gustaría practicar inglés. ¿Podemos tener una conversación?",
      portuguese: "Olá! Eu gostaria de praticar inglês. Podemos ter uma conversa?",
      korean: "안녕하세요! 영어를 연습하고 싶습니다. 대화를 나눌 수 있을까요?",
      arabic: "مرحبًا! أود أن أمارس اللغة الإنجليزية. هل يمكننا إجراء محادثة؟",
      mandarin: "你好！我想练习英语。我们可以进行对话吗？",
      vietnamese: "Xin chào! Tôi muốn thực hành tiếng Anh. Chúng ta có thể trò chuyện không?",
      japanese: "こんにちは！英語を練習したいです。会話をしていただけますか？",
      ukrainian: "Привіт! Я хотів би попрактикувати англійську. Можемо поговорити?",
      russian: "Привет! Я хотел бы попрактиковаться в английском. Можем ли мы поговорить?",
      hindi: "नमस्ते! मैं अंग्रेज़ी का अभ्यास करना चाहूंगा। क्या हम बातचीत कर सकते हैं?",
      indonesian: "Halo! Saya ingin berlatih bahasa Inggris. Bisakah kita mengobrol?",
      french: "Bonjour! J'aimerais pratiquer l'anglais. Pouvons-nous avoir une conversation?"
    };
    
    return promptsByLanguage[currentLanguage] || `Hello, I would like to practice ${practice}.`;
  };

  return {
    generateLanguageLearningPrompt
  };
};
