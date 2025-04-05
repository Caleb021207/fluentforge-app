
import React from "react";
import { useLocalization } from "@/context/LocalizationContext";
import { useLanguagePair } from "../hooks/useLanguagePair";

const VoiceChatHeader: React.FC = () => {
  const { t, currentLanguage } = useLocalization();
  const { getLanguagePair } = useLanguagePair();
  
  const getPracticeDescription = () => {
    if (currentLanguage === "english") {
      return `Practice your ${getLanguagePair().practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${getLanguagePair().practice}. The AI will respond to you in ${getLanguagePair().practice} and help you practice.`;
    } else if (currentLanguage === "spanish") {
      return `Practica tus habilidades de habla en ${getLanguagePair().practice} con nuestro chat de voz. Haz clic en el botón del micrófono y comienza a hablar en ${getLanguagePair().practice}. La IA te responderá y te ayudará a practicar.`;
    } else if (currentLanguage === "portuguese") {
      return `Pratique suas habilidades de fala em ${getLanguagePair().practice} com nosso chat de voz. Clique no botón do microfone e comece a falar em ${getLanguagePair().practice}. A IA responderá a você e o ajudará a praticar.`;
    } else if (currentLanguage === "korean") {
      return `저희 음성 채팅으로 ${getLanguagePair().practice} 말하기 능력을 연습하세요. 마이크 버튼을 클릭하고 ${getLanguagePair().practice}로 말하기 시작하세요. AI가 ${getLanguagePair().practice}로 응답하고 연습을 도와드릴 것입니다.`;
    } else if (currentLanguage === "arabic") {
      return `مارس مهارات التحدث باللغة ${getLanguagePair().practice} من خلال الدردشة الصوتية. انقر على زر الميكروفون وابدأ بالتحدث باللغة ${getLanguagePair().practice}. سيرد الذكاء الاصطناعي عليك باللغة ${getLanguagePair().practice} ويساعدك على التدريب.`;
    } else if (currentLanguage === "mandarin") {
      return `使用我们的语音聊天练习您的${getLanguagePair().practice}口语技能。点击麦克风按钮，开始用${getLanguagePair().practice}说话。AI将用${getLanguagePair().practice}回应您并帮助您练习。`;
    } else if (currentLanguage === "vietnamese") {
      return `Luyện tập kỹ năng nói tiếng ${getLanguagePair().practice} với trò chuyện giọng nói của chúng tôi. Nhấp vào nút micrô và bắt đầu nói bằng tiếng ${getLanguagePair().practice}. AI sẽ phản hồi bạn bằng tiếng ${getLanguagePair().practice} và giúp bạn luyện tập.`;
    } else if (currentLanguage === "french") {
      return `Pratiquez vos compétences orales en ${getLanguagePair().practice} avec notre chat vocal. Cliquez sur le bouton du microphone et commencez à parler en ${getLanguagePair().practice}. L'IA vous répondra en ${getLanguagePair().practice} et vous aidera à vous entraîner.`;
    } else if (currentLanguage === "japanese") {
      return `音声チャットで${getLanguagePair().practice}の会話スキルを練習しましょう。マイクボタンをクリックして${getLanguagePair().practice}で話し始めてください。AIは${getLanguagePair().practice}で返答し、あなたの練習をサポートします。`;
    } else if (currentLanguage === "russian") {
      return `Практикуйте свои разговорные навыки на английском языке с помощью нашего голосового чата. Нажмите на кнопку микрофона и начните говорить на английском. ИИ ответит вам на английском и поможет вам практиковаться.`;
    }
    return `Practice your ${getLanguagePair().practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${getLanguagePair().practice}.`;
  };

  const getAIModelInfoText = () => {
    if (currentLanguage === "english") {
      return "AI Model: We're using OpenAI's GPT-4o-mini for natural language understanding and generation, with browser's built-in Speech Synthesis for voice responses.";
    } else if (currentLanguage === "spanish") {
      return "Modelo de IA: Estamos utilizando GPT-4o-mini de OpenAI para la comprensión y generación de lenguaje natural, con la Síntesis de Voz incorporada en el navegador para las respuestas de voz.";
    } else if (currentLanguage === "portuguese") {
      return "Modelo de IA: Estamos usando o GPT-4o-mini da OpenAI para compreensão e geração de linguagem natural, com a Síntese de Fala incorporada do navegador para respostas de voz.";
    } else if (currentLanguage === "korean") {
      return "AI 모델: 자연어 이해 및 생성을 위해 OpenAI의 GPT-4o-mini를 사용하고, 음성 응답을 위해 브라우저의 내장 음성 합성을 사용합니다.";
    } else if (currentLanguage === "arabic") {
      return "نموذج الذكاء الاصطناعي: نستخدم GPT-4o-mini من OpenAI لفهم وإنشاء اللغة الطبيعية، مع استخدام خاصية تحويل النص إلى كلام المدمجة في المتصفح للردود الصوتية.";
    } else if (currentLanguage === "mandarin") {
      return "AI模型：我们使用OpenAI的GPT-4o-mini进行自然语言理解和生成，并使用浏览器内置的语音合成功能进行语音回应。";
    } else if (currentLanguage === "vietnamese") {
      return "Mô hình AI: Chúng tôi sử dụng GPT-4o-mini của OpenAI để hiểu và tạo ngôn ngữ tự nhiên, với tính năng Tổng hợp Giọng nói tích hợp trong trình duyệt cho các phản hồi bằng giọng nói.";
    } else if (currentLanguage === "french") {
      return "Modèle d'IA : Nous utilisons GPT-4o-mini d'OpenAI pour la compréhension et la génération du langage naturel, avec la synthèse vocale intégrée au navigateur pour les réponses vocales.";
    } else if (currentLanguage === "japanese") {
      return "AIモデル：自然言語理解と生成にはOpenAIのGPT-4o-miniを使用し、音声応答にはブラウザ内蔵の音声合成を使用しています。";
    } else if (currentLanguage === "russian") {
      return "Модель ИИ: Мы используем GPT-4o-mini от OpenAI для понимания и генерации естественного языка, с синтезом речи на основе браузера для голосовых ответов.";
    }
    return "AI Model: Using OpenAI's GPT-4o-mini with browser's built-in Speech Synthesis.";
  };

  const getBrowserTTSNote = () => {
    if (currentLanguage === "arabic") {
      return "ملاحظة: هذا يستخدم تحويل النص إلى كلام المستند إلى المتصفح. للحصول على جودة صوت متميزة مع ElevenLabs، جرب الدردشة الصوتية المتميزة.";
    } else if (currentLanguage === "korean") {
      return t("browserBasedTTS");
    } else if (currentLanguage === "english") {
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
      return "Примечание: Эта система использует синтез речи на основе браузера. Для премиального качества голоса от ElevenLabs, попробуйте наш премиум голосовой чат.";
    }
    return t("browserBasedTTS");
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
        <strong>{currentLanguage === "english" ? "AI Model:" : currentLanguage === "spanish" ? "Modelo de IA:" : currentLanguage === "portuguese" ? "Modelo de IA:" : currentLanguage === "korean" ? "AI 모델:" : currentLanguage === "arabic" ? "نموذج الذكاء الاصطناعي:" : currentLanguage === "vietnamese" ? "Mô hình AI:" : currentLanguage === "french" ? "Modèle d'IA :" : currentLanguage === "japanese" ? "AIモデル：" : currentLanguage === "russian" ? "Модель ИИ:" : "AI模型："}</strong> {getAIModelInfoText()}
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
