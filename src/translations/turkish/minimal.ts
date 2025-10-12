
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "Dil öğrenmeye hoş geldiniz",
  yourPersonalAICompanion: "Kişisel yapay zeka dil öğrenme yardımcınız",
  startPracticing: "Uygulamaya Başla",
  practiceYourLanguageSkills: "Dil becerilerini uygula",
  swipeUpToGetStarted: "Başlamak için yukarı kaydırın",
  getStarted: "Başla",
  selectYourLanguagePreferences: "Dil tercihlerinizi seçin",

  // Language selection
  selectNativeLanguage: "Ana dilinizi seçin",
  iSpeak: "Ben konuşuyorum",
  saveLanguagePreferences: "Dil tercihlerini kaydet",

  // Auth
  signIn: "Giriş yap",
  signUp: "Kayıt ol",
  signInToContinue: "Devam etmek için giriş yapın",
  createAccountToGetStarted: "Başlamak için hesap oluşturun",
  email: "E-posta",
  password: "Şifre",
  accessPasscode: "Erişim kodu",
  dontHaveAccount: "Hesabınız yok mu?",
  alreadyHaveAccount: "Zaten hesabınız var mı?",

  // Header
  loggedInAs: "Giriş yaptı",
  signedInAs: "Giriş yaptı",
  logout: "Çıkış yap",
  lightMode: "Açık mod",

  // Navigation
  home: "Ana sayfa",
  practice: "Pratik",
  textPractice: "Metin pratiği",
  unlimitedVoicePracticeNav: "Sınırsız sesli pratik",
  pronunciationPracticeNav: "Telaffuz pratiği",
  aiAnalysis: "Yapay Zeka Analizi",
  profile: "Profil",
  settings: "Ayarlar",

  // Practice page
  englishPractice: "İngilizce pratiği",
  startChatting: "Sohbete başla",
  startConversationIn: "{{language}} dilinde konuşmaya başla",
  fixGrammar: "Dil bilgisi düzelt",
  correctGrammar: "Dil bilgisi düzelt",
  clearConversation: "Sohbeti temizle",
  startTextChat: "Metin sohbeti başlat",
  startTextChatting: "Metin sohbetine başla",
  typeMessageBelow: "Mesajınızı aşağıya yazın",
  typeMessageToPractice: "{{language}} pratiği için mesaj yazın...",
  send: "Gönder",

  // Practice Guide
  practiceGuide: "{{language}} pratik rehberi",
  practiceGuideTitle: "{{language}} pratik rehberi",
  practiceGuideDescription: "Etkili {{language}} pratiği için bazı yararlı ipuçları:",
  practiceGuideIntro: "Etkili {{language}} pratiği için bazı yararlı ipuçları:",
  practiceGuideTip1: "Basit olsalar bile tam cümleler kurmaya çalışın.",
  practiceGuideTip2: "Hatalar konusunda endişelenmeyin — öğrenmenin bir parçası!",
  practiceGuideTip3: "Anlamadığınız bir şey varsa açıklama isteyin.",
  practiceGuideTip4: "Son öğrendiğiniz kelimeleri kullanın.",
  practiceGuideTip5: "Yapay zekamız beceri seviyenize uyum sağlayacak.",

  // Practice tips - using t() keys
  practiceTip1: "Basit olsalar bile tam cümleler kurmaya çalışın.",
  practiceTip2: "Hatalar konusunda endişelenmeyin — öğrenmenin bir parçası!",
  practiceTip3: "Anlamadığınız bir şey varsa açıklama isteyin.",
  practiceTip4: "Son öğrendiğiniz kelimeleri kullanın.",
  practiceTip5: "Yapay zekamız beceri seviyenize uyum sağlayacak.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "Basit olsalar bile tam cümleler kurmaya çalışın.",
  "Don't worry about mistakes — they're part of learning!": "Hatalar konusunda endişelenmeyin — öğrenmenin bir parçası!",
  "Ask for explanations if there's something you don't understand.": "Anlamadığınız bir şey varsa açıklama isteyin.",
  "Use words you've learned recently.": "Son öğrendiğiniz kelimeleri kullanın.",
  "Our AI will adapt to your skill level and gradually help you improve.": "Yapay zekamız beceri seviyenize uyum sağlayacak ve kademeli olarak gelişmenize yardımcı olacak.",
  "Here are some tips to get the most out of your {{language}} practice:": "{{language}} pratiğinizden en iyi şekilde yararlanmak için bazı ipuçları:",

  // Hint button
  suggestionResponses: "Önerilen yanıtlar",
  responseSuggestions: "Yanıt önerileri",
  clickPlayToHearPronunciation: "Telaffuzu duymak için oynat'a tıklayın",
  startConversationForSuggestions: "Önerileri görmek için konuşmaya başlayın",
  startConversationToSeeSuggestions: "Önerileri görmek için konuşmaya başlayın",
  getResponseSuggestions: "Yanıt önerileri al",
  greetings: "Selamlamalar",
  questions: "Sorular",
  error: "Hata",
  couldNotGenerateHints: "İpuçları oluşturulamadı",
  failedToPlayAudio: "Ses çalınamadı",
  play: "Oynat",

  // Voice chat
  unlimitedVoicePractice: "Sınırsız sesli pratik",
  practiceDescription: "Pratik açıklaması",
  aiModelInfo: "Yapay Zeka Modeli Bilgisi: Doğal dil anlama ve üretimi için OpenAI GPT-4o-mini, sesli yanıtlar için tarayıcı TTS.",
  practiceLevel: "Pratik seviyesi",
  intermediatePracticeLevel: "Orta — tanıdık konularda konuşabilir",
  "Intermediate - Can discuss familiar topics": "Orta — tanıdık konularda konuşabilir",

  // CEFR Level Descriptions
  cefrB1Description: "Orta — tanıdık konularda konuşabilir",
  cefrA1Description: "Başlangıç — temel cümleler ve ifadeler",
  cefrA2Description: "Temel — basit günlük konuşmalar",
  cefrB2Description: "Üst orta — kolayca iletişim kurabilir",

  currentLanguage: "Geçerli dil",
  practiceLanguage: "Pratik dili",
  startSpeaking: "Konuşmaya başla",
  stopListening: "Dinlemeyi durdur",
  listeningNow: "Şimdi dinliyorum",
  youSaid: "Sen dedin ki",
  conversationStarters: "Sohbet başlatıcılar",
  howToStartConversation: "Konuşmaya nasıl başlanır",
  tryThesePhrases: "Bu ifadeleri deneyin:",
  conversationStarter1: "Merhaba! Bugün nasılsın?",
  conversationStarter2: "Nerede olduğun yerde hava nasıl?",
  conversationStarter3: "İyi bir restoran önerebilir misin?",
  conversationStarter4: "Hobilerin ve ilgi alanların neler?",
  conversationStarter5: "En sevdiğin kitap ya da film hakkında anlat.",
  conversationStarter6: "Geçen hafta sonu ne yaptın?",
  conversationStarter7: "Yarın için planların neler?",
  conversationStarter8: "... İngilizce/İspanyolca'da nasıl söylenir?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "Merhaba, bugün nasılsın?",
  "What's the weather like where you are?": "Nerede olduğun yerde hava nasıl?",
  "Can you recommend a good restaurant?": "İyi bir restoran önerebilir misin?",
  "What are your hobbies and interests?": "Hobilerin ve ilgi alanların neler?",
  "Tell me about your favorite book or movie.": "En sevdiğin kitap ya da film hakkında anlat.",
  "What did you do last weekend?": "Geçen hafta sonu ne yaptın?",
  "What are your plans for tomorrow?": "Yarın için planların neler?",
  "How do you say... in Spanish/English?": "... İspanyolca/İngilizce'de nasıl söylenir?",

  practiceWithVoiceChat: "Sesli sohbet ile pratik yap",
  voiceChatTips: "Konuşma ve dinleme becerilerinizi geliştirmek için bu aracı kullanın. İşte bazı ipuçları:",
  voiceTip1: "Günlük konular hakkında sorular sorun",
  voiceTip2: "Yaygın ifadeleri ve deyimleri pratik edin",
  voiceTip3: "Çevrenizdeki gördüklerinizi tanımlayın",
  voiceTip4: "Seyahat ya da yemek gibi belirli konular için kelime dağarcığı pratiği yapın",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "Konuşma ve dinleme becerilerinizi geliştirmek için bu aracı kullanın. İşte bazı ipuçları:",
  "Ask questions about everyday topics": "Günlük konular hakkında sorular sorun",
  "Practice common phrases and expressions": "Yaygın ifadeleri ve deyimleri pratik edin",
  "Describe what you see around you": "Çevrenizdeki gördüklerinizi tanımlayın",
  "Practice vocabulary for specific topics like travel or food": "Seyahat ya da yemek gibi belirli konular için kelime dağarcığı pratiği yapın",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "Transkripti görmek için konuşmaya başlayın",
  clickMicrophoneToStartRecording: "Kayda başlamak için mikrofona tıklayın",

  // Premium Voice Chat
  premiumVoiceChat: "Premium Sesli Sohbet",
  premiumVoiceChatBenefits: "Premium Sesli Sohbet Avantajları",
  premiumVoiceChatDescription: "Premium yapay zeka öğretmeniyle doğal sesli konuşmada {{practice}} pratiği yapın! Yapay zeka dilbilginizi, kelime dağarcığınızı ve telaffuzunuzu geliştirmenize yardımcı olacak.",
  premiumVoiceNote: "Premium Sesli Sohbet haftalık 10 dakika ile sınırlıdır",
  premiumVoiceNoteWithReset: "Premium Sesli Sohbet haftalık 10 dakika pratiğe izin verir. Süre her Pazartesi sabahı 6:00'da (Merkezi Saat) yenilenir.",
  benefitNaturalVoice: "ElevenLabs teknolojisi ile insan benzeri doğal sesli etkileşim",
  benefitAccentPronunciation: "Derinlemesine öğrenme için hassas telaffuz ve aksan",
  benefitRegularPractice: "Haftalık 10 dakika pratik, Pazartesi sabahı 6:00'da yenilenir",

  // Pronunciation practice
  pronunciationPractice: "Telaffuz pratiği",
  improvePronunciationSkillsWith: "Hedefli alıştırmalarla telaffuz becerilerinizi geliştirin",
  selectComplexityLevel: "Zorluk seviyesini seçin",
  chooseDifficultyLevelBasedOn: "Dil yeterliliğinize göre zorluk seviyesini seçin",
  speechRate: "Konuşma hızı",
  selectLevelToStart: "Alıştırmayı başlatmak için seviye seçin",
  startExercise: "Alıştırmaya başla",
  pronunciationPracticeTips: "Telaffuz pratiği ipuçları",
  listenCarefullyTip: "Konuşmadan önce dikkatle dinleyin",
  payAttentionToStressTip: "Vurgu ve tonlamaya dikkat edin",
  practiceDifficultSoundsTip: "Zor sesleri tekrar tekrar pratik edin",
  recordYourselfTip: "Kendinizi kaydedin ve ana dil konuşanlarıyla karşılaştırın",
  bePatientTip: "Sabırlı olun — telaffuz geliştirme zaman alır",
  practiceExercise: "Pratik alıştırması",
  topic: "Konu",
  listenToPhrase: "İfadeyi dinleyin",
  clickWordToHear: "Sesi duymak için kelimeye tıklayın",
  yourPronunciation: "Senin telaffuzun",
  startRecording: "Kayda başla",
  clickStartToRecord: "Kaydetmek için 'Başla'ya tıklayın",
  tryAgain: "Tekrar dene",
  newPhrase: "Yeni ifade",
  generatingExercise: "Alıştırma oluşturuluyor",
  generatingNewPhrase: "Yeni ifade oluşturuluyor",
  levelDescription: "Seviye açıklaması",
  failedToGeneratePhrase: "İfade oluşturulamadı",
  noSpeechDetected: "Konuşma algılanmadı",
  pleaseTryAgain: "Lütfen tekrar deneyin",
  failedToAnalyzePronunciation: "Telaffuz analizi başarısız",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "Telaffuz geri bildirimi",
  accuracyScore: "Doğruluk puanı",
  intonationScore: "Tonlama puanı",
  fluencyScore: "Akıcılık puanı",
  complexityScore: "Karmaşıklık puanı",
  wordAnalysis: "Kelime analizi",
  phonemeAnalysis: "Fonem analizi",
  overallFeedback: "Genel geri bildirim",
  excellent: "Mükemmel",
  good: "İyi",
  fair: "Orta",
  needsImprovement: "Geliştirilmeli",

  // Additional UI elements
  processing: "İşleniyor",
  stopRecording: "Kaydı durdur",
  listeningToYou: "Sizi dinliyorum",
  realTimeTranscription: "Gerçek zamanlı transkripsiyon",
  yourTranscription: "Transkripsiyon",
  playing: "Oynatılıyor",

  // Complexity levels
  novice: "Yeni başlayan",
  intermediate: "Orta",
  advanced: "İleri",
  superior: "Üst düzey",
  noviceLevelDescription: "Temel ve tanıdık konularla başa çıkabilir",
  intermediateLevelDescription: "Tanıdık konuları tartışabilir",
  advancedLevelDescription: "Karmaşık konuları güvenle ele alabilir",
  superiorLevelDescription: "Tüm dil işlevlerini yerine getirebilir",
  noviceLevelShortDescription: "Basit cümleler",
  intermediateLevelShortDescription: "Tanıdık konular",
  advancedLevelShortDescription: "Karmaşık konular",
  superiorLevelShortDescription: "Tüm işlevler",

  // Transcript Analysis - English placeholders as requested
  progressOverview: "Progress Overview",
  trackLanguageLearningJourney: "Track Language Learning Journey",
  aiProgressAnalysis: "AI Progress Analysis",
  uploadLanguageTestTranscripts: "Upload language test transcripts",
  totalAnalyses: "Total Analyses",
  currentLevel: "Current Level",
  latestScore: "Latest Score",
  uploadAndAnalyze: "Upload and Analyze",
  analysisResults: "Analysis Results",
  progressTimeline: "Progress Timeline",
  firstTest: "First Test",
  latestTest: "Latest Test",
  improvement: "Improvement"
};

export default minimalTranslations;
