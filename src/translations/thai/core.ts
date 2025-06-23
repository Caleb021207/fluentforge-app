
import { TranslationRecord } from "../types";

// Clean, focused Thai translations for core UI elements only
const thaiCoreTranslations: TranslationRecord = {
  // Navigation elements
  "home": "หน้าแรก",
  "practice": "ฝึกฝน", 
  "textPractice": "ฝึกฝนข้อความ",
  "unlimitedVoicePractice": "ฝึกฝนเสียงไม่จำกัด",
  "voiceChat": "แชทเสียง",
  "pronunciationPractice": "ฝึกฝนการออกเสียง",
  "logout": "ออกจากระบบ",
  "login": "เข้าสู่ระบบ",
  "signIn": "ลงชื่อเข้าใช้",
  "createAccount": "สร้างบัญชี",
  
  // Home page elements
  "welcomeToLanguageLearning": "ยินดีต้อนรับสู่การเรียนรู้ภาษา",
  "yourPersonalAICompanion": "เพื่อนคู่ใจ AI ส่วนตัวของคุณสำหรับการเรียนรู้ภาษา", 
  "swipeUpToGetStarted": "เลื่อนขึ้นเพื่อเริ่มต้น",
  "getStarted": "เริ่มต้น",
  "goToDashboard": "ไปที่แดชบอร์ด",
  
  // Text practice page
  "practiceYourLanguage": "ฝึกฝน{{language}}ของคุณ",
  "chatWithAI": "แชทกับ AI ของเราเพื่อฝึกฝน{{language}}! AI จะช่วยแก้ไขไวยากรณ์ คำศัพท์ของคุณ และให้คำแนะนำเกี่ยวกับการออกเสียงและวัฒนธรรม{{language}}",
  "startConversationIn": "เริ่มการสนทนาใน{{language}}",
  "practiceGuide": "คู่มือฝึกฝน{{language}}",
  "practiceGuideDescription": "นี่คือเคล็ดลับบางอย่างเพื่อให้ได้ประโยชน์สูงสุดจากการฝึกฝน{{language}}ของคุณ:",
  "practiceGuideItem1": "พยายามสร้างประโยคที่สมบูรณ์ แม้ว่าจะเรียบง่าย",
  "practiceGuideItem2": "ไม่ต้องกังวลเกี่ยวกับข้อผิดพลาด - มันเป็นส่วนหนึ่งของการเรียนรู้!",
  "practiceGuideItem3": "ขอคำอธิบายหากมีสิ่งที่คุณไม่เข้าใจ",
  "practiceGuideItem4": "ใช้คำที่คุณเพิ่งเรียนรู้เมื่อเร็วๆ นี้",
  "practiceDisclaimer": "AI ของเราจะปรับให้เข้ากับระดับทักษะของคุณและช่วยให้คุณพัฒนาอย่างค่อยเป็นค่อยไป",
  "startTextChatting": "เริ่มแชทข้อความ",
  "typeMessageToPractice": "พิมพ์ข้อความของคุณเพื่อฝึกฝน{{language}}...",
  "send": "ส่ง",
  "clearConversation": "ล้างการสนทนา",
  "correctGrammar": "แก้ไขไวยากรณ์",
  
  // Voice chat page
  "freePracticeWithVoice": "ฝึกฝนฟรีด้วยเสียง",
  "startSpeaking": "เริ่มพูด",
  "listeningNow": "กำลังฟังอยู่",
  "youSaid": "คุณพูดว่า",
  "aiResponse": "การตอบสนองของ AI",
  "conversationStarters": "เริ่มต้นการสนทนา",
  "tryThesePhrases": "ลองใช้วลีเหล่านี้เพื่อเริ่มการสนทนา:",
  "practiceWithVoiceChat": "ฝึกฝนด้วยแชทเสียง",
  "useThisTool": "ใช้เครื่องมือนี้เพื่อพัฒนาทักษะการพูดและการฟังของคุณ นี่คือเคล็ดลับบางอย่าง:",
  "askQuestionsAboutTopics": "ถามคำถามเกี่ยวกับหัวข้อในชีวิตประจำวัน",
  "practiceEverydayPhrases": "ฝึกฝนวลีและการแสดงออกทั่วไป", 
  "describeWhatYouSee": "อธิบายสิ่งที่คุณเห็นรอบตัวคุณ",
  "practiceVocabularyForSpecific": "ฝึกฝนคำศัพท์สำหรับหัวข้อเฉพาะเช่นการเดินทางหรืออาหาร",
  "responseSuggestions": "ข้อเสนอแนะการตอบสนอง",
  "clickPlayToHear": "คลิกเล่นเพื่อฟังการออกเสียง",
  "startConversationToSee": "เริ่มการสนทนาเพื่อดูข้อเสนอแนะ",
  
  // Pronunciation practice page
  "improvePronunciationSkillsWith": "พัฒนาทักษะการออกเสียงของคุณด้วยแบบฝึกหัดที่มีเป้าหมาย",
  "selectComplexityLevel": "เลือกระดับความซับซ้อน",
  "chooseDifficultyLevelBasedOn": "เลือกระดับความยากตามความสามารถทางภาษาของคุณ", 
  "selectLevelToStart": "เลือกระดับเพื่อเริ่มฝึกฝน",
  "pronunciationPracticeTips": "เคล็ดลับการฝึกฝนการออกเสียง",
  "listenCarefullyTip": "ฟังเสียงอย่างระมัดระวังก่อนพยายามพูด",
  "payAttentionToStressTip": "ใส่ใจกับรูปแบบการเน้นเสียงและการขึ้นลงของเสียง",
  "practiceDifficultSoundsTip": "ฝึกฝนเสียงที่ยากหลายครั้ง",
  "recordYourselfTip": "บันทึกตัวเองและเปรียบเทียบกับเจ้าของภาษา",
  "bePatientTip": "อดทน - การพัฒนาการออกเสียงใช้เวลา",
  "novice": "ผู้เริ่มต้น",
  "intermediate": "ระดับกลาง", 
  "advanced": "ระดับสูง",
  "superior": "ระดับเยี่ยม",
  "startExercise": "เริ่มแบบฝึกหัด",
  "speechRate": "อัตราการพูด",
  
  // Common UI elements
  "loading": "กำลังโหลด...",
  "error": "ข้อผิดพลาด",
  "cancel": "ยกเลิก",
  "save": "บันทึก",
  "back": "กลับ",
  "continue": "ดำเนินการต่อ",
  "processing": "กำลังประมวลผล..."
};

export default thaiCoreTranslations;
