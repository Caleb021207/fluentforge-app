
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "memberi suara pada kata-kata",
  yourPersonalAICompanion: "Pendamping AI pribadi Anda",
  startPracticing: "Mulai Berlatih",
  practiceYourLanguageSkills: "Latih keterampilan bahasa Anda",
  swipeUpToGetStarted: "Geser ke atas untuk memulai",
  getStarted: "Mulai",
  selectYourLanguagePreferences: "Pilih preferensi bahasa Anda",

  // Language selection
  selectNativeLanguage: "Pilih bahasa ibu Anda",
  iSpeak: "Saya berbicara",
  saveLanguagePreferences: "Simpan preferensi bahasa",

  // Auth
  signIn: "Masuk",
  signUp: "Daftar",
  signInToContinue: "Masuk untuk melanjutkan",
  createAccountToGetStarted: "Buat akun untuk memulai",
  email: "Email",
  password: "Kata sandi",
  accessPasscode: "Kode akses",
  dontHaveAccount: "Belum punya akun?",
  alreadyHaveAccount: "Sudah punya akun?",

  // Header
  loggedInAs: "Masuk sebagai",
  signedInAs: "Masuk sebagai",
  logout: "Keluar",
  lightMode: "Mode terang",

  // Navigation
  home: "Beranda",
  practice: "Latihan",
  textPractice: "Latihan teks",
  unlimitedVoicePracticeNav: "Latihan suara tanpa batas",
  pronunciationPracticeNav: "Latihan pelafalan",
  aiAnalysis: "Analisis AI",
  profile: "Profil",
  settings: "Pengaturan",

  // Practice page
  englishPractice: "Latihan bahasa Inggris",
  startChatting: "Mulai ngobrol",
  startConversationIn: "Mulai percakapan dalam {{language}}",
  fixGrammar: "Perbaiki tata bahasa",
  correctGrammar: "Perbaiki tata bahasa",
  clearConversation: "Hapus percakapan",
  startTextChat: "Mulai obrolan teks",
  startTextChatting: "Mulai obrolan teks",
  typeMessageBelow: "Ketik pesan di bawah ini",
  typeMessageToPractice: "Ketik pesan untuk latihan {{language}}...",
  send: "Kirim",

  // Practice Guide
  practiceGuide: "Panduan latihan {{language}}",
  practiceGuideTitle: "Panduan latihan {{language}}",
  practiceGuideDescription: "Berikut beberapa tips untuk latihan {{language}} yang efektif:",
  practiceGuideIntro: "Berikut beberapa tips untuk latihan {{language}} yang efektif:",
  practiceGuideTip1: "Cobalah berbicara dalam kalimat lengkap, meskipun sederhana.",
  practiceGuideTip2: "Jangan takut membuat kesalahan — itu bagian dari pembelajaran!",
  practiceGuideTip3: "Ajukan pertanyaan jika ada yang tidak dipahami.",
  practiceGuideTip4: "Gunakan kata-kata yang baru dipelajari.",
  practiceGuideTip5: "AI akan menyesuaikan dengan tingkat kemampuan Anda.",

  // Practice tips - using t() keys
  practiceTip1: "Cobalah berbicara dalam kalimat lengkap, meskipun sederhana.",
  practiceTip2: "Jangan takut membuat kesalahan — itu bagian dari pembelajaran!",
  practiceTip3: "Ajukan pertanyaan jika ada yang tidak dipahami.",
  practiceTip4: "Gunakan kata-kata yang baru dipelajari.",
  practiceTip5: "AI akan menyesuaikan dengan tingkat kemampuan Anda.",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "Cobalah berbicara dalam kalimat lengkap, meskipun sederhana.",
  "Don't worry about mistakes — they're part of learning!": "Jangan takut membuat kesalahan — itu bagian dari pembelajaran!",
  "Ask for explanations if there's something you don't understand.": "Ajukan pertanyaan jika ada yang tidak dipahami.",
  "Use words you've learned recently.": "Gunakan kata-kata yang baru dipelajari.",
  "Our AI will adapt to your skill level and gradually help you improve.": "AI akan menyesuaikan dengan tingkat kemampuan Anda dan membantu peningkatan secara bertahap.",
  "Here are some tips to get the most out of your {{language}} practice:": "Berikut beberapa tips untuk memaksimalkan latihan {{language}} Anda:",

  // Hint button
  suggestionResponses: "Saran respons",
  responseSuggestions: "Saran respons",
  clickPlayToHearPronunciation: "Klik putar untuk mendengar pelafalan",
  startConversationForSuggestions: "Mulai percakapan untuk mendapatkan saran",
  startConversationToSeeSuggestions: "Mulai percakapan untuk melihat saran",
  getResponseSuggestions: "Dapatkan saran respons",
  greetings: "Salam",
  questions: "Pertanyaan",
  error: "Kesalahan",
  couldNotGenerateHints: "Tidak dapat membuat petunjuk",
  failedToPlayAudio: "Gagal memutar audio",
  play: "Putar",

  // Voice chat
  unlimitedVoicePractice: "Latihan suara tanpa batas",
  practiceDescription: "Deskripsi latihan",
  aiModelInfo: "Info Model AI: OpenAI GPT-4o-mini untuk pemahaman dan pembuatan bahasa alami, sintesis suara browser untuk respons suara.",
  practiceLevel: "Tingkat latihan",
  intermediatePracticeLevel: "Menengah — dapat membahas topik familiar",
  "Intermediate - Can discuss familiar topics": "Menengah — dapat membahas topik familiar",

  // CEFR Level Descriptions
  cefrB1Description: "Menengah — dapat membahas topik familiar",
  cefrA1Description: "Pemula — frasa dan ekspresi dasar",
  cefrA2Description: "Dasar — komunikasi harian sederhana",
  cefrB2Description: "Menengah atas — dapat berkomunikasi dengan lancar",

  currentLanguage: "Bahasa saat ini",
  practiceLanguage: "Bahasa latihan",
  startSpeaking: "Mulai berbicara",
  stopListening: "Berhenti mendengar",
  listeningNow: "Sedang mendengar",
  youSaid: "Anda berkata",
  conversationStarters: "Awalan percakapan",
  howToStartConversation: "Cara memulai percakapan",
  tryThesePhrases: "Coba frasa-frasa ini:",
  conversationStarter1: "Halo, apa kabar hari ini?",
  conversationStarter2: "Bagaimana cuaca di tempat Anda?",
  conversationStarter3: "Bisakah Anda merekomendasikan restoran yang bagus?",
  conversationStarter4: "Apa hobi dan minat Anda?",
  conversationStarter5: "Ceritakan tentang buku atau film favorit Anda.",
  conversationStarter6: "Apa yang Anda lakukan akhir pekan lalu?",
  conversationStarter7: "Apa rencana Anda untuk besok?",
  conversationStarter8: "Bagaimana cara mengatakan... dalam Bahasa Spanyol/Inggris?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "Halo, apa kabar hari ini?",
  "What's the weather like where you are?": "Bagaimana cuaca di tempat Anda?",
  "Can you recommend a good restaurant?": "Bisakah Anda merekomendasikan restoran yang bagus?",
  "What are your hobbies and interests?": "Apa hobi dan minat Anda?",
  "Tell me about your favorite book or movie.": "Ceritakan tentang buku atau film favorit Anda.",
  "What did you do last weekend?": "Apa yang Anda lakukan akhir pekan lalu?",
  "What are your plans for tomorrow?": "Apa rencana Anda untuk besok?",
  "How do you say... in Spanish/English?": "Bagaimana cara mengatakan... dalam Bahasa Spanyol/Inggris?",

  practiceWithVoiceChat: "Berlatih dengan obrolan suara",
  voiceChatTips: "Gunakan alat ini untuk meningkatkan kemampuan berbicara dan mendengar. Berikut beberapa tips:",
  voiceTip1: "Ajukan pertanyaan tentang topik sehari-hari",
  voiceTip2: "Latih frasa dan ekspresi umum",
  voiceTip3: "Deskripsikan apa yang Anda lihat di sekitar",
  voiceTip4: "Latih kosakata untuk topik spesifik seperti perjalanan atau makanan",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "Gunakan alat ini untuk meningkatkan kemampuan berbicara dan mendengar. Berikut beberapa tips:",
  "Ask questions about everyday topics": "Ajukan pertanyaan tentang topik sehari-hari",
  "Practice common phrases and expressions": "Latih frasa dan ekspresi umum",
  "Describe what you see around you": "Deskripsikan apa yang Anda lihat di sekitar",
  "Practice vocabulary for specific topics like travel or food": "Latih kosakata untuk topik spesifik seperti perjalanan atau makanan",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "Mulai berbicara untuk melihat transkrip",
  clickMicrophoneToStartRecording: "Klik mikrofon untuk mulai merekam",

  // Premium Voice Chat
  premiumVoiceChat: "Obrolan Suara Premium",
  premiumVoiceChatBenefits: "Manfaat Obrolan Suara Premium",
  premiumVoiceChatDescription: "Latih {{practice}} melalui percakapan suara alami dengan tutor AI premium! AI akan membantu memperbaiki tata bahasa, kosakata, dan pelafalan.",
  premiumVoiceNote: "Obrolan suara premium terbatas 10 menit per minggu",
  premiumVoiceNoteWithReset: "Obrolan suara premium memungkinkan 10 menit latihan per minggu. Waktu reset setiap Senin jam 6 pagi (Waktu Tengah).",
  benefitNaturalVoice: "Interaksi suara alami mirip manusia menggunakan teknologi ElevenLabs",
  benefitAccentPronunciation: "Aksen dan pelafalan akurat untuk pembelajaran yang mendalam",
  benefitRegularPractice: "10 menit latihan per minggu, reset Senin jam 6 pagi",

  // Pronunciation practice
  pronunciationPractice: "Latihan pelafalan",
  improvePronunciationSkillsWith: "Tingkatkan kemampuan pelafalan dengan latihan terarah",
  selectComplexityLevel: "Pilih tingkat kompleksitas",
  chooseDifficultyLevelBasedOn: "Pilih tingkat kesulitan berdasarkan kemampuan bahasa Anda",
  speechRate: "Kecepatan bicara",
  selectLevelToStart: "Pilih tingkat untuk memulai latihan",
  startExercise: "Mulai latihan",
  pronunciationPracticeTips: "Tips latihan pelafalan",
  listenCarefullyTip: "Dengarkan dengan seksama sebelum berbicara",
  payAttentionToStressTip: "Perhatikan tekanan dan intonasi",
  practiceDifficultSoundsTip: "Latih suara sulit berkali-kali",
  recordYourselfTip: "Rekam diri Anda dan bandingkan dengan penutur asli",
  bePatientTip: "Bersabarlah — peningkatan pelafalan butuh waktu",
  practiceExercise: "Latihan",
  topic: "Topik",
  listenToPhrase: "Dengarkan frasa",
  clickWordToHear: "Klik kata untuk mendengar",
  yourPronunciation: "Pelafalan Anda",
  startRecording: "Mulai merekam",
  clickStartToRecord: "Klik 'Mulai' untuk merekam",
  tryAgain: "Coba lagi",
  newPhrase: "Frasa baru",
  generatingExercise: "Membuat latihan",
  generatingNewPhrase: "Membuat frasa baru",
  levelDescription: "Deskripsi tingkat",
  failedToGeneratePhrase: "Gagal membuat frasa",
  noSpeechDetected: "Tidak ada ucapan terdeteksi",
  pleaseTryAgain: "Silakan coba lagi",
  failedToAnalyzePronunciation: "Gagal menganalisis pelafalan",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "Umpan balik pelafalan",
  accuracyScore: "Skor akurasi",
  intonationScore: "Skor intonasi",
  fluencyScore: "Skor kelancaran",
  complexityScore: "Skor kompleksitas",
  wordAnalysis: "Analisis kata",
  phonemeAnalysis: "Analisis fonem",
  overallFeedback: "Umpan balik keseluruhan",
  excellent: "Sangat baik",
  good: "Baik",
  fair: "Cukup",
  needsImprovement: "Perlu perbaikan",

  // Additional UI elements
  processing: "Memproses",
  stopRecording: "Hentikan perekaman",
  listeningToYou: "Mendengarkan Anda",
  realTimeTranscription: "Transkripsi waktu nyata",
  yourTranscription: "Transkripsi Anda",
  playing: "Memutar",

  // Complexity levels
  novice: "Pemula",
  intermediate: "Menengah",
  advanced: "Lanjutan",
  superior: "Ahli",
  noviceLevelDescription: "Dapat menangani topik dasar dan familiar",
  intermediateLevelDescription: "Dapat membahas hal-hal yang familiar",
  advancedLevelDescription: "Dapat menangani topik kompleks dengan percaya diri",
  superiorLevelDescription: "Dapat melakukan semua tugas bahasa",
  noviceLevelShortDescription: "Frasa sederhana",
  intermediateLevelShortDescription: "Topik familiar",
  advancedLevelShortDescription: "Topik kompleks",
  superiorLevelShortDescription: "Semua tugas",

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
