
import { TranslationRecord } from "../types";

const voiceChatTranslations: TranslationRecord = {
  // Core voice chat functionality
  voiceChatTitle: "음성 채팅",
  voiceChatSubtitle: "AI 튜터와 함께 말하기 연습하기",
  startVoiceChat: "음성 채팅 시작",
  endVoiceChat: "음성 채팅 종료",
  listening: "듣는 중...",
  recording: "녹음 중...",
  processing: "처리 중...",
  microphonePermissionRequired: "마이크 권한이 필요합니다",
  microphonePermissionDenied: "마이크 권한이 거부되었습니다",
  voiceChatActive: "음성 채팅 활성",
  voiceChatInactive: "음성 채팅 비활성",
  speakNow: "지금 말하세요",
  listeningForResponse: "응답을 듣는 중...",
  voiceInputDisabled: "음성 입력 비활성화",
  
  // Practice descriptions and AI info
  practiceDescription: "AI와 실시간 대화를 통해 말하기와 듣기 실력을 향상시키세요.",
  aiModelInfo: "자연어 이해 및 생성을 위해 OpenAI의 GPT-4o-mini를 사용하고, 음성 응답을 위해 브라우저 통합 음성 합성을 사용합니다.",
  
  // Conversation starters
  conversationStarters: "대화 시작하기",
  tryThesePhrases: "대화를 시작하기 위한 문구를 시도해보세요:",
  phrase1: "안녕하세요, 오늘 어떠세요?",
  phrase2: "지금 계신 곳의 날씨는 어떤가요?",
  phrase3: "좋은 식당을 추천해 주실 수 있나요?",
  phrase4: "당신의 취미와 관심사는 무엇인가요?",
  phrase5: "좋아하는 책이나 영화에 대해 말씀해 주세요.",
  phrase6: "지난 주말에 무엇을 하셨나요?",
  phrase7: "내일 계획은 무엇인가요?",
  phrase8: "...을 영어/한국어로 어떻게 말하나요?",
  
  // Practice with voice chat info
  practiceWithVoiceChat: "음성 채팅으로 연습하기",
  useThisTool: "이 도구를 사용하여 말하기와 듣기 능력을 향상시키세요. 몇 가지 팁을 소개합니다:",
  askQuestions: "일상적인 주제에 대해 질문하세요",
  practiceCommonPhrases: "일상적인 문구와 표현을 연습하세요",
  describeWhatYouSee: "주변에 보이는 것을 설명해보세요",
  practiceVocabularyForSpecific: "여행이나 음식과 같은 특정 주제의 어휘를 연습하세요",
  
  // Free practice section
  freePracticeWithVoice: "무료 음성 연습",
  unlimitedVoicePractice: "무제한 음성 연습",
  startSpeaking: "말하기 시작",
  stopListening: "듣기 중지",
  listeningNow: "지금 듣는 중",
  youSaid: "말한 내용",
  aiResponse: "AI 응답",
  playAgain: "다시 재생",
  practiceLanguageTips: "이 도구를 사용하여 말하기와 듣기 능력을 향상시키세요. 몇 가지 팁을 소개합니다:",
  askQuestionsAboutTopics: "일상적인 주제에 대해 질문하세요",
  practiceEverydayPhrases: "일상적인 문구와 표현을 연습하세요",
  describeImagesOrScenes: "주변에 보이는 것을 설명해보세요",
  practiceVocabularyForSpecificTopics: "여행이나 음식과 같은 특정 주제의 어휘를 연습하세요",
  
  // Error handling
  speechRecognitionError: "음성 인식 오류",
  speechRecognitionNotSupported: "브라우저에서 음성 인식이 지원되지 않습니다",
  speechSynthesisNotSupported: "브라우저에서 음성 합성이 지원되지 않습니다",
  speechSynthesisError: "음성 합성 오류가 발생했습니다. 다시 시도해주세요.",
  failedToGetResponse: "AI로부터 응답을 받지 못했습니다. 다시 시도해주세요.",
  failedToGenerateSpeech: "음성 생성에 실패했습니다. 다시 시도해주세요.",
  audioPlaybackError: "오디오 재생 중 오류가 발생했습니다. 다시 시도해주세요.",
  microphoneAccessRequired: "이 기능을 사용하려면 마이크 접근이 필요합니다",
  
  // Additional features
  inYourTargetLanguage: "목표 언어로:",
  inYourNativeLanguage: "모국어로:",
  translation: "번역",
  conversationHistory: "대화 기록",
  clearConversation: "대화 내용 지우기",
  voiceChatEnded: "음성 채팅이 종료되었습니다",
  timeLimit5MinReached: "5분 시간 제한에 도달했습니다",
  speaking: "말하는 중",
  browserBasedTTS: "참고: 이것은 브라우저 기반 텍스트 음성 변환을 사용합니다. ElevenLabs를 통한 프리미엄 음성 품질을 원하시면 프리미엄 음성 채팅을 이용해보세요.",
  
  // Conversation level settings
  conversationLevel: "대화 수준",
  selectLevel: "수준 선택",
  basicLevel: "기초 (A1-A2)",
  intermediateLevel: "중급 (B1)",
  advancedLevel: "고급 (B2-C1)",
  correctGrammar: "문법 교정",
  conversationLevelUpdated: "대화 수준 업데이트됨",
  levelSetTo: "수준 설정:",
  grammarCorrectionEnabled: "문법 교정 활성화됨",
  grammarCorrectionDisabled: "문법 교정 비활성화됨",
  "tutor.willCorrectGrammar": "튜터가 이제 문법 오류를 교정합니다",
  "tutor.wontCorrectGrammar": "튜터가 대화 흐름에 집중합니다",
};

export default voiceChatTranslations;
