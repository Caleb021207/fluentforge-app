
import { TranslationRecord } from "../types";

const premiumVoiceTranslations: TranslationRecord = {
  premiumVoiceChat: "Trò chuyện bằng giọng nói cao cấp",
  premiumVoiceChatBenefits: "Lợi ích giọng nói cao cấp",
  textConversationPractice: "Thực hành hội thoại văn bản",
  cefrA1Description: "Sơ cấp - Cụm từ và biểu đạt cơ bản",
  cefrA2Description: "Cơ bản - Giao tiếp hàng ngày đơn giản",
  cefrB1Description: "Trung cấp - Có thể thảo luận về các chủ đề quen thuộc",
  cefrB2Description: "Trung cấp cao - Có thể giao tiếp với sự trôi chảy",
  beginner: "Sơ cấp",
  elementary: "Cơ bản",
  intermediate: "Trung cấp",
  upperIntermediate: "Trung cấp cao",
  selectCEFRLevel: "Chọn cấp độ CEFR",
  selectedLevel: "Cấp độ đã chọn",
  
  // Fixed premium voice chat cooldown messages
  cooldownPeriodActive: "Đã đạt giới hạn hàng tuần",
  cooldownActive: "Đã đạt giới hạn hàng tuần",
  waitBeforeNextSession: "Bạn cần đợi trước khi bắt đầu phiên khác",
  cooldownPeriodDescription: "Bạn cần đợi {{time}} trước khi bắt đầu phiên trò chuyện bằng giọng nói cao cấp khác.",
  resetsAt6AM: "Thời gian 15 phút hàng tuần của bạn sẽ được làm mới sau {{time}} (Thứ Hai lúc 6:00 sáng)",
  dailyLimitReached: "Bạn đã sử dụng hết 15 phút hàng tuần. Thời gian sẽ được làm mới vào thứ Hai lúc 6:00 sáng.",
  
  // Login related messages
  loginRequired: "Yêu cầu đăng nhập",
  pleaseLoginToAccessPremiumFeature: "Vui lòng đăng nhập để truy cập tính năng trò chuyện bằng giọng nói cao cấp",
  redirectingToLogin: "Đang chuyển hướng đến trang đăng nhập",
  failedToStartSession: "Không thể bắt đầu phiên",
  failedToCreateSession: "Không thể tạo phiên",
  loginRequiredDescription: "Để truy cập tính năng trò chuyện bằng giọng nói cao cấp, vui lòng đăng nhập vào tài khoản của bạn.",
  
  // Success messages
  conversationHistoryCleared: "Lịch sử cuộc trò chuyện đã được xóa",
  remaining: "còn lại tuần này",
  
  // Premium voice benefits
  premiumVoiceChatDescription: "Trò chuyện tự nhiên với gia sư AI cao cấp của chúng tôi để luyện tập {{practice}}! AI sẽ giúp bạn sửa ngữ pháp, từ vựng và phát âm.",
  premiumVoiceNote: "Sử dụng trò chuyện bằng giọng nói cao cấp giới hạn ở một phiên 15 phút mỗi tuần",
  premiumVoiceNoteWithReset: "Trò chuyện bằng giọng nói cao cấp cho phép 15 phút thời gian luyện tập hàng tuần. Thời gian của bạn được làm mới mỗi thứ Hai lúc 6:00 sáng theo giờ Trung tâm.",
  benefitNaturalVoice: "Tương tác giọng nói tự nhiên, giống con người sử dụng công nghệ ElevenLabs",
  benefitAccentPronunciation: "Giọng điệu và phát âm chính xác để học tập chìm đắm",
  benefitRegularPractice: "15 phút thời gian luyện tập hàng tuần, làm mới mỗi thứ Hai lúc 6:00 sáng theo giờ Trung tâm",

  // Added voice chat controls
  startVoiceChat: "Bắt đầu trò chuyện bằng giọng nói",
  stopVoiceChat: "Dừng trò chuyện bằng giọng nói",
  voiceChatEnded: "Trò chuyện bằng giọng nói đã kết thúc",
  timeLimit5MinReached: "Đã đạt đến giới hạn thời gian 15 phút",
  speaking: "Đang nói...",
  startChatting: "Bắt đầu trò chuyện"
};

export default premiumVoiceTranslations;
