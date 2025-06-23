
import { TranslationRecord } from "../types";
import chineseCoreTranslations from "./core";
import chinesePracticeTranslations from "./practice";

// Create voice chat translations for Chinese
const chineseVoiceChatTranslations: TranslationRecord = {
  // Voice chat page
  "freePracticeWithVoice": "免费语音练习",
  "startSpeaking": "开始说话",
  "listeningNow": "正在聆听",
  "youSaid": "您说了",
  "aiResponse": "AI回应",
  "conversationStarters": "对话开始语",
  "tryThesePhrases": "尝试这些短语开始对话：",
  "practiceWithVoiceChat": "使用语音聊天练习",
  "useThisTool": "使用此工具改善您的口语和听力技能。以下是一些建议：",
  "askQuestionsAboutTopics": "询问日常话题",
  "practiceEverydayPhrases": "练习常用短语和表达",
  "describeWhatYouSee": "描述您周围看到的事物",
  "practiceVocabularyForSpecific": "练习特定主题的词汇，如旅行或食物",
  "responseSuggestions": "回应建议",
  "clickPlayToHear": "点击播放听发音",
  "startConversationToSee": "开始对话查看建议",
  
  // Conversation phrases
  "phrase1": "你好，你今天怎么样？",
  "phrase2": "你那里的天气怎么样？",
  "phrase3": "你能推荐一家好餐厅吗？",
  "phrase4": "你的爱好和兴趣是什么？",
  "phrase5": "告诉我你最喜欢的书或电影。",
  "phrase6": "你上个周末做了什么？",
  "phrase7": "你明天有什么计划？",
  "phrase8": "...用英语怎么说？",
  
  // Additional voice chat functionality
  "askQuestions": "询问日常话题",
  "practiceCommonPhrases": "练习常用短语和表达",
  "browserBasedTTS": "注意：这使用基于浏览器的文本转语音。如需ElevenLabs的优质语音质量，请尝试我们的高级语音聊天。",
  "voiceChatEnded": "语音聊天结束",
  "remaining": "剩余",
  "failedToGetResponse": "无法获取回应",
  "speechRecognitionError": "语音识别错误",
  "speechRecognitionNotSupported": "您的浏览器不支持语音识别",
  "microphoneAccessRequired": "需要麦克风访问权限",
  "failedToGenerateSpeech": "无法生成语音",
  "stopListening": "停止聆听"
};

// Complete Chinese translations with voice chat and practice integration
const chineseTranslations: TranslationRecord = {
  ...chineseCoreTranslations,
  ...chineseVoiceChatTranslations,
  ...chinesePracticeTranslations
};

export default chineseTranslations;
