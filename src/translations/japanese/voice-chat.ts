
import { TranslationRecord } from "../types";

const voiceChatTranslations: TranslationRecord = {
  // Core voice chat functionality
  voiceChatTitle: "音声チャット",
  voiceChatSubtitle: "AIチューターと話して練習する",
  startVoiceChat: "音声チャットを開始",
  endVoiceChat: "音声チャットを終了",
  listening: "聞いています...",
  recording: "録音中...",
  processing: "処理中...",
  microphonePermissionRequired: "マイクの許可が必要です",
  microphonePermissionDenied: "マイクの許可が拒否されました",
  voiceChatActive: "音声チャットアクティブ",
  voiceChatInactive: "音声チャット非アクティブ",
  speakNow: "今話してください",
  listeningForResponse: "応答を聞いています...",
  voiceInputDisabled: "音声入力が無効です",
  startSpeaking: "話し始める",
  stopListening: "聞くのを止める",
  
  // Practice descriptions and AI info - FIXED
  practiceDescription: "リアルタイムでAIと会話して、スピーキングとリスニングのスキルを向上させましょう。",
  aiModelInfo: "自然言語理解と生成にはOpenAIのGPT-4o-miniを、音声応答にはブラウザ内蔵の音声合成を使用しています。",
  
  // Conversation starters
  conversationStarters: "会話のスターター",
  tryThesePhrases: "会話を始めるためにこれらのフレーズを試してください：",
  phrase1: "こんにちは、今日はいかがですか？",
  phrase2: "あなたのところの天気はどうですか？",
  phrase3: "良いレストランをおすすめしてもらえますか？",
  phrase4: "あなたの趣味や興味は何ですか？",
  phrase5: "お気に入りの本や映画について教えてください。",
  phrase6: "先週末は何をしましたか？",
  phrase7: "明日の予定は何ですか？",
  phrase8: "...はスペイン語/英語で何と言いますか？",
  
  // Practice with voice chat info
  practiceWithVoiceChat: "音声チャットで練習",
  useThisTool: "このツールを使ってスピーキングとリスニングのスキルを向上させましょう。以下にヒントがあります：",
  askQuestions: "日常的な話題について質問する",
  practiceCommonPhrases: "一般的なフレーズや表現を練習する",
  describeWhatYouSee: "周りに見えるものを説明する",
  practiceVocabularyForSpecific: "旅行や食べ物などの特定の話題の語彙を練習する"
};

export default voiceChatTranslations;
