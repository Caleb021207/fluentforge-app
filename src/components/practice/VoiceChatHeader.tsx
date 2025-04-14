
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { getLanguagePair } from "@/utils/languageUtils";

interface VoiceChatHeaderProps {
  description?: string;
  browserTTSNote?: string;
  aiModelInfo?: string;
}

const VoiceChatHeader: React.FC<VoiceChatHeaderProps> = ({
  description,
  browserTTSNote,
  aiModelInfo
}) => {
  const { t, currentLanguage } = useLocalization();
  const targetLanguage = localStorage.getItem("targetLanguage");

  const getPracticeDescription = () => {
    if (description) return description;
    
    const { practice } = getLanguagePair(currentLanguage, targetLanguage || undefined);
    
    if (currentLanguage === "english") {
      return `Practice your ${practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${practice}. The AI will respond to you in ${practice} and help you practice.`;
    } else if (currentLanguage === "spanish") {
      return `Practica tus habilidades de habla en ${practice} con nuestro chat de voz. Haz clic en el botón del micrófono y comienza a hablar en ${practice}. La IA te responderá y te ayudará a practicar.`;
    } else if (currentLanguage === "portuguese") {
      return `Pratique suas habilidades de fala em ${practice} con nosso chat de voz. Clique no botón do microfone e comece a falar em ${practice}. A IA responderá a você e o ajudará a praticar.`;
    } else if (currentLanguage === "mandarin") {
      return `使用我们的语音聊天练习您的${practice}口语技能。点击麦克风按钮，开始用${practice}说话。AI将用${practice}回应您并帮助您练习。`;
    } else if (currentLanguage === "vietnamese") {
      return `Luyện tập kỹ năng nói tiếng ${practice} với trò chuyện giọng nói của chúng tôi. Nhấp vào nút micrô và bắt đầu nói bằng tiếng ${practice}. AI sẽ phản hồi bạn bằng tiếng ${practice} và giúp bạn luyện tập.`;
    } else if (currentLanguage === "french") {
      return `Pratiquez vos compétences orales en ${practice} avec notre chat vocal. Cliquez sur le bouton du microphone et commencez à parler en ${practice}. L'IA vous répondra en ${practice} et vous aidera à vous entraîner.`;
    } else if (currentLanguage === "japanese") {
      return `音声チャットで${practice}の会話スキルを練習しましょう。マイクボタンをクリックして${practice}で話し始めてください。AIは${practice}で返答し、あなたの練習をサポートします。`;
    } else if (currentLanguage === "russian") {
      return `Практикуйте свои разговорные навыки на английском языке с помощью нашего голосового чата. Нажмите на кнопку микрофона и начните говорить на английском. ИИ ответит вам на английском и поможет вам практиковаться.`;
    } else if (currentLanguage === "hindi") {
      return `हमारे वॉइस चैट के साथ अपने अंग्रेजी बोलने के कौशल को सुधारने के लिए इस उपकरण का उपयोग करें। यहां कुछ सुझाव दिए गए हैं:`;
    } else if (currentLanguage === "indonesian") {
      return `Latih kemampuan berbicara ${practice} Anda dengan obrolan suara kami. Klik tombol mikrofon dan mulai berbicara dalam bahasa ${practice}. AI akan merespons Anda dalam bahasa ${practice} dan membantu Anda berlatih.`;
    }
    return `Practice your ${practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${practice}.`;
  };

  const getAIModelLabelText = () => {
    switch (currentLanguage) {
      case "english": return "AI Model:";
      case "spanish": return "Modelo de IA:";
      case "portuguese": return "Modelo de IA:";
      case "korean": return "AI 모델:";
      case "arabic": return "نموذج الذكاء الاصطناعي:";
      case "mandarin": return "AI模型：";
      case "vietnamese": return "Mô hình AI:";
      case "french": return "Modèle d'IA :";
      case "japanese": return "AIモデル：";
      case "russian": return "Модель ИИ:";
      case "ukrainian": return "Модель ШІ:";
      case "hindi": return "AI मॉडल:";
      case "indonesian": return "Model AI:";
      default: return "AI Model:";
    }
  };

  const getAIModelInfoText = () => {
    if (aiModelInfo) return aiModelInfo;
    
    if (currentLanguage === "english") {
      return "We're using OpenAI's GPT-4o-mini for natural language understanding and generation, with browser's built-in Speech Synthesis for voice responses.";
    } else if (currentLanguage === "spanish") {
      return "Estamos utilizando GPT-4o-mini de OpenAI para la comprensión y generación de lenguaje natural, con la Síntesis de Voz incorporada en el navegador para las respuestas de voz.";
    } else if (currentLanguage === "portuguese") {
      return "Estamos usando o GPT-4o-mini da OpenAI para compreensão e geração de linguagem natural, com a Síntese de Fala incorporada do navegador para respostas de voz.";
    } else if (currentLanguage === "mandarin") {
      return "我们使用OpenAI的GPT-4o-mini进行自然语言理解和生成，并使用浏览器内置的语音合成功能进行语音回应。";
    } else if (currentLanguage === "vietnamese") {
      return "Chúng tôi sử dụng GPT-4o-mini của OpenAI để hiểu và tạo ngôn ngữ tự nhiên, với tính năng Tổng hợp Giọng nói tích hợp trong trình duyệt cho các phản hồi bằng giọng nói.";
    } else if (currentLanguage === "french") {
      return "Nous utilisons GPT-4o-mini d'OpenAI pour la compréhension et la gnération du langage naturel, avec la synthèse vocale intégrée au navigateur pour les réponses vocales.";
    } else if (currentLanguage === "japanese") {
      return "自然言語理解と生成にはOpenAIのGPT-4o-miniを使用し、音声応答にはブラウザ内蔵の音声合成を使用しています。";
    } else if (currentLanguage === "russian") {
      return "Мы используем GPT-4o-mini от OpenAI для понимания и генерации природної мови, с синтезом речи на основе браузера для голосовых відповідей.";
    } else if (currentLanguage === "hindi") {
      return "हमारे वॉइस चैट के साथ अपने अंग्रेजी बोलने के कौशल को सुधारने के लिए इस उपकरण का उपयोग करें। यहां कुछ सुझाव दिए गए हैं:";
    } else if (currentLanguage === "indonesian") {
      return "Latih kemampuan berbicara ${getLanguagePair(currentLanguage).practice} Anda dengan obrolan suara kami. Klik tombol mikrofon dan mulai berbicara dalam bahasa ${getLanguagePair(currentLanguage).practice}. AI akan merespons Anda dalam bahasa ${getLanguagePair(currentLanguage).practice} dan membantu Anda berlatih.";
    }
    return "Using OpenAI's GPT-4o-mini with browser's built-in Speech Synthesis.";
  };

  const getBrowserTTSNote = () => {
    if (browserTTSNote) return browserTTSNote;
    
    if (currentLanguage === "english") {
      return "Note: This uses browser-based text-to-speech. For premium voice quality with ElevenLabs, try our Premium Voice Chat.";
    } else if (currentLanguage === "spanish") {
      return "Nota: Esto utiliza la síntesis de voz basada en el navegador. Para una calidad de voz premium con ElevenLabs, prueba nuestro Chat de Voz Premium.";
    } else if (currentLanguage === "portuguese") {
      return "Nota: Isso usa síntese de fala baseada no navegador. Para qualidade de voz premium com ElevenLabs, experimente nosso Chat de Voz Premium.";
    } else if (currentLanguage === "mandarin") {
      return "注意：这使用基于浏览器的文本转语音。如需获得ElevenLabs的高级语音质量，请尝试高级语音聊天。";
    } else if (currentLanguage === "vietnamese") {
      return "Lưu ý: Tính năng này sử dụng chuyển văn bản thành giọng nói dựa trên trình duyệt. Để có chất lượng giọng nói cao cấp với ElevenLabs, hãy thử Trò chuyện bằng giọng nói cao cấp của chúng tôi.";
    } else if (currentLanguage === "french") {
      return "Remarque : Ce système utilise la synthèse vocale basée sur le navigateur. Pour une qualité vocale premium avec ElevenLabs, essayez notre Chat Vocal Premium.";
    } else if (currentLanguage === "japanese") {
      return "注意：これはブラウザベースの音声合成を使用しています。ElevenLabsによるプレミアム音声品質については、プレミアム音声チャットをお試しください。";
    } else if (currentLanguage === "russian") {
      return "Примечание: Эта система использует синтез речи на основе браузера. Для премильного качества голоса от ElevenLabs, попробуйте наш премиум голосовой чат.";
    } else if (currentLanguage === "hindi") {
      return "नोट: यह ब्राउज़र-आधारित टेक्स्ट-टू-स्पीच का उपयोग करता है। ElevenLabs के साथ प्रीमियम आवाज़ की गुणवत्ता के लिए, हमारे प्रीमियम वॉइस चैट का प्रयास करें।";
    } else if (currentLanguage === "indonesian") {
      return "Catatan: Ini menggunakan text-to-speech berbasis browser. Untuk kualitas suara premium dengan ElevenLabs, coba Obrolan Suara Premium kami.";
    }
    return t("browserBasedTTS") || "Note: This uses browser-based text-to-speech.";
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-lingua-text mb-4">
        {t("unlimitedVoicePractice")}
      </h1>
      <p className="text-gray-600 mb-4">
        {getPracticeDescription()}
      </p>
      <p className="text-sm text-gray-500 mb-2">
        <strong>{getAIModelLabelText()}</strong> {getAIModelInfoText()}
      </p>
      <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-4">
        <p className="text-amber-800 text-sm">
          {getBrowserTTSNote()}
        </p>
      </div>
    </div>
  );
};

export default VoiceChatHeader;
