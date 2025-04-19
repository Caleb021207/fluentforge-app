
import { getLanguagePair } from "./languageUtils";

export const getPracticeDescription = (currentLanguage: string) => {
  const { practice } = getLanguagePair(currentLanguage);
  
  if (currentLanguage === "english" && practice.toLowerCase() === "french") {
    return `Practice your French speaking skills with our voice chat. Click the microphone button and start speaking in French. The AI will respond to you in French and help you practice.`;
  }
  
  if (currentLanguage === "english") {
    return `Practice your ${practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${practice}. The AI will respond to you in ${practice} and help you practice.`;
  } else if (currentLanguage === "spanish") {
    return `Practica tus habilidades de habla en ${practice} con nuestro chat de voz. Haz clic en el botón del micrófono y comienza a hablar en ${practice}. La IA te responderá y te ayudará a practicar.`;
  } else if (currentLanguage === "portuguese") {
    return `Pratique suas habilidades de fala em ${practice} con nosso chat de voz. Clique no botón do microfone e comece a falar em ${practice}. A IA responderá a você e o ajudará a praticar.`;
  } else if (currentLanguage === "korean") {
    return `저희 음성 채팅으로 ${practice} 말하기 능력을 연습하세요. 마이크 버튼을 클릭하고 ${practice}로 말하기 시작하세요. AI는 ${practice}로 응답하고 연습을 도와드릴 것입니다.`;
  } else if (currentLanguage === "arabic") {
    return `مارس مهارات التحدث باللغة ${practice} من خلال الدردشة الصوتية. انقر على زر الميكروفون وابدأ بالتحدث باللغة ${practice}. سيرد الذكاء الاصطناعي عليك باللغة ${practice} ويساعدك على التدريب.`;
  } else if (currentLanguage === "mandarin") {
    return `使用我们的语音聊天练习您的${practice}口语技能。点击麦克风按钮，开始用${practice}说话。AI将用${practice}回应您并帮助您练习。`;
  } else if (currentLanguage === "vietnamese") {
    return `Luyện tập kỹ năng nói tiếng ${practice} với trò chuyện giọng nói của chúng tôi. Nhấp vào nút micrô và bắt đầu nói bằng tiếng ${practice}. AI sẽ phản hồi bạn bằng tiếng ${practice} và giúp bạn luyện tập.`;
  } else if (currentLanguage === "french") {
    return `Pratiquez vos compétences orales en ${practice} avec notre chat vocal. Cliquez sur le bouton du microphone et commencez à parler en ${practice}. L'IA vous répondra en ${practice} et vous aidera à vous entraîner.`;
  } else if (currentLanguage === "japanese") {
    return `音声チャットで${practice}の会話スキルを練習しましょう。マイクボタンをクリックして${practice}で話し始めてください。AIは${practice}で返答し、あなたの練習をサポートします。`;
  } else if (currentLanguage === "russian") {
    return `Мы используем GPT-4o-mini от OpenAI для понимания и генерации природної мови, с синтезом речи на основе браузера для голосовых відповідей.`;
  } else if (currentLanguage === "ukrainian") {
    return `Ми використовуємо GPT-4o Mini від OpenAI для розуміння та генерації природної мови, з використанням вбудованого в браузер синтезу мовлення для голосових відповідей.`;
  } else if (currentLanguage === "hindi") {
    return `हमारे वॉइस चैट के साथ अपने अंग्रेजी बोलने के कौशल को सुधारने के लिए इस उपकरण का उपयोग करें। यहां कुछ सुझाव दिए गए हैं:`;
  } else if (currentLanguage === "indonesian") {
    return `Latih kemampuan berbicara ${practice} Anda dengan obrolan suara kami. Klik tombol mikrofon dan mulai berbicara dalam bahasa ${practice}. AI akan merespons Anda dalam bahasa ${practice} dan membantu Anda berlatih.`;
  }
  return `Practice your ${practice} speaking skills with our voice chat. Click the microphone button and start speaking in ${practice}.`;
};

export const getAIModelInfoText = (currentLanguage: string) => {
  if (currentLanguage === "english") {
    return "We're using OpenAI's GPT-4o-mini for natural language understanding and generation, with browser's built-in Speech Synthesis for voice responses.";
  } else if (currentLanguage === "spanish") {
    return "Estamos utilizando GPT-4o-mini de OpenAI para la comprensión y generación de lenguaje natural, con la Síntesis de Voz incorporada en el navegador para las respuestas de voz.";
  } else if (currentLanguage === "portuguese") {
    return "Estamos usando o GPT-4o-mini da OpenAI para compreensão e geração de linguagem natural, com a Síntese de Fala incorporada do navegador para respostas de voz.";
  } else if (currentLanguage === "korean") {
    return "자연어 이해 및 생성을 위해 OpenAI의 GPT-4o-mini를 사용하고, 음성 응답을 위해 브라우저의 내장 음성 합성을 사용합니다.";
  } else if (currentLanguage === "arabic") {
    return "نستخدم GPT-4o-mini من OpenAI لفهم وإنشاء اللغة الطبيعية، مع استخدام خاصية تحويل النص إلى كلام المدمجة في المتصفح للردود الصوتية.";
  } else if (currentLanguage === "mandarin") {
    return "我们使用OpenAI的GPT-4o-mini进行自然语言理解和生成，并使用浏览器内置的语音合成功能进行语音回应。";
  } else if (currentLanguage === "vietnamese") {
    return "Chúng tôi sử dụng GPT-4o-mini của OpenAI để hiểu và tạo ngôn ngữ tự nhiên, với tính năng Tổng hợp Giọng nói tích hợp trong trình duyệt cho các phản hồi bằng giọng nói.";
  } else if (currentLanguage === "french") {
    return "Nous utilisons GPT-4o-mini d'OpenAI pour la compréhension et la génération du langage naturel, avec la synthèse vocale intégrée au navigateur pour les réponses vocales.";
  } else if (currentLanguage === "japanese") {
    return "自然言語理解と生成にはOpenAIのGPT-4o-miniを使用し、音声応答にはブラウザ内蔵の音声合成を使用しています。";
  } else if (currentLanguage === "russian") {
    return "Мы используем GPT-4o-mini от OpenAI для понимания и генерации природної мови, с синтезом речи на основе браузера для голосовых відповідей.";
  } else if (currentLanguage === "ukrainian") {
    return "Ми використовуємо GPT-4o Mini від OpenAI для розуміння та генерації природної мови, з використанням вбудованого в браузер синтезу мовлення для голосових відповідей.";
  } else if (currentLanguage === "hindi") {
    return "हमारे वॉइस चैट के साथ अपने अंग्रेजी बोलने के कौशल को सुधारने के लिए इस उपकरण का उपयोग करें। यहां कुछ सुझाव दिए गए हैं:";
  } else if (currentLanguage === "indonesian") {
    return "Kami menggunakan GPT-4o-mini dari OpenAI untuk pemahaman dan generasi bahasa alami, dengan Sintesis Suara bawaan browser untuk respons suara.";
  }
  return "Using OpenAI's GPT-4o-mini with browser's built-in Speech Synthesis.";
};

export const getBrowserTTSNote = () => {
  return "Note: This uses browser-based text-to-speech. For premium voice quality with ElevenLabs, try our Premium Voice Chat.";
};

export const getPracticeLevelText = () => {
  return "Practice Level";
};

export const getAIModelLabelText = () => {
  return "AI Model:";
};
