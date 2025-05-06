
import { TranslationRecord } from "../types";

const voiceChatTranslations: TranslationRecord = {
  // Voice chat page
  "practiceDescription": "使用我們的語音聊天練習說英語。點擊麥克風按鈕並開始用英語說話。",
  "aiModelInfo": "AI模型：我們使用OpenAI GPT-4o-mini，配合Meta MMS進行TTS。",
  "practiceLevel": "練習水平：B1 – 中級 – 能夠討論熟悉的話題",
  "cefrB1Description": "中級 – 能夠討論熟悉的話題",
  
  // Voice chat controls
  "startSpeaking": "開始說話",
  "stopListening": "停止聆聽",
  "listeningNow": "正在聆聽",
  
  // Conversation features
  "conversationStarters": "對話開始語",
  "tryThesePhrases": "嘗試使用這些短語開始對話",
  "conversationHistory": "對話歷史",
  "clearConversation": "清除對話",
  
  // Phrases for conversation
  "phrase1": "你好，今天過得怎麼樣？",
  "phrase2": "那邊的天氣怎麼樣？",
  "phrase3": "你能推薦一家好餐廳嗎？",
  "phrase4": "你有什麼愛好和興趣？",
  "phrase5": "告訴我你最喜歡的書或電影。",
  "phrase6": "上個週末你做了什麼？",
  "phrase7": "明天你有什麼計劃？",
  "phrase8": "用英語/西班牙語怎麼說...？",
  
  // Error messages
  "speechRecognitionError": "語音識別錯誤",
  "speechRecognitionNotSupported": "你的瀏覽器不支持語音識別",
  "microphoneAccessRequired": "需要麥克風訪問權限",
  "failedToGenerateSpeech": "無法生成語音音頻",
  "browserBasedTTS": "請注意：我們使用Meta MMS和Azure提供文字轉語音服務。",
  "startConversationIn": "用{language}開始對話",
  "youSaid": "你說了",
  "aiResponse": "AI回應",
  "speaking": "正在說話",
  "playAgain": "再次播放",
  "translation": "翻譯",
  "conversationHistoryCleared": "對話歷史已清除",
  "success": "成功"
};

export default voiceChatTranslations;
