
import { TranslationRecord } from "../types";

const minimalTranslations: TranslationRecord = {
  // Home page
  welcomeToLanguageLearning: "ยินดีต้อนรับสู่การเรียนรู้ภาษา",
  yourPersonalAICompanion: "ผู้ช่วย AI ส่วนตัวของคุณ",
  startPracticing: "เริ่มฝึกฝน",
  practiceYourLanguageSkills: "ฝึกทักษะภาษาของคุณ",
  swipeUpToGetStarted: "ปัดขึ้นเพื่อเริ่มต้น",
  getStarted: "เริ่มต้น",
  selectYourLanguagePreferences: "เลือกการตั้งค่าภาษาของคุณ",

  // Language selection
  selectNativeLanguage: "เลือกภาษาหลักของคุณ",
  iSpeak: "ฉันพูด",
  saveLanguagePreferences: "บันทึกการตั้งค่าภาษา",

  // Auth
  signIn: "เข้าสู่ระบบ",
  signUp: "สมัครสมาชิก",
  signInToContinue: "เข้าสู่ระบบเพื่อดำเนินการต่อ",
  createAccountToGetStarted: "สร้างบัญชีเพื่อเริ่มต้น",
  email: "อีเมล",
  password: "รหัสผ่าน",
  accessPasscode: "รหัสผ่านการเข้าใช้งาน",
  dontHaveAccount: "ยังไม่มีบัญชี?",
  alreadyHaveAccount: "มีบัญชีแล้ว?",

  // Header
  loggedInAs: "เข้าสู่ระบบในชื่อ",
  signedInAs: "เข้าสู่ระบบในชื่อ",
  logout: "ออกจากระบบ",
  lightMode: "โหมดสว่าง",

  // Navigation
  home: "หน้าหลัก",
  practice: "ฝึกฝน",
  textPractice: "ฝึกข้อความ",
  unlimitedVoicePracticeNav: "ฝึกพูดไม่จำกัด",
  pronunciationPracticeNav: "ฝึกการออกเสียง",
  aiAnalysis: "การวิเคราะห์ AI",
  profile: "โปรไฟล์",
  settings: "การตั้งค่า",

  // Practice page
  englishPractice: "ฝึกภาษาอังกฤษ",
  startChatting: "เริ่มแชท",
  startConversationIn: "เริ่มสนทนาในภาษา {{language}}",
  fixGrammar: "แก้ไวยากรณ์",
  correctGrammar: "แก้ไวยากรณ์",
  clearConversation: "ล้างการสนทนา",
  startTextChat: "เริ่มแชทข้อความ",
  startTextChatting: "เริ่มแชทข้อความ",
  typeMessageBelow: "พิมพ์ข้อความด้านล่าง",
  typeMessageToPractice: "พิมพ์ข้อความเพื่อฝึกฝนในภาษา {{language}}...",
  send: "ส่ง",

  // Practice Guide
  practiceGuide: "คู่มือฝึกฝน {{language}}",
  practiceGuideTitle: "คู่มือฝึกฝน {{language}}",
  practiceGuideDescription: "เคล็ดลับที่เป็นประโยชน์สำหรับการฝึกฝน {{language}} อย่างมีประสิทธิภาพ:",
  practiceGuideIntro: "เคล็ดลับที่เป็นประโยชน์สำหรับการฝึกฝน {{language}} อย่างมีประสิทธิภาพ:",
  practiceGuideTip1: "พยายามสร้างประโยคสมบูรณ์ แม้ว่าจะง่าย ๆ ก็ตาม",
  practiceGuideTip2: "ไม่ต้องกังวลเกี่ยวกับข้อผิดพลาด — พวกมันเป็นส่วนหนึ่งของการเรียนรู้!",
  practiceGuideTip3: "ขอคำอธิบายหากมีสิ่งที่คุณไม่เข้าใจ",
  practiceGuideTip4: "ใช้คำที่คุณเพิ่งเรียนรู้เมื่อเร็ว ๆ นี้",
  practiceGuideTip5: "AI ของเราจะปรับให้เข้ากับระดับทักษะของคุณ",

  // Practice tips - using t() keys
  practiceTip1: "พยายามสร้างประโยคสมบูรณ์ แม้ว่าจะง่าย ๆ ก็ตาม",
  practiceTip2: "ไม่ต้องกังวลเกี่ยวกับข้อผิดพลาด — พวกมันเป็นส่วนหนึ่งของการเรียนรู้!",
  practiceTip3: "ขอคำอธิบายหากมีสิ่งที่คุณไม่เข้าใจ",
  practiceTip4: "ใช้คำที่คุณเพิ่งเรียนรู้เมื่อเร็ว ๆ นี้",
  practiceTip5: "AI ของเราจะปรับให้เข้ากับระดับทักษะของคุณ",

  // Practice Guide - using exact same keys as shown in the UI
  "Try to form complete sentences, even if they're simple.": "พยายามสร้างประโยคสมบูรณ์ แม้ว่าจะง่าย ๆ ก็ตาม",
  "Don't worry about mistakes — they're part of learning!": "ไม่ต้องกังวลเกี่ยวกับข้อผิดพลาด — พวกมันเป็นส่วนหนึ่งของการเรียนรู้!",
  "Ask for explanations if there's something you don't understand.": "ขอคำอธิบายหากมีสิ่งที่คุณไม่เข้าใจ",
  "Use words you've learned recently.": "ใช้คำที่คุณเพิ่งเรียนรู้เมื่อเร็ว ๆ นี้",
  "Our AI will adapt to your skill level and gradually help you improve.": "AI ของเราจะปรับให้เข้ากับระดับทักษะของคุณและช่วยให้คุณพัฒนาอย่างค่อยเป็นค่อยไป",
  "Here are some tips to get the most out of your {{language}} practice:": "เคล็ดลับเหล่านี้จะช่วยให้คุณได้รับประโยชน์สูงสุดจากการฝึกฝน {{language}}:",

  // Hint button
  suggestionResponses: "คำตอบที่แนะนำ",
  responseSuggestions: "คำแนะนำในการตอบกลับ",
  clickPlayToHearPronunciation: "คลิกเล่นเพื่อฟังการออกเสียง",
  startConversationForSuggestions: "เริ่มสนทนาเพื่อดูคำแนะนำ",
  startConversationToSeeSuggestions: "เริ่มสนทนาเพื่อดูคำแนะนำ",
  getResponseSuggestions: "รับคำแนะนำในการตอบกลับ",
  greetings: "การทักทาย",
  questions: "คำถาม",
  error: "ข้อผิดพลาด",
  couldNotGenerateHints: "ไม่สามารถสร้างคำแนะนำได้",
  failedToPlayAudio: "เล่นเสียงไม่สำเร็จ",
  play: "เล่น",

  // Voice chat
  unlimitedVoicePractice: "ฝึกพูดไม่จำกัด",
  practiceDescription: "คำอธิบายการฝึกฝน",
  aiModelInfo: "ข้อมูลโมเดล AI: OpenAI GPT-4o-mini สำหรับความเข้าใจและการสร้างภาษาตามธรรมชาติ, TTS ในเบราว์เซอร์สำหรับการตอบสนองด้วยเสียง",
  practiceLevel: "ระดับการฝึกฝน",
  intermediatePracticeLevel: "ระดับกลาง — สามารถพูดคุยหัวข้อที่คุ้นเคย",
  "Intermediate - Can discuss familiar topics": "ระดับกลาง — สามารถพูดคุยหัวข้อที่คุ้นเคย",

  // CEFR Level Descriptions
  cefrB1Description: "ระดับกลาง — สามารถพูดคุยหัวข้อที่คุ้นเคย",
  cefrA1Description: "ผู้เริ่มต้น — ประโยคและวลีพื้นฐาน",
  cefrA2Description: "ระดับประถม — การสนทนาในชีวิตประจำวันง่าย ๆ",
  cefrB2Description: "ระดับกลางตอนปลาย — สามารถสื่อสารได้อย่างคล่องแคล่ว",

  currentLanguage: "ภาษาปัจจุบัน",
  practiceLanguage: "ภาษาที่ฝึก",
  startSpeaking: "เริ่มพูด",
  stopListening: "หยุดฟัง",
  listeningNow: "กำลังฟังอยู่",
  youSaid: "คุณพูดว่า",
  conversationStarters: "คำเริ่มต้นสนทนา",
  howToStartConversation: "วิธีเริ่มการสนทนา",
  tryThesePhrases: "ลองใช้วลีเหล่านี้:",
  conversationStarter1: "สวัสดี! วันนี้คุณเป็นอย่างไรบ้าง?",
  conversationStarter2: "อากาศเป็นอย่างไรบ้างที่คุณอยู่?",
  conversationStarter3: "คุณแนะนำร้านอาหารดี ๆ ได้ไหม?",
  conversationStarter4: "งานอดิเรกและความสนใจของคุณคืออะไร?",
  conversationStarter5: "เล่าให้ฟังเกี่ยวกับหนังสือหรือภาพยนตร์โปรดของคุณ",
  conversationStarter6: "คุณทำอะไรเมื่อสุดสัปดาห์ที่แล้ว?",
  conversationStarter7: "แผนของคุณสำหรับพรุ่งนี้คืออะไร?",
  conversationStarter8: "พูดว่า... เป็นภาษาสเปน/อังกฤษอย่างไร?",

  // Voice chat phrases that appear in the UI exactly as shown
  "Hello, how are you today?": "สวัสดี วันนี้คุณเป็นอย่างไรบ้าง?",
  "What's the weather like where you are?": "อากาศเป็นอย่างไรบ้างที่คุณอยู่?",
  "Can you recommend a good restaurant?": "คุณแนะนำร้านอาหารดี ๆ ได้ไหม?",
  "What are your hobbies and interests?": "งานอดิเรกและความสนใจของคุณคืออะไร?",
  "Tell me about your favorite book or movie.": "เล่าให้ฟังเกี่ยวกับหนังสือหรือภาพยนตร์โปรดของคุณ",
  "What did you do last weekend?": "คุณทำอะไรเมื่อสุดสัปดาห์ที่แล้ว?",
  "What are your plans for tomorrow?": "แผนของคุณสำหรับพรุ่งนี้คืออะไร?",
  "How do you say... in Spanish/English?": "พูดว่า... เป็นภาษาสเปน/อังกฤษอย่างไร?",

  practiceWithVoiceChat: "ฝึกด้วยการแชทด้วยเสียง",
  voiceChatTips: "ใช้เครื่องมือนี้เพื่อพัฒนาทักษะการพูดและฟังของคุณ นี่คือเคล็ดลับบางส่วน:",
  voiceTip1: "ถามคำถามเกี่ยวกับหัวข้อในชีวิตประจำวัน",
  voiceTip2: "ฝึกวลีและสำนวนที่ใช้บ่อย",
  voiceTip3: "บรรยายสิ่งที่คุณเห็นรอบตัว",
  voiceTip4: "ฝึกคำศัพท์สำหรับหัวข้อเฉพาะ เช่น การเดินทางหรืออาหาร",

  // Voice chat tips that appear exactly as shown in the UI
  "Use this tool to improve your speaking and listening skills. Here are some tips:": "ใช้เครื่องมือนี้เพื่อพัฒนาทักษะการพูดและฟังของคุณ นี่คือเคล็ดลับบางส่วน:",
  "Ask questions about everyday topics": "ถามคำถามเกี่ยวกับหัวข้อในชีวิตประจำวัน",
  "Practice common phrases and expressions": "ฝึกวลีและสำนวนที่ใช้บ่อย",
  "Describe what you see around you": "บรรยายสิ่งที่คุณเห็นรอบตัว",
  "Practice vocabulary for specific topics like travel or food": "ฝึกคำศัพท์สำหรับหัวข้อเฉพาะ เช่น การเดินทางหรืออาหาร",

  // Additional voice chat translations
  startSpeakingToSeeTranscript: "เริ่มพูดเพื่อดูการถอดความ",
  clickMicrophoneToStartRecording: "คลิกไมโครโฟนเพื่อเริ่มบันทึก",

  // Premium Voice Chat
  premiumVoiceChat: "การแชทด้วยเสียงพรีเมียม",
  premiumVoiceChatBenefits: "ประโยชน์ของการแชทด้วยเสียงพรีเมียม",
  premiumVoiceChatDescription: "ฝึก {{practice}} ในการสนทนาด้วยเสียงตามธรรมชาติกับผู้สอน AI พรีเมียม! AI จะช่วยคุณปรับปรุงไวยากรณ์ คำศัพท์ และการออกเสียง",
  premiumVoiceNote: "การแชทด้วยเสียงพรีเมียมจำกัดที่ 10 นาทีต่อสัปดาห์",
  premiumVoiceNoteWithReset: "การแชทด้วยเสียงพรีเมียมให้การฝึกฝน 10 นาทีต่อสัปดาห์ เวลาจะรีเซ็ตทุกวันจันทร์เวลา 6:00 น. (เวลากลาง)",
  benefitNaturalVoice: "การปฏิสัมพันธ์ด้วยเสียงที่เป็นธรรมชาติเหมือนมนุษย์ด้วยเทคโนโลยี ElevenLabs",
  benefitAccentPronunciation: "การออกเสียงและสำเนียงที่ถูกต้องสำหรับการเรียนรู้อย่างลึกซึ้ง",
  benefitRegularPractice: "การฝึกฝน 10 นาทีต่อสัปดาห์ รีเซ็ตทุกวันจันทร์เวลา 6:00 น.",

  // Pronunciation practice
  pronunciationPractice: "ฝึกการออกเสียง",
  improvePronunciationSkillsWith: "ปรับปรุงทักษะการออกเสียงของคุณด้วยการฝึกฝนเป้าหมาย",
  selectComplexityLevel: "เลือกระดับความซับซ้อน",
  chooseDifficultyLevelBasedOn: "เลือกระดับความยากตามความสามารถทางภาษาของคุณ",
  speechRate: "อัตราการพูด",
  selectLevelToStart: "เลือกระดับเพื่อเริ่มการฝึกฝน",
  startExercise: "เริ่มการฝึก",
  pronunciationPracticeTips: "เคล็ดลับการฝึกการออกเสียง",
  listenCarefullyTip: "ฟังอย่างระมัดระวังก่อนที่จะพยายามพูด",
  payAttentionToStressTip: "ใส่ใจกับการเน้นเสียงและการขึ้นลงของเสียง",
  practiceDifficultSoundsTip: "ฝึกเสียงยาก ๆ หลาย ๆ ครั้ง",
  recordYourselfTip: "บันทึกตัวเองและเปรียบเทียบกับเจ้าของภาษา",
  bePatientTip: "อดทน — การปรับปรุงการออกเสียงต้องใช้เวลา",
  practiceExercise: "การฝึกฝน",
  topic: "หัวข้อ",
  listenToPhrase: "ฟังวลี",
  clickWordToHear: "คลิกคำเพื่อฟัง",
  yourPronunciation: "การออกเสียงของคุณ",
  startRecording: "เริ่มบันทึก",
  clickStartToRecord: "คลิก 'เริ่ม' เพื่อบันทึก",
  tryAgain: "ลองใหม่อีกครั้ง",
  newPhrase: "วลีใหม่",
  generatingExercise: "กำลังสร้างการฝึกฝน",
  generatingNewPhrase: "กำลังสร้างวลีใหม่",
  levelDescription: "คำอธิบายระดับ",
  failedToGeneratePhrase: "ไม่สามารถสร้างวลี",
  noSpeechDetected: "ไม่พบเสียงพูด",
  pleaseTryAgain: "กรุณาลองอีกครั้ง",
  failedToAnalyzePronunciation: "ไม่สามารถวิเคราะห์การออกเสียง",

  // Additional pronunciation feedback translations
  pronunciationFeedback: "ข้อเสนอแนะการออกเสียง",
  accuracyScore: "คะแนนความแม่นยำ",
  intonationScore: "คะแนนการขึ้นลงของเสียง",
  fluencyScore: "คะแนนความคล่องแคล่ว",
  complexityScore: "คะแนนความซับซ้อน",
  wordAnalysis: "การวิเคราะห์คำ",
  phonemeAnalysis: "การวิเคราะห์หน่วยเสียง",
  overallFeedback: "ข้อเสนอแนะโดยรวม",
  excellent: "ยอดเยี่ยม",
  good: "ดี",
  fair: "พอใช้",
  needsImprovement: "ต้องปรับปรุง",

  // Additional UI elements
  processing: "กำลังประมวลผล",
  stopRecording: "หยุดบันทึก",
  listeningToYou: "กำลังฟังคุณ",
  realTimeTranscription: "การถอดความแบบเรียลไทม์",
  yourTranscription: "การถอดความของคุณ",
  playing: "กำลังเล่น",

  // Complexity levels
  novice: "ผู้เริ่มต้น",
  intermediate: "ระดับกลาง",
  advanced: "ขั้นสูง",
  superior: "ยอดเยี่ยม",
  noviceLevelDescription: "สามารถจัดการกับหัวข้อง่าย ๆ ที่คุ้นเคย",
  intermediateLevelDescription: "สามารถพูดคุยเกี่ยวกับหัวข้อที่คุ้นเคย",
  advancedLevelDescription: "สามารถจัดการกับหัวข้อที่ซับซ้อนด้วยความมั่นใจ",
  superiorLevelDescription: "สามารถปฏิบัติฟังก์ชันทางภาษาทั้งหมด",
  noviceLevelShortDescription: "ประโยคง่าย ๆ",
  intermediateLevelShortDescription: "หัวข้อที่คุ้นเคย",
  advancedLevelShortDescription: "หัวข้อที่ซับซ้อน",
  superiorLevelShortDescription: "ฟังก์ชันทั้งหมด",

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
