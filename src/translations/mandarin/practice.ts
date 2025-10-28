
import { TranslationRecord } from "../types";

const practiceTranslations: TranslationRecord = {
  // Practice page core
  practice: "练习",
  practiceWithAI: "与AI练习",
  startChatting: "开始聊天",
  clearConversation: "清除对话",
  correctGrammar: "纠正语法",
  
  // Chat interface with proper interpolation
  startConversationIn: "开始{{language}}对话",
  startTextChatting: "开始文本聊天",
  
  // Practice guide with proper interpolation
  practiceGuide: "{{language}}练习指南",
  practiceGuideDescription: "遵循这些提示，让您的{{language}}学习之旅更加轻松：",
  practiceTip1: "尝试形成完整的句子，即使很简单。",
  practiceTip2: "不要担心犯错误——它们是学习的一部分！",
  practiceTip3: "如果您不理解某些内容，请寻求解释。",
  practiceTip4: "使用您最近学到的词汇。",
  practiceTip5: "我们的AI将适应您的技能水平，并逐渐帮助您改进。",
  
  // Chat interface
  typeYourMessageHere: "在此输入您的消息...",
  typeMessageBelow: "在下方输入消息",
  chatPlaceholder: "输入您的消息以练习{{targetLanguage}}...",
  practicePrompt: "您好！我想练习{{targetLanguage}}对话。请通过纠正我的{{targetLanguage}}语法、词汇和用法来帮助我。我们可以从基本对话开始吗？",
  
  // Pronunciation practice
  pronunciationPractice: "发音练习",
  improvePronunciationSkillsWith: "通过有针对性的练习提高您的发音技能",
  selectComplexityLevel: "选择复杂程度",
  chooseDifficultyLevelBasedOn: "根据您的语言能力选择难度级别",
  selectLevelToStart: "选择级别开始练习",
  pronunciationPracticeTips: "发音练习提示",
  speechRate: "语速",
  
  // Pronunciation tips
  listenCarefullyTip: "在尝试说话之前仔细聆听音频",
  payAttentionToStressTip: "注意重音模式和语调",
  practiceDifficultSoundsTip: "多次练习困难的声音",
  recordYourselfTip: "录制自己并与母语人士比较",
  bePatientTip: "要有耐心——发音改进需要时间",
  
  // Pronunciation exercise interface
  practiceExercise: "练习练习",
  topic: "主题",
  listenToPhrase: "听短语",
  playing: "播放中",
  clickWordToHear: "点击单词来听",
  tryAgain: "再试一次",
  newPhrase: "新短语",
  generatingNewPhrase: "生成新短语",
  startExercise: "开始练习",
  generatingExercise: "生成练习",
  levelDescription: "级别描述",
  
  // Pronunciation recording and feedback
  yourPronunciation: "您的发音",
  startRecording: "开始录音",
  clickStartToRecord: "点击开始录音",
  listeningToYou: "正在聆听您",
  processing: "处理中",
  realTimeTranscription: "实时转录",
  yourTranscription: "您的转录",
  
  // Pronunciation feedback scores
  excellent: "优秀",
  good: "良好",
  fair: "一般",
  needsImprovement: "需要改进",
  accuracyScore: "准确度分数",
  intonationScore: "语调分数",
  fluencyScore: "流利度分数",
  complexityScore: "复杂度分数",
  wordAnalysis: "单词分析",
  phonemeAnalysis: "音素分析",
  overallFeedback: "总体反馈",
  
  // Complexity levels
  novice: "新手",
  intermediate: "中级",
  advanced: "高级",
  superior: "优秀",
  noviceLevelShortDescription: "基本单词和短语",
  intermediateLevelShortDescription: "简单句子和对话",
  advancedLevelShortDescription: "复杂表达和想法",
  superiorLevelShortDescription: "精湛的语言使用",
  
  // Voice chat
  startVoiceConversation: "开始语音对话",
  endVoiceConversation: "结束语音对话",
  voiceChatActive: "语音聊天活动",
  
  // Progress and analysis
  aiProgressAnalysis: "AI进度分析",
  uploadLanguageTestTranscripts: "上传语言测试成绩单",
  totalAnalyses: "总分析",
  currentLevel: "当前级别",
  latestScore: "最新分数",
  uploadAndAnalyze: "上传并分析",
  analysisResults: "分析结果",
  progressTimeline: "进度时间线",
  uploadTestTranscript: "上传测试成绩单",
  uploadLanguageTestScoreReport: "上传语言测试分数报告",
  noFileChosen: "未选择文件",
  dragDropOrClickToUpload: "拖放或点击上传",
  supportsFileFormats: "支持JPEG、PNG、WebP和PDF文件，最大10MB",
  selectFile: "选择文件",
  whatOurAiCanAnalyze: "我们的AI可以分析什么：",
  overallScoresAndCefrLevels: "• 总分和CEFR级别",
  individualSkillBreakdowns: "• 个人技能细分",
  strengthsAndAreasForImprovement: "• 优势和需要改进的领域",
  progressTrackingOverTime: "• 随时间跟踪进度",
  
  // Analysis page specific translations
  latestAnalysisResults: "最新分析结果",
  detailedAnalysis: "详细分析",
  analysisBreakdown: "分析细分",
  strengths: "优势",
  areasForImprovement: "需要改进的领域",
  aiRecommendations: "AI建议",
  analysisHistory: "分析历史",
  yourPreviousAnalysisResults: "您以前的分析结果",
  analysisComplete: "分析完成",
  transcriptAnalyzedSuccessfully: "您的成绩单已成功分析！",
  
  // Hint button interface translations
  responseSuggestions: "回复建议",
  clickPlayToHearPronunciation: "点击播放听发音",
  startConversationForSuggestions: "开始对话以查看建议",
  getResponseSuggestions: "获取回复建议",
  analyzeConversation: "分析对话",
  analyzing: "分析中",
  analysisLimitReached: "已达分析限制",
  canOnlyAnalyzeOncePerSession: "每次会话只能分析一次对话，以防止刷经验值。开始新的练习会话以再次分析。",
  conversationAnalysis: "对话分析",
  grammarAccuracy: "语法准确性",
  complexity: "复杂度",
  
  // Skill names (standardized)
  reading: "阅读",
  writing: "写作",
  speaking: "口语",
  listening: "听力",
  overallLevel: "总体水平",
  
  // Practice mode selection
  startPracticing: "开始练习",
  practiceYourLanguageSkills: "练习你的语言技能",
  choosePracticeMode: "选择练习模式",
  typeAndChat: "与您的AI导师打字聊天",
  speakAndListen: "在自然对话中说话和聆听",
  improvePronunciation: "通过有针对性的练习提高您的发音"
};

export default practiceTranslations;
